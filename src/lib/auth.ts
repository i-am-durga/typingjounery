import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or password");
                }

                await connectDB();

                const user = await User.findOne({ email: credentials.email });

                if (!user || !user.passwordHash) {
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );

                if (!isPasswordValid) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google" && user.email) {
                await connectDB();
                const existingUser = await User.findOne({ email: user.email });

                if (!existingUser) {
                    await User.create({
                        email: user.email,
                        name: user.name || "User",
                        googleId: account.providerAccountId,
                    });
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                if (account?.provider === "google") {
                    await connectDB();
                    const dbUser = await User.findOne({ email: user.email });
                    if (dbUser) {
                        token.id = dbUser._id.toString();
                    }
                } else {
                    token.id = user.id;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                Object.assign(session.user, { id: token.id });
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
    },
};

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Session } from "@/models/Session";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user?.isAdmin) return null;
    return user;
}

// GET all users (admin only)
export async function GET(req: Request) {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";

        const query = search
            ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
            : {};

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select("-passwordHash")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Get session counts per user
        const userIds = users.map(u => u._id);
        const sessionCounts = await Session.aggregate([
            { $match: { userId: { $in: userIds } } },
            { $group: { _id: "$userId", count: { $sum: 1 }, avgWpm: { $avg: "$wpm" } } }
        ]);
        const sessionMap = new Map(sessionCounts.map(s => [s._id.toString(), s]));

        const enrichedUsers = users.map(u => ({
            ...u,
            sessionCount: sessionMap.get(u._id.toString())?.count || 0,
            avgWpm: Math.round(sessionMap.get(u._id.toString())?.avgWpm || 0),
        }));

        return NextResponse.json({ users: enrichedUsers, total, page, pages: Math.ceil(total / limit) });

    } catch (error) {
        console.error("Admin users fetch error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// DELETE a user (admin only)
export async function DELETE(req: Request) {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { userId } = await req.json();
        if (!userId) return NextResponse.json({ message: "userId required" }, { status: 400 });
        if (userId === admin._id.toString()) {
            return NextResponse.json({ message: "Cannot delete your own admin account" }, { status: 400 });
        }

        await User.findByIdAndDelete(userId);
        await Session.deleteMany({ userId });

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Admin delete user error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// PATCH toggle admin / toggle ban
export async function PATCH(req: Request) {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { userId, action } = await req.json();
        if (!userId || !action) return NextResponse.json({ message: "userId and action required" }, { status: 400 });

        let update: Record<string, unknown> = {};
        if (action === "toggleAdmin") {
            const user = await User.findById(userId);
            update = { isAdmin: !user?.isAdmin };
        }

        const updated = await User.findByIdAndUpdate(userId, update, { new: true }).select("-passwordHash");
        return NextResponse.json({ user: updated });
    } catch {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

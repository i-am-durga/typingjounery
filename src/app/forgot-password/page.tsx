"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<"email" | "sent">("email");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            // Always show success (don't leak whether email exists)
            setStep("sent");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title={step === "email" ? "Forgot Password?" : "Check Your Email"}
            subtitle={
                step === "email"
                    ? "No worries. Enter your email and we'll send you a reset link."
                    : `We sent a reset link to ${email}`
            }
        >
            <AnimatePresence mode="wait">
                {step === "email" ? (
                    <motion.form
                        key="email-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">Email address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="bg-navy border-white/10 text-white pl-10 focus-visible:ring-primary"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-hover text-navy font-bold h-12"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Sending...</span>
                            ) : "Send Reset Link →"}
                        </Button>

                        <div className="text-center">
                            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1 justify-center">
                                <ArrowLeft className="w-3 h-3" /> Back to login
                            </Link>
                        </div>
                    </motion.form>
                ) : (
                    <motion.div
                        key="sent"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 mx-auto">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>

                        <div>
                            <p className="text-gray-300 text-sm leading-relaxed mb-2">
                                If an account exists for <strong className="text-white">{email}</strong>, you will receive a password reset link shortly.
                            </p>
                            <p className="text-gray-500 text-xs">
                                The link expires in 15 minutes. Check your spam folder if you don&apos;t see it.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => { setStep("email"); setEmail(""); }}
                                className="text-sm text-primary hover:underline"
                            >
                                Try a different email
                            </button>
                            <div>
                                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1 justify-center">
                                    <ArrowLeft className="w-3 h-3" /> Back to login
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
}

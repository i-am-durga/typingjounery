"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle, RefreshCw, AlertTriangle } from "lucide-react";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [step, setStep] = useState<"form" | "success" | "invalid">("form");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) setStep("invalid");
    }, [token]);

    const getPasswordStrength = (pwd: string) => {
        if (!pwd) return null;
        if (pwd.length < 6) return { label: "Too short", color: "bg-red-500", width: "20%" };
        if (pwd.length < 8) return { label: "Weak", color: "bg-orange-500", width: "40%" };
        if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) return { label: "Strong", color: "bg-green-500", width: "100%" };
        return { label: "Medium", color: "bg-yellow-500", width: "65%" };
    };

    const strength = getPasswordStrength(newPassword);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Reset failed. The link may have expired.");
            } else {
                setStep("success");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title={step === "success" ? "Password Reset!" : step === "invalid" ? "Invalid Link" : "Create New Password"}
            subtitle={
                step === "invalid"
                    ? "This reset link is invalid or has expired."
                    : step === "success"
                        ? "Your password has been updated successfully."
                        : "Choose a strong password for your account."
            }
        >
            <AnimatePresence mode="wait">
                {step === "invalid" && (
                    <motion.div key="invalid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 mx-auto">
                            <AlertTriangle className="w-10 h-10 text-red-400" />
                        </div>
                        <p className="text-gray-400 text-sm">The link is invalid or has expired (links expire after 15 minutes).</p>
                        <Link href="/forgot-password">
                            <Button className="w-full bg-primary hover:bg-primary-hover text-navy font-bold h-12">
                                Request a new link →
                            </Button>
                        </Link>
                    </motion.div>
                )}

                {step === "success" && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 mx-auto">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                        <p className="text-gray-300 text-sm">You can now sign in with your new password.</p>
                        <Button className="w-full bg-primary hover:bg-primary-hover text-navy font-bold h-12"
                            onClick={() => router.push("/login")}>
                            Sign In Now →
                        </Button>
                    </motion.div>
                )}

                {step === "form" && (
                    <motion.form key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-gray-300">New Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min. 8 characters"
                                    className="bg-navy border-white/10 text-white pr-10 focus-visible:ring-primary"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {strength && (
                                <div className="space-y-1">
                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: strength.width }}
                                            className={`h-full rounded-full ${strength.color} transition-all`} />
                                    </div>
                                    <p className={`text-xs ${strength.color.replace("bg-", "text-")}`}>{strength.label}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Confirm Password</Label>
                            <Input
                                type="password"
                                placeholder="Repeat your password"
                                className="bg-navy border-white/10 text-white focus-visible:ring-primary"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-xs text-red-400">Passwords don&apos;t match</p>
                            )}
                        </div>

                        <Button type="submit"
                            className="w-full bg-primary hover:bg-primary-hover text-navy font-bold h-12"
                            disabled={isLoading}>
                            {isLoading ? (
                                <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</span>
                            ) : "Set New Password →"}
                        </Button>
                    </motion.form>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
}

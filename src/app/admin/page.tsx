"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Users, Shield, Trash2, Search, RefreshCw, ChevronLeft, ChevronRight,
    UserCheck, Star, Activity
} from "lucide-react";
import Link from "next/link";

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    currentLevel: number;
    totalXP: number;
    streak: number;
    isAdmin: boolean;
    isEmailVerified: boolean;
    sessionCount: number;
    avgWpm: number;
    createdAt: string;
}

interface AdminStats {
    total: number;
    pages: number;
    page: number;
}

export default function AdminPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState<AdminStats>({ total: 0, pages: 1, page: 1 });
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState("");

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/users?page=${page}&limit=15&search=${encodeURIComponent(search)}`);
            if (res.status === 403) { setAccessDenied(true); return; }
            const data = await res.json();
            setUsers(data.users || []);
            setStats({ total: data.total, pages: data.pages, page: data.page });
        } catch {
            setAccessDenied(true);
        } finally {
            setIsLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        if (session) fetchUsers();
    }, [session, fetchUsers]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
        setActionLoading(userId);
        try {
            const res = await fetch("/api/admin/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u._id !== userId));
                showToast("User deleted");
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleAdmin = async (userId: string) => {
        setActionLoading(userId);
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action: "toggleAdmin" }),
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, isAdmin: data.user.isAdmin } : u));
                showToast(`Admin status updated`);
            }
        } finally {
            setActionLoading(null);
        }
    };

    if (!session) return <div className="p-12 text-center text-gray-500">Loading...</div>;

    if (accessDenied) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <Shield className="w-16 h-16 text-red-400 mb-4" />
                <h1 className="text-3xl font-heading font-black text-white mb-2">Access Denied</h1>
                <p className="text-gray-400 mb-6">You don&apos;t have admin privileges.</p>
                <Link href="/dashboard">
                    <Button className="bg-primary text-navy font-bold">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const levelBadge = (level: number) => {
        const colors = ["", "bg-gray-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"];
        const labels = ["", "Beginner", "Intermediate", "Advanced", "Expert"];
        return (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${colors[level] || "bg-gray-500"}`}>
                {labels[level] || "?"}
            </span>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Toast */}
            {toast && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="fixed top-24 right-6 z-50 bg-green-500/20 border border-green-500/50 backdrop-blur text-green-300 px-4 py-3 rounded-xl text-sm font-medium shadow-xl">
                    ✓ {toast}
                </motion.div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-heading font-black text-white mb-1">
                        Admin <span className="text-primary neon-text-primary">Panel</span>
                    </h1>
                    <p className="text-gray-400 text-sm">Manage users and platform settings</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                    <Link href="/dashboard">
                        <Button variant="outline" className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
                            ← Dashboard
                        </Button>
                    </Link>
                    <Button onClick={fetchUsers} variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 gap-2">
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Users", value: stats.total, icon: Users, color: "text-primary" },
                    { label: "Page", value: `${stats.page} / ${stats.pages}`, icon: Activity, color: "text-secondary" },
                    { label: "Admins", value: users.filter(u => u.isAdmin).length, icon: Shield, color: "text-purple-400" },
                    { label: "Verified", value: users.filter(u => u.isEmailVerified).length, icon: UserCheck, color: "text-green-400" },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="bg-navy-light border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</span>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* User Table */}
            <div className="bg-navy-light border border-white/10 rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 border-b border-white/10 gap-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" /> All Users
                    </h2>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9 bg-navy border-white/10 text-white text-sm focus-visible:ring-primary"
                        />
                    </div>
                </div>

                {/* Loading */}
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" /> Loading users...
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No users found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 text-xs uppercase tracking-wider bg-navy-dark/50">
                                    <th className="px-5 py-3">User</th>
                                    <th className="px-5 py-3">Level</th>
                                    <th className="px-5 py-3">XP</th>
                                    <th className="px-5 py-3">Sessions</th>
                                    <th className="px-5 py-3">Avg WPM</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Joined</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, i) => (
                                    <motion.tr key={user._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center text-sm font-bold text-white border border-white/10 flex-shrink-0">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white flex items-center gap-1.5">
                                                        {user.name}
                                                        {user.isAdmin && <Shield className="w-3 h-3 text-purple-400" aria-label="Admin" />}
                                                    </div>
                                                    <div className="text-gray-500 text-xs">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">{levelBadge(user.currentLevel)}</td>
                                        <td className="px-5 py-4 font-mono text-secondary font-bold">{user.totalXP.toLocaleString()}</td>
                                        <td className="px-5 py-4 text-gray-300">{user.sessionCount}</td>
                                        <td className="px-5 py-4 font-mono text-primary font-bold">{user.avgWpm}</td>
                                        <td className="px-5 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.isEmailVerified ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                                                {user.isEmailVerified ? "✓ Verified" : "Unverified"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-500 text-xs">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleAdmin(user._id)}
                                                    disabled={!!actionLoading}
                                                    title={user.isAdmin ? "Remove Admin" : "Make Admin"}
                                                    className={`p-1.5 rounded-lg transition-colors ${user.isAdmin ? "text-purple-400 hover:bg-purple-500/10" : "text-gray-500 hover:text-purple-400 hover:bg-purple-500/10"}`}>
                                                    <Star className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id, user.name)}
                                                    disabled={!!actionLoading}
                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                                    {actionLoading === user._id
                                                        ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                        : <Trash2 className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {stats.pages > 1 && (
                    <div className="flex items-center justify-between p-5 border-t border-white/10">
                        <span className="text-sm text-gray-500">{stats.total} total users</span>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 h-8 w-8 p-0"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm text-white font-mono px-2">{page} / {stats.pages}</span>
                            <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 h-8 w-8 p-0"
                                onClick={() => setPage(p => Math.min(stats.pages, p + 1))}
                                disabled={page === stats.pages}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

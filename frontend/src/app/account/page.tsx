"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { User, Mail, Phone, ShieldCheck, Pencil, X, Check, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AccountPage() {
    const { user, token, updateUser, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({ name: "", phone: "" });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-secondary)]" />
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    const startEditing = () => {
        setForm({ name: user?.name || "", phone: user?.phone || "" });
        setError("");
        setSuccess("");
        setEditing(true);
    };

    const cancelEditing = () => {
        setEditing(false);
        setError("");
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            setError("Name cannot be empty.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: form.name, phone: form.phone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update profile");
            updateUser({ name: data.user.name, phone: data.user.phone });
            setSuccess("Profile updated successfully!");
            setEditing(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="container max-w-2xl px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Account</h1>
                    <p className="text-slate-500 mt-1">Manage your profile information</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Avatar Banner */}
                    <div className="h-24 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />
                    <div className="px-8 pb-8">
                        <div className="-mt-10 mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-[var(--color-primary)]">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        {success && (
                            <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                                <Check size={16} />
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                                <X size={16} />
                                {error}
                            </div>
                        )}

                        {!editing ? (
                            /* VIEW MODE */
                            <div className="space-y-5">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                                        <User size={20} className="text-[var(--color-primary)]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Full Name</p>
                                        <p className="text-slate-900 font-semibold mt-0.5">{user?.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                                        <Mail size={20} className="text-[var(--color-primary)]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Email Address</p>
                                        <p className="text-slate-900 font-semibold mt-0.5">{user?.email}</p>
                                    </div>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Cannot change</span>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                                        <Phone size={20} className="text-[var(--color-primary)]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Phone Number</p>
                                        <p className="text-slate-900 font-semibold mt-0.5">{user?.phone || "—"}</p>
                                    </div>
                                </div>

                                <Button onClick={startEditing} className="w-full gap-2 mt-2">
                                    <Pencil size={16} />
                                    Edit Profile
                                </Button>
                            </div>
                        ) : (
                            /* EDIT MODE */
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            value={user?.email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Email address cannot be changed.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                                            placeholder="Your phone number"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={cancelEditing}
                                        disabled={saving}
                                        className="flex-1 gap-2"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 gap-2"
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                        {saving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

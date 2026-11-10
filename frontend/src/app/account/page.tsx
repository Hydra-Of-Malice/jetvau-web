"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { User, Mail, Phone, Pencil, X, Check, Loader2 } from "lucide-react";
import { apiPut } from "@/lib/api";

export default function AccountPage() {
    const { user, token, updateUser, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({ name: "", phone: "" });

    // Redirect in an effect: calling router.push during render is not allowed
    useEffect(() => {
        if (!loading && !isAuthenticated) router.replace("/login?next=/account");
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" aria-label="Loading" />
            </div>
        );
    }

    if (!isAuthenticated) {
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
            setError("Name cannot be empty");
            return;
        }
        if (!/^\d{10}$/.test(form.phone.trim())) {
            setError("Phone number must be 10 digits");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const data = await apiPut("/auth/me", { name: form.name.trim(), phone: form.phone.trim() }, token);
            updateUser({ name: data.user.name, phone: data.user.phone });
            setSuccess("Profile updated");
            setEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="container max-w-2xl px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My account</h1>
                    <p className="text-slate-500 mt-1">Manage your profile information</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Avatar Banner */}
                    <div className="h-24 bg-primary" />
                    <div className="px-8 pb-8">
                        <div className="-mt-10 mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-primary">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        {success && (
                            <div role="status" className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                                <Check size={16} />
                                {success}
                            </div>
                        )}
                        {error && (
                            <div role="alert" className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                                <X size={16} />
                                {error}
                            </div>
                        )}

                        {!editing ? (
                            /* VIEW MODE */
                            <div className="space-y-5">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <User size={20} className="text-primary" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Full name</p>
                                        <p className="text-slate-900 font-semibold mt-0.5">{user?.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Mail size={20} className="text-primary" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-500 font-medium">Email address</p>
                                        <p className="text-slate-900 font-semibold mt-0.5">{user?.email}</p>
                                    </div>
                                    <span className="text-xs text-slate-400">Cannot be changed</span>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Phone size={20} className="text-primary" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Phone number</p>
                                        <p className="text-slate-900 font-semibold mt-0.5">{user?.phone || "—"}</p>
                                    </div>
                                </div>

                                <Button onClick={startEditing} className="w-full gap-2 mt-2">
                                    <Pencil size={16} />
                                    Edit profile
                                </Button>
                            </div>
                        ) : (
                            /* EDIT MODE */
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="account-name" className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="account-name"
                                            type="text"
                                            autoComplete="name"
                                            value={form.name}
                                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-colors"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="account-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="account-email"
                                            type="email"
                                            value={user?.email ?? ""}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Email address cannot be changed</p>
                                </div>

                                <div>
                                    <label htmlFor="account-phone" className="block text-sm font-medium text-slate-700 mb-1.5">Phone number</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="account-phone"
                                            type="tel"
                                            inputMode="numeric"
                                            autoComplete="tel-national"
                                            value={form.phone}
                                            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-colors"
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
                                        {saving ? "Saving" : "Save changes"}
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getSafeNextPath } from "@/lib/redirect";
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";

const inputClass =
    "w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            router.push(getSafeNextPath("/"));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Sign in</h1>
                    <p className="text-gray-500 mt-2">Sign in to your JetVau account</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-5"
                >
                    {error && (
                        <div role="alert" className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                            <AlertCircle size={16} className="flex-shrink-0" aria-hidden="true" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                aria-hidden="true"
                            />
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClass}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                aria-hidden="true"
                            />
                            <input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClass}
                                placeholder="Your password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" aria-label="Signing in" />
                        ) : (
                            <>
                                <LogIn size={18} aria-hidden="true" />
                                Sign in
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="text-secondary font-semibold hover:underline"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}

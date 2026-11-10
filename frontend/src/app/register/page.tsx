"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Phone, Lock, UserPlus, AlertCircle, Info } from "lucide-react";

const ALLOWED_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"];

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address")
        .refine((val) => {
            const domain = val.split("@")[1];
            return ALLOWED_DOMAINS.includes(domain?.toLowerCase());
        }, `Please use a common email provider (${ALLOWED_DOMAINS.map(d => d.split('.')[0]).join(', ')})`),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(16, "Password must be at most 16 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const {
        register: formRegister,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setError("");
        setLoading(true);

        try {
            await register(data.name, data.email, data.phone, data.password);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-500 mt-2">
                        Join JetVau Aerospace and start your drone training journey
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-5"
                >
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Full Name
                        </label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                {...formRegister("name")}
                                type="text"
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                placeholder="John Doe"
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                {...formRegister("email")}
                                type="email"
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                placeholder="you@gmail.com"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                {...formRegister("phone")}
                                type="tel"
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                placeholder="9876543210"
                            />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative group flex items-center">
                                <Info size={14} className="text-gray-400 hover:text-gray-600 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                    <p className="font-semibold mb-1">Password Policy:</p>
                                    <ul className="space-y-1 list-disc pl-4 text-gray-300">
                                        <li>8 to 16 characters long</li>
                                        <li>At least 1 uppercase letter</li>
                                        <li>At least 1 lowercase letter</li>
                                        <li>At least 1 number</li>
                                        <li>At least 1 special character</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                {...formRegister("password")}
                                type="password"
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                placeholder="Enter Password"
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 font-medium leading-tight">{errors.password.message}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit" disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 mt-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[var(--color-secondary)] font-semibold hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { getSafeNextPath } from "@/lib/redirect";
import { User, Mail, Phone, Lock, UserPlus, AlertCircle, Loader2 } from "lucide-react";

const ALLOWED_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"];

const registerSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Invalid email address")
        .refine((val) => {
            const domain = val.split("@")[1];
            return ALLOWED_DOMAINS.includes(domain?.toLowerCase());
        }, `Please use a common email provider (${ALLOWED_DOMAINS.map(d => d.split('.')[0]).join(', ')})`),
    phone: z.string().trim().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must be at most 64 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const inputClass = (hasError: boolean) =>
    `w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-colors ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"}`;

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
            router.push(getSafeNextPath("/"));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
                    <p className="text-gray-500 mt-2">
                        Create a JetVau account to enroll in courses
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-5"
                >
                    {error && (
                        <div role="alert" className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                            <AlertCircle size={16} className="flex-shrink-0" aria-hidden="true" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Full name
                        </label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                            <input
                                id="register-name"
                                {...formRegister("name")}
                                type="text"
                                autoComplete="name"
                                aria-invalid={!!errors.name}
                                className={inputClass(!!errors.name)}
                                placeholder="Your name"
                            />
                        </div>
                        {errors.name && <p className="text-red-600 text-xs mt-1 font-medium">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                            <input
                                id="register-email"
                                {...formRegister("email")}
                                type="email"
                                autoComplete="email"
                                aria-invalid={!!errors.email}
                                className={inputClass(!!errors.email)}
                                placeholder="you@gmail.com"
                            />
                        </div>
                        {errors.email && <p className="text-red-600 text-xs mt-1 font-medium">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Phone number
                        </label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                            <input
                                id="register-phone"
                                {...formRegister("phone")}
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-national"
                                aria-invalid={!!errors.phone}
                                className={inputClass(!!errors.phone)}
                                placeholder="10-digit mobile number"
                            />
                        </div>
                        {errors.phone && <p className="text-red-600 text-xs mt-1 font-medium">{errors.phone.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                            <input
                                id="register-password"
                                {...formRegister("password")}
                                type="password"
                                autoComplete="new-password"
                                aria-invalid={!!errors.password}
                                aria-describedby="password-rules"
                                className={inputClass(!!errors.password)}
                                placeholder="Create a password"
                            />
                        </div>
                        <p id="password-rules" className="text-xs text-gray-500 mt-1">
                            8 to 64 characters with an uppercase letter, a lowercase letter, a number and a special character
                        </p>
                        {errors.password && <p className="text-red-600 text-xs mt-1 font-medium leading-tight">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" aria-label="Creating account" />
                        ) : (
                            <>
                                <UserPlus size={18} aria-hidden="true" />
                                Create account
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-secondary font-semibold hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

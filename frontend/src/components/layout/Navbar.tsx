"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, User, LogOut, BookOpen } from "lucide-react";
import { NAV_LINKS, COMPANY_INFO } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuth();

    const handleLogout = () => {
        setLoggingOut(true);
        setTimeout(() => {
            logout();
            setIsOpen(false);
            router.push("/");
            setLoggingOut(false);
        }, 1200);
    };

    return (
        <>
            {/* Logout Overlay */}
            {loggingOut && (
                <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="animate-spin w-10 h-10 border-4 border-white border-t-[var(--color-secondary)] rounded-full mb-4"></div>
                    <p className="text-white text-lg font-semibold animate-pulse">Signing out...</p>
                </div>
            )}

            <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="container flex h-20 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-xl">
                            JV
                        </div>
                        <span className="text-xl font-bold tracking-tight text-[var(--color-primary)]">
                            {COMPANY_INFO.name}
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-[var(--color-secondary)]",
                                    pathname === link.href ? "text-[var(--color-secondary)] font-semibold" : "text-gray-600"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                                        <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                                            {user?.name}
                                        </span>
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                        <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                            <p className="text-xs text-gray-500">Signed in as</p>
                                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                                        </div>
                                        <Link
                                            href="/account"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <User size={16} />
                                            My Account
                                        </Link>
                                        <Link
                                            href="/my-courses"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <BookOpen size={16} />
                                            My Courses
                                        </Link>
                                        <div className="border-t border-gray-100 mt-1 pt-1">
                                            <button
                                                onClick={handleLogout}
                                                disabled={loggingOut}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left disabled:opacity-50 transition-colors"
                                            >
                                                <LogOut size={16} />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-600 hover:text-[var(--color-secondary)] transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Button variant="secondary" size="sm" asChild>
                                    <Link href="/register">Get Started</Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-gray-600"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-b border-gray-100 bg-white"
                        >
                            <div className="container flex flex-col gap-4 py-6">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "text-lg font-medium transition-colors hover:text-[var(--color-secondary)]",
                                            pathname === link.href ? "text-[var(--color-secondary)]" : "text-gray-600"
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                ))}

                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            href="/account"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-2 text-lg font-medium text-gray-600 hover:text-[var(--color-secondary)]"
                                        >
                                            <User size={20} />
                                            My Account
                                        </Link>
                                        <Link
                                            href="/my-courses"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-2 text-lg font-medium text-gray-600 hover:text-[var(--color-secondary)]"
                                        >
                                            <BookOpen size={20} />
                                            My Courses
                                        </Link>
                                        <div className="flex flex-col gap-3 mt-4">
                                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900">{user?.name}</p>
                                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                disabled={loggingOut}
                                                className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                                                onClick={handleLogout}
                                            >
                                                <LogOut size={18} />
                                                Sign Out
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-3 mt-4">
                                        <Button variant="secondary" className="w-full" asChild>
                                            <Link href="/register" onClick={() => setIsOpen(false)}>Get Started</Link>
                                        </Button>
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
}

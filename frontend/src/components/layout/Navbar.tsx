"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, BookOpen } from "lucide-react";
import { NAV_LINKS, COMPANY_INFO } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuth();

    // Close menus when the route changes
    useEffect(() => {
        setIsOpen(false);
        setMenuOpen(false);
    }, [pathname]);

    // Close the account menu on outside click or Escape
    useEffect(() => {
        if (!menuOpen) return;
        const onClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [menuOpen]);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        setMenuOpen(false);
        router.push("/");
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
            <div className="container flex h-20 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-white font-bold text-xl">
                        JV
                    </div>
                    <span className="text-xl font-bold tracking-tight text-primary">
                        {COMPANY_INFO.name}
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={pathname === link.href ? "page" : undefined}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-secondary",
                                pathname === link.href ? "text-secondary font-semibold" : "text-gray-600"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}

                    {isAuthenticated ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                            >
                                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                                    {user?.name}
                                </span>
                            </button>
                            {menuOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                                >
                                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                        <p className="text-xs text-gray-500">Signed in as</p>
                                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                                    </div>
                                    <Link
                                        href="/account"
                                        role="menuitem"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <User size={16} aria-hidden="true" />
                                        My account
                                    </Link>
                                    <Link
                                        href="/my-courses"
                                        role="menuitem"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <BookOpen size={16} aria-hidden="true" />
                                        My courses
                                    </Link>
                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                                        >
                                            <LogOut size={16} aria-hidden="true" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-gray-600 hover:text-secondary transition-colors"
                            >
                                Sign in
                            </Link>
                            <Button variant="secondary" size="sm" asChild>
                                <Link href="/register">Get started</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    type="button"
                    className="md:hidden p-2 text-gray-600"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isOpen}
                    aria-controls="mobile-menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="mobile-menu"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="md:hidden border-b border-gray-100 bg-white"
                    >
                        <div className="container flex flex-col gap-4 py-6">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    aria-current={pathname === link.href ? "page" : undefined}
                                    className={cn(
                                        "text-lg font-medium transition-colors hover:text-secondary",
                                        pathname === link.href ? "text-secondary" : "text-gray-600"
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
                                        className="flex items-center gap-2 text-lg font-medium text-gray-600 hover:text-secondary"
                                    >
                                        <User size={20} aria-hidden="true" />
                                        My account
                                    </Link>
                                    <Link
                                        href="/my-courses"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-2 text-lg font-medium text-gray-600 hover:text-secondary"
                                    >
                                        <BookOpen size={20} aria-hidden="true" />
                                        My courses
                                    </Link>
                                    <div className="flex flex-col gap-4 mt-4">
                                        <div className="flex items-center gap-4 px-4 py-4 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm text-gray-900">{user?.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                            onClick={handleLogout}
                                        >
                                            <LogOut size={18} aria-hidden="true" />
                                            Sign out
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-4 mt-4">
                                    <Button variant="secondary" className="w-full" asChild>
                                        <Link href="/register" onClick={() => setIsOpen(false)}>Get started</Link>
                                    </Button>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/login" onClick={() => setIsOpen(false)}>Sign in</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

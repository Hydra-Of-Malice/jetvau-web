"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, phone: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (updatedUser: Partial<User>) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            setToken(savedToken);
            fetchUser(savedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (authToken: string) => {
        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                localStorage.removeItem("token");
                setToken(null);
            }
        } catch {
            localStorage.removeItem("token");
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const register = async (name: string, email: string, phone: string, password: string) => {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const updateUser = (updatedFields: Partial<User>) => {
        setUser((prev) => prev ? { ...prev, ...updatedFields } : prev);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                updateUser,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

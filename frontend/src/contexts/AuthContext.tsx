"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_BASE, apiPost } from "@/lib/api";

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
            } else if (res.status === 401) {
                // Only an auth failure means the token is bad; keep it on network or server errors
                localStorage.removeItem("token");
                setToken(null);
            }
        } catch {
            // Network error: keep the token so a temporary outage doesn't sign the user out
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const data = await apiPost("/auth/login", { email, password });
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const register = async (name: string, email: string, phone: string, password: string) => {
        const data = await apiPost("/auth/register", { name, email, phone, password });
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

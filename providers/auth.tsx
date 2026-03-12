"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, me } from "@/lib/api";

type User = { id: number; email: string; role: string } | null;

const AuthContext = createContext<{
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}>({
  user: null,
  loading: true,
  login: async () => ({ ok: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      setLoading(false);
      return;
    }
    me().then((r) => {
      if (r.ok && r.data) setUser(r.data);
      else if (typeof window !== "undefined") localStorage.removeItem("access_token");
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const r = await apiLogin(email, password);
    if (r.ok && r.data?.access_token) {
      localStorage.setItem("access_token", r.data.access_token);
      setUser(r.data.user || null);
      return { ok: true };
    }
    return { ok: false, error: r.error || "Login failed" };
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

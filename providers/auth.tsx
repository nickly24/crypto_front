"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { login as apiLogin, me } from "@/lib/api";
import type { SubscriptionData } from "@/lib/api";

export type User = ({ id: number; email: string; role: string } & Partial<SubscriptionData>) | null;

export type StoredAccount = { email: string; token: string; user: User };

const ACCOUNTS_KEY = "pairtrading_accounts";
const CURRENT_KEY = "pairtrading_current_email";

function loadAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function getCurrentEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_KEY);
}

function setCurrentEmail(email: string | null) {
  if (typeof window === "undefined") return;
  if (email) localStorage.setItem(CURRENT_KEY, email);
  else localStorage.removeItem(CURRENT_KEY);
}

const AuthContext = createContext<{
  user: User;
  loading: boolean;
  switchingAccount: boolean;
  accounts: StoredAccount[];
  login: (email: string, password: string, addAccount?: boolean) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  switchAccount: (account: StoredAccount) => void;
  logoutAccount: (account: StoredAccount) => void;
  refreshUser: () => Promise<void>;
}>({
  user: null,
  loading: true,
  switchingAccount: false,
  accounts: [],
  login: async () => ({ ok: false }),
  logout: () => {},
  switchAccount: () => {},
  logoutAccount: () => {},
  refreshUser: async () => {},
});

const SWITCHING_DURATION_MS = 2500;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [switchingAccount, setSwitchingAccount] = useState(false);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);

  const applyAccount = useCallback((acc: StoredAccount | null) => {
    if (typeof window === "undefined") return;
    if (!acc) {
      localStorage.removeItem("access_token");
      setUser(null);
      setCurrentEmail(null);
      return;
    }
    localStorage.setItem("access_token", acc.token);
    setUser(acc.user);
    setCurrentEmail(acc.email);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const accs = loadAccounts();
    setAccounts(accs);
    const currentEmail = getCurrentEmail();
    const current = accs.find((a) => a.email === currentEmail) ?? accs[0];
    if (current) {
      localStorage.setItem("access_token", current.token);
      me().then((r) => {
        if (cancelled) return;
        if (r.ok && r.data) {
          const userData: User = r.data;
          applyAccount({ ...current, user: userData });
          const updated = accs.map((a) => (a.email === current.email ? { ...a, user: userData } : a));
          saveAccounts(updated);
          setAccounts(updated);
        } else {
          const filtered = accs.filter((a) => a.email !== current.email);
          saveAccounts(filtered);
          setAccounts(filtered);
          applyAccount(filtered[0] ?? null);
        }
        setLoading(false);
      });
      return () => { cancelled = true; };
    }
    const token = localStorage.getItem("access_token");
    if (token) {
      me().then((r) => {
        if (cancelled) return;
        if (r.ok && r.data) {
          const userData: User = r.data;
          const acc: StoredAccount = { email: userData.email, token, user: userData };
          const exists = accs.some((a) => a.email === acc.email);
          const next = exists ? accs.map((a) => (a.email === acc.email ? acc : a)) : [...accs, acc];
          saveAccounts(next);
          setAccounts(next);
          applyAccount(acc);
        } else {
          localStorage.removeItem("access_token");
          setUser(null);
        }
        setLoading(false);
      });
      return () => { cancelled = true; };
    } else setLoading(false);
  }, [applyAccount]);

  const login = async (email: string, password: string, addAccount = false) => {
    const r = await apiLogin(email, password);
    if (!r.ok || !r.data?.access_token) return { ok: false, error: r.error || "Login failed" };
    const newAcc: StoredAccount = {
      email: r.data.user?.email ?? email,
      token: r.data.access_token,
      user: r.data.user || null,
    };
    const accs = loadAccounts();
    const exists = accs.some((a) => a.email === newAcc.email);
    const next = exists ? accs.map((a) => (a.email === newAcc.email ? newAcc : a)) : [...accs, newAcc];
    saveAccounts(next);
    setAccounts(next);
    applyAccount(newAcc);
    return { ok: true };
  };

  const logout = () => {
    const accs = loadAccounts();
    const cur = getCurrentEmail();
    const filtered = cur ? accs.filter((a) => a.email !== cur) : accs;
    saveAccounts(filtered);
    setAccounts(filtered);
    applyAccount(filtered[0] ?? null);
  };

  const switchAccount = (account: StoredAccount) => {
    setSwitchingAccount(true);
    applyAccount(account);
    setTimeout(() => setSwitchingAccount(false), SWITCHING_DURATION_MS);
  };

  const logoutAccount = (account: StoredAccount) => {
    const accs = loadAccounts().filter((a) => a.email !== account.email);
    saveAccounts(accs);
    setAccounts(accs);
    const cur = getCurrentEmail();
    if (cur === account.email) applyAccount(accs[0] ?? null);
  };

  const refreshUser = useCallback(async () => {
    const r = await me();
    if (!r.ok || !r.data) return;
    const accs = loadAccounts();
    const curEmail = getCurrentEmail();
    const current = accs.find((a) => a.email === curEmail);
    if (!current) return;
    const updated = { ...current, user: r.data as User };
    const next = accs.map((a) => (a.email === curEmail ? updated : a));
    saveAccounts(next);
    setAccounts(next);
    applyAccount(updated);
  }, [applyAccount]);

  return (
    <AuthContext.Provider value={{ user, loading, switchingAccount, accounts, login, logout, switchAccount, logoutAccount, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

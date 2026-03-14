"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth";
import { useTheme } from "@/providers/theme";
import { HeaderTickers } from "@/components/HeaderTickers";
import {
  Bell,
  LogOut,
  Menu,
  Zap,
  UserPlus,
  ChevronRight,
  Check,
} from "lucide-react";

function formatHeaderDate() {
  return new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TariffBadge() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wide text-white/95 shadow-md overflow-hidden
          bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 hover:from-violet-500 hover:via-fuchsia-400 hover:to-amber-400
          transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex items-center gap-1.5"
      >
        <Zap className="w-3.5 h-3.5" />
        PRO+
      </button>
      {open && (
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 top-full mt-1.5 z-50 w-56 p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl
            bg-gradient-to-b from-[var(--card-bg)] to-[var(--background)]"
        >
          <p className="text-sm font-semibold text-[var(--foreground)] mb-1">PRO+</p>
          <p className="text-xs text-[var(--muted)] mb-3">Full access to all features</p>
          <p className="text-sm font-medium text-[var(--accent)]">
            321 days left
          </p>
        </div>
      )}
    </div>
  );
}

function AccountSwitcher() {
  const { user, accounts, switchAccount, logoutAccount } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const otherAccounts = accounts.filter((a) => a.email !== user?.email);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 sm:gap-3 pl-2 rounded-xl hover:bg-[var(--sidebar-hover)] transition"
      >
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg)" }}
        />
        <div className="hidden lg:flex flex-col items-start">
          <span className="text-sm font-medium text-[var(--foreground)] truncate max-w-[140px]">
            {user?.email?.split("@")[0] || "User"}
          </span>
          <span className="text-xs text-[var(--muted)]">{formatHeaderDate()}</span>
        </div>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 w-72 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl overflow-hidden"
        >
          <div className="p-4 border-b border-[var(--card-border)]">
            <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">Current account</p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full shrink-0 bg-cover bg-center"
                style={{ backgroundImage: "url(https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg)" }}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)] truncate">{user?.email?.split("@")[0] || "User"}</p>
                <p className="text-xs text-[var(--muted)] truncate">{user?.email}</p>
              </div>
              <Check className="w-5 h-5 text-[var(--positive)] shrink-0" />
            </div>
          </div>
          <div className="p-2">
            <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider px-2 py-1.5">Switch account</p>
            {otherAccounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => { switchAccount(acc); setOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-[var(--sidebar-hover)] transition text-left"
              >
                <div
                  className="w-8 h-8 rounded-full shrink-0 bg-cover bg-center"
                  style={{ backgroundImage: "url(https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg)" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{acc.user?.email?.split("@")[0] || acc.email}</p>
                  <p className="text-xs text-[var(--muted)] truncate">{acc.email}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--muted)] shrink-0" />
              </button>
            ))}
            <Link
              href="/add-account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-[var(--sidebar-hover)] transition text-[var(--accent)]"
            >
              <UserPlus className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">Add account</span>
            </Link>
          </div>
          <div className="p-2 border-t border-[var(--card-border)]">
            <button
              onClick={() => {
                const current = accounts.find((a) => a.email === user?.email);
                if (current) logoutAccount(current);
                setOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-[var(--negative)]/10 text-[var(--negative)] transition"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type HeaderProps = { onOpenDrawer?: () => void };

export function Header({ onOpenDrawer }: HeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-6 border-b border-[var(--card-border)] bg-[var(--card-bg)] shrink-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {onOpenDrawer && (
          <button
            onClick={onOpenDrawer}
            className="md:hidden p-2 -ml-1 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
            title="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="hidden md:flex flex-1 min-w-0">
          <HeaderTickers />
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 ml-2 shrink-0">
        <button className="relative p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--negative)]" />
        </button>
        <TariffBadge />
        <div className="flex items-center gap-1 border-l border-[var(--card-border)] pl-2">
          <AccountSwitcher />
        </div>
      </div>
    </header>
  );
}

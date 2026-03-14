"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth";
import { useTheme } from "@/providers/theme";
import {
  Bell,
  LogOut,
  Settings,
  Sun,
  Moon,
  HelpCircle,
} from "lucide-react";

function formatHeaderDate() {
  return new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-[var(--card-border)] bg-[var(--card-bg)] shrink-0">
      <div className="flex items-center flex-1 max-w-xl min-w-0">
        <div className="relative w-full hidden sm:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--background)]/50 border border-[var(--card-border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
          />
        </div>
        <span className="sm:hidden font-bold text-base text-[var(--foreground)] truncate">PairTrading</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-4 ml-2 sm:ml-6 shrink-0">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] transition"
          title={theme === "light" ? "Dark theme" : "Light theme"}
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <Link
          href="/guide"
          className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] transition"
          title="Guide"
        >
          <HelpCircle className="w-5 h-5" />
        </Link>
        <Link
          href="/settings"
          className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] transition"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>
        <button className="relative p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--negative)]" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-[var(--card-border)]">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 bg-cover bg-center"
            style={{ backgroundImage: "url(https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg)" }}
          />
          <div className="hidden lg:flex flex-col">
            <span className="text-sm font-medium text-[var(--foreground)] truncate max-w-[140px]">
              {user?.email?.split("@")[0] || "User"}
            </span>
            <span className="text-xs text-[var(--muted)]">{formatHeaderDate()}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--negative)] hover:bg-[var(--sidebar-hover)] transition"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

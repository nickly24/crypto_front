"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth";
import {
  Settings,
  BarChart3,
  Bell,
  User,
  LogOut,
  HelpCircle,
} from "lucide-react";

function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="36" height="36" rx="10" fill="url(#logo-bg)" />
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="36" y2="36">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      {/* Two crossing trend lines */}
      <path
        d="M8 24 L14 18 L20 20 L28 10"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8 12 L14 18 L20 16 L28 26"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.5"
      />
      {/* Arrow tip on first line */}
      <path
        d="M25 10 L28 10 L28 13"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

const nav = [
  { href: "/dashboard", label: "Дашборд" },
  { href: "/settings", label: "Настройки", icon: Settings },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--card-border)] bg-[var(--card-bg)]/80 backdrop-blur-sm">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <Logo className="w-9 h-9 transition-transform group-hover:scale-105" />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base tracking-tight">PairTrading</span>
            <span className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-widest">Platform</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? "text-[var(--accent)] bg-[var(--accent)]/10"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/guide"
          className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/50 transition"
          title="Гайд"
        >
          <HelpCircle className="w-5 h-5" />
        </Link>
        <button className="relative p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/50 transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--negative)]" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--background)]/50 border border-[var(--card-border)]">
          <User className="w-4 h-4 text-[var(--muted)]" />
          <span className="text-sm">{user?.email}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 p-2 rounded-lg text-[var(--muted)] hover:text-[var(--negative)] hover:bg-[var(--card-border)]/50 transition"
          title="Выйти"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

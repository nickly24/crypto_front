"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth";
import { HelpCircle, LogIn, LayoutDashboard, Settings, BarChart3, Palette } from "lucide-react";
import { Logo } from "@/components/Logo";

const publicNav = [
  { href: "/", label: "Home", icon: null },
  { href: "/guide", label: "Guide", icon: null },
  { href: "/faq", label: "FAQ", icon: null },
];

const appNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/guide", label: "Guide", icon: null },
  { href: "/faq", label: "FAQ", icon: null },
];

export function LandingHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-6 lg:px-10 border-b border-white/5 bg-[var(--card-bg)]/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <Logo className="w-9 h-9 transition-transform group-hover:scale-105" />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base tracking-tight">PairTrading</span>
            <span className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-widest">Platform</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {(user ? appNav : publicNav).map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  active ? "text-[var(--accent)] bg-[var(--accent)]/10" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {Icon != null && <Icon className="w-4 h-4" />}
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/settings?section=appearance"
          className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] transition"
          title="Theme — Settings"
        >
          <Palette className="w-5 h-5" />
        </Link>
        <Link
          href="/guide"
          className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] transition"
          title="Guide"
        >
          <HelpCircle className="w-5 h-5" />
        </Link>
        {user ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/30 transition font-medium"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-slate-900 font-medium hover:opacity-90 transition"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

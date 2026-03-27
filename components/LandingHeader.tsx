"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, LogIn, LayoutDashboard, Settings, BarChart3, Palette, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/providers/auth";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = user ? appNav : publicNav;

  return (
    <>
      <header className="sticky top-0 z-50 h-[4.25rem] flex items-center justify-between px-4 sm:px-6 lg:px-10 border-b border-[var(--accent)]/15 bg-[var(--card-bg)]/75 backdrop-blur-2xl supports-[backdrop-filter]:bg-[var(--card-bg)]/55">
        <div className="flex items-center gap-6 lg:gap-10 min-w-0">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-[var(--accent)]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <Logo className="relative w-9 h-9 sm:w-10 sm:h-10 transition-transform group-hover:scale-[1.03]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-[15px] sm:text-base tracking-tight">PairTrading</span>
              <span className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-[0.2em]">Platform</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-0.5">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "text-[var(--accent)] bg-[var(--accent)]/12 shadow-[inset_0_0_0_1px_rgba(157,219,0,0.2)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
                  }`}
                >
                  {Icon != null && <Icon className="w-4 h-4" />}
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {!user && (
            <button
              type="button"
              className="md:hidden p-2.5 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] transition"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link
            href="/settings?section=appearance"
            className="hidden sm:flex p-2.5 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] transition"
            title="Theme"
          >
            <Palette className="w-5 h-5" />
          </Link>
          <Link
            href="/guide"
            className="hidden sm:flex p-2.5 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] transition"
            title="Guide"
          >
            <HelpCircle className="w-5 h-5" />
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)]/18 text-[var(--accent)] border border-[var(--accent)]/35 hover:bg-[var(--accent)]/28 transition font-medium text-sm"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[var(--accent)] text-slate-900 font-semibold text-sm hover:opacity-95 transition shadow-lg shadow-[var(--accent)]/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in</span>
            </Link>
          )}
        </div>
      </header>

      <AnimatePresence>
        {!user && mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-[min(20rem,88vw)] flex flex-col bg-[var(--sidebar-bg)] border-l border-[var(--card-border)] shadow-2xl md:hidden pt-[env(safe-area-inset-top)]"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
                <span className="text-sm font-semibold text-[var(--muted)]">Menu</span>
                <button
                  type="button"
                  className="p-2 rounded-xl text-[var(--muted)] hover:bg-[var(--sidebar-hover)]"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {publicNav.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-base font-medium ${
                        active
                          ? "bg-[var(--accent)]/12 text-[var(--accent)]"
                          : "text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block mt-4 mx-1 py-3 text-center rounded-xl bg-[var(--accent)] text-slate-900 font-semibold"
                >
                  Sign in
                </Link>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

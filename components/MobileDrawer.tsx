"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutDashboard, Settings, BarChart3, HelpCircle, Bookmark, LogOut, Palette } from "lucide-react";
import { Logo } from "@/components/Logo";
import { HeaderTickers } from "@/components/HeaderTickers";
import { useAuth } from "@/providers/auth";
import { useTheme } from "@/providers/theme";

type Props = {
  open: boolean;
  onClose: () => void;
};

const nav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/faq", label: "FAQ", icon: Bookmark },
  { href: "/guide", label: "Guide", icon: HelpCircle },
];

export function MobileDrawer({ open, onClose }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { openAppearancePicker } = useTheme();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--card-border)] md:hidden pt-[env(safe-area-inset-top)]"
          >
            <div className="p-4 border-b border-[var(--card-border)]">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3">
                  <Logo className="w-10 h-10" />
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-lg tracking-tight text-[var(--foreground)]">PairTrading</span>
                    <span className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-widest">Platform</span>
                  </div>
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
                >
                  <X className="w-6 h-6" />
                </button>
            </div>
            <div className="px-4 pb-4">
              <HeaderTickers vertical />
            </div>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <button
                onClick={() => { openAppearancePicker(); onClose(); }}
                className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
              >
                <Palette className="w-6 h-6 shrink-0" />
                Theme & appearance
              </button>
              {nav.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition ${
                      active
                        ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
                        : "text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <Icon className="w-6 h-6 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>
            {user && (
              <div className="p-4 border-t border-[var(--card-border)]">
                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                  <div
                    className="w-10 h-10 rounded-full shrink-0 bg-cover bg-center"
                    style={{ backgroundImage: "url(https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg)" }}
                  />
                  <span className="text-sm font-medium text-[var(--foreground)] truncate">
                    {user.email?.split("@")[0] || "User"}
                  </span>
                </div>
                <button
                  onClick={() => { logout(); onClose(); }}
                  className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-[var(--negative)] hover:bg-[var(--negative)]/10 font-medium"
                >
                  <LogOut className="w-6 h-6 shrink-0" />
                  Sign out
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

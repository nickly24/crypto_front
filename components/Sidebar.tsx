"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Settings,
  BarChart3,
  HelpCircle,
  Bookmark,
  LineChart,
  Sparkles,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/providers/auth";
import { useSubscriptionModal } from "@/providers/subscription-modal";
import type { Plan } from "@/lib/subscription";

const nav = [
  { href: "/dashboard", label: "Trade Control", icon: LayoutGrid },
  { href: "/trading", label: "Trading", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/faq", label: "FAQ", icon: Bookmark },
  { href: "/guide", label: "Guide", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const modalCtx = useSubscriptionModal();
  const plan = (user?.plan ?? "FREE") as Plan;

  const openPlans = () => modalCtx?.openSubscriptionModal();

  const upgradeCopy =
    plan === "PRO+"
      ? {
          title: "Your subscription",
          subtitle: "Manage billing or switch plans anytime.",
          cta: "Manage plan",
          Icon: Sparkles,
        }
      : plan === "PRO"
        ? {
            title: "Level up to PRO+",
            subtitle: "Advanced reporting, owner tools, and more.",
            cta: "Upgrade plan",
            Icon: Zap,
          }
        : {
            title: "Upgrade your plan",
            subtitle: "Unlock analytics, full bot access, and support.",
            cta: "See plans",
            Icon: Zap,
          };

  const CardIcon = upgradeCopy.Icon;

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-[var(--card-border)] bg-[var(--sidebar-bg)] min-h-0">
      <div className="p-5 border-b border-[var(--card-border)] shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <Logo className="w-9 h-9 transition-transform group-hover:scale-105" />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base tracking-tight text-[var(--foreground)]">PairTrading</span>
            <span className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-widest">Platform</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 min-h-0 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href === "/dashboard" && (pathname.startsWith("/dashboard/pair-trading") || pathname.startsWith("/dashboard/chart")));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
                  : "text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 pt-2 border-t border-[var(--card-border)] shrink-0">
        <div
          className="rounded-xl p-3.5 bg-gradient-to-br from-[var(--accent)]/14 via-[var(--accent)]/5 to-transparent border border-[var(--accent)]/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
        >
          <div className="flex items-start gap-2.5 mb-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/20 text-[var(--accent)]">
              <CardIcon className="w-4 h-4" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--foreground)] leading-tight">{upgradeCopy.title}</p>
              <p className="text-[11px] text-[var(--muted)] leading-snug mt-1">{upgradeCopy.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={openPlans}
            className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-[var(--accent)] text-slate-900 hover:opacity-95 transition shadow-sm"
          >
            {upgradeCopy.cta}
          </button>
        </div>
      </div>
    </aside>
  );
}

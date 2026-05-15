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
  PanelLeftClose,
  PanelLeftOpen,
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

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
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
    <aside
      className={`hidden md:flex h-screen shrink-0 flex-col border-r border-[var(--card-border)] bg-[var(--sidebar-bg)] min-h-0 overflow-hidden transition-[width] duration-300 ${
        collapsed ? "w-20" : "w-56"
      }`}
    >
      <div className={`border-b border-[var(--card-border)] shrink-0 ${collapsed ? "p-3" : "p-5"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <Link href="/dashboard" className="group block">
            <Logo
              showWordmark={!collapsed}
              className={
                collapsed
                  ? "h-12 w-12 justify-center"
                  : "h-14 w-full max-w-[11.25rem] transition-transform group-hover:scale-[1.02]"
              }
            />
          </Link>
        </div>
      </div>
      <nav className={`flex-1 space-y-1 min-h-0 overflow-y-auto ${collapsed ? "p-2" : "p-3"}`}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href === "/dashboard" && (pathname.startsWith("/dashboard/pair-trading") || pathname.startsWith("/dashboard/chart")));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
                : "text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      <div className={`border-t border-[var(--card-border)] shrink-0 ${collapsed ? "px-2 pb-2 pt-2" : "px-3 pb-3 pt-2"}`}>
        <div
          className={`rounded-xl bg-gradient-to-br from-[var(--accent)]/14 via-[var(--accent)]/5 to-transparent border border-[var(--accent)]/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ${
            collapsed ? "p-2.5" : "p-3.5"
          }`}
        >
          <div className={`flex ${collapsed ? "justify-center mb-2" : "items-start gap-2.5 mb-2"}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/20 text-[var(--accent)]">
              <CardIcon className="w-4 h-4" strokeWidth={2.25} />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--foreground)] leading-tight">{upgradeCopy.title}</p>
                <p className="text-[11px] text-[var(--muted)] leading-snug mt-1">{upgradeCopy.subtitle}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={openPlans}
            title={collapsed ? upgradeCopy.cta : undefined}
            className={`rounded-lg text-xs font-semibold bg-[var(--accent)] text-slate-900 hover:opacity-95 transition shadow-sm ${
              collapsed ? "flex h-9 w-full items-center justify-center px-0" : "w-full py-2 px-3"
            }`}
          >
            {collapsed ? <CardIcon className="w-4 h-4" strokeWidth={2.25} /> : upgradeCopy.cta}
          </button>
        </div>

        <div className={`${collapsed ? "mt-2 pt-2" : "mt-3 pt-3"} border-t border-[var(--card-border)]/80`}>
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : undefined}
            className={`flex items-center rounded-xl text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] transition ${
              collapsed ? "h-10 w-full justify-center" : "w-full gap-3 px-3 py-2.5 text-sm font-medium"
            }`}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5 shrink-0" />}
            {!collapsed && <span>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

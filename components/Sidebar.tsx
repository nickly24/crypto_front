"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  BarChart3,
  HelpCircle,
  Bookmark,
  LineChart,
  Code2,
} from "lucide-react";
import { Logo } from "@/components/Logo";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trading", label: "Trading", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/faq", label: "FAQ", icon: Bookmark },
  { href: "/guide", label: "Guide", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-[var(--card-border)] bg-[var(--sidebar-bg)]">
      <div className="p-5 border-b border-[var(--card-border)]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <Logo className="w-9 h-9 transition-transform group-hover:scale-105" />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base tracking-tight text-[var(--foreground)]">PairTrading</span>
            <span className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-widest">Platform</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
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
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  BarChart3,
  Bookmark,
  LineChart,
  Code2,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/trading", label: "Trading", icon: LineChart },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/faq", label: "FAQ", icon: Bookmark },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-[var(--card-bg)] border-t border-[var(--card-border)] safe-area-bottom"
      style={{
        paddingTop: "14px",
        paddingBottom: "max(14px, env(safe-area-inset-bottom) + 10px)",
      }}
    >
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1.5 py-2 px-3 min-w-0 flex-1 transition ${
              active
                ? "text-[var(--accent)]"
                : "text-[var(--muted)] active:text-[var(--foreground)]"
            }`}
          >
            <Icon className="w-7 h-7 shrink-0" strokeWidth={active ? 2.5 : 2} />
            <span className="text-[11px] font-medium truncate w-full text-center">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

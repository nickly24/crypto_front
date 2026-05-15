"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { GitBranch, TrendingUp, TrendingDown, ArrowRightLeft, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { TradeControlQuotations } from "@/components/TradeControlQuotations";

const image = (filename: string) => `/images/${encodeURIComponent(filename)}`;

type Section = {
  id: string;
  title: string;
  caption: string;
  file: string;
  href?: string;
  Icon: LucideIcon;
};

/** Файлы: pair — image.png; momentum вверх — copy 2; momentum вниз — copy.png; sideways — copy 3; owner — copy 4. */
const SECTIONS: Section[] = [
  {
    id: "pair-trading",
    title: "Market-neutral",
    caption: "Relative-value strategy & live bot",
    file: "image.png",
    href: "/dashboard/pair-trading",
    Icon: GitBranch,
  },
  {
    id: "momentum",
    title: "Momentum attack",
    caption: "Growth / trend-following algorithm",
    file: "image copy 2.png",
    Icon: TrendingUp,
  },
  {
    id: "decline-attack",
    title: "Decline attack",
    caption: "Bearish trend — profits when the market drops",
    file: "image copy.png",
    Icon: TrendingDown,
  },
  {
    id: "sideways",
    title: "Range / sideways",
    caption: "Consolidation & mean-reversion",
    file: "image copy 3.png",
    Icon: ArrowRightLeft,
  },
  {
    id: "owner-vip",
    title: "Owner hub",
    caption: "VIP accounts & ownership settings",
    file: "image copy 4.png",
    Icon: Crown,
  },
];

export function TradeFinalHub() {
  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-0">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--foreground)]">Trade Control</h1>
        <p className="text-sm md:text-base text-[var(--muted)] mt-2 max-w-2xl">
          Choose your algorithmic trading engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4 mb-10 md:mb-12">
        {SECTIONS.map((s, i) => {
          const src = image(s.file);
          const available = Boolean(s.href);

          const inner = (
            <>
              <div className="relative aspect-square w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white backdrop-blur-sm border border-white/10 sm:top-2.5 sm:left-2.5 sm:h-9 sm:w-9">
                  <s.Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2} />
                </div>
                {!available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/55 backdrop-blur-[3px] px-2">
                    <span className="rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/95 shadow-lg">
                      Coming soon
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 md:p-3.5">
                  <h2 className="text-sm sm:text-base font-semibold text-white drop-shadow-md leading-snug">{s.title}</h2>
                  <p className="text-[10px] sm:text-xs text-white/80 mt-0.5 line-clamp-2 leading-snug">{s.caption}</p>
                </div>
              </div>
            </>
          );

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="min-w-0"
            >
              {available ? (
                <Link
                  href={s.href!}
                  className="group block rounded-xl sm:rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden shadow-sm hover:border-[var(--accent)]/50 hover:shadow-md hover:shadow-[var(--accent)]/5 transition duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                >
                  {inner}
                </Link>
              ) : (
                <div
                  className="rounded-xl sm:rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden opacity-90 cursor-not-allowed select-none"
                  aria-disabled="true"
                >
                  {inner}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mb-2 md:mb-4">
        <div className="h-px w-full bg-[var(--card-border)] mb-5" aria-hidden />
        <TradeControlQuotations />
      </div>
    </div>
  );
}

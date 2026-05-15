"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";
import {
  HEADER_QUOTE_ROWS,
  fetchCoingeckoSimpleUsdEurRub,
  formatCompactUsdPrice,
} from "@/lib/coingecko-quotes";

type TickDirection = "up" | "down" | null;

type TickerState = {
  price: number;
  direction: TickDirection;
};

type HeaderTickersProps = { vertical?: boolean };

export function HeaderTickers({ vertical }: HeaderTickersProps) {
  const [tickers, setTickers] = useState<Record<string, TickerState>>({});
  const prevRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const ids = HEADER_QUOTE_ROWS.map((r) => r.coingeckoId);

    const fetchPrices = async () => {
      try {
        const data = await fetchCoingeckoSimpleUsdEurRub(ids);
        if (!data) return;

        setTickers((prev) => {
          const next: Record<string, TickerState> = { ...prev };
          for (const row of HEADER_QUOTE_ROWS) {
            const q = data[row.coingeckoId];
            if (!q) continue;
            const price = q.usd;
            const prevPrice = prevRef.current[row.coingeckoId];
            let direction: TickDirection = null;
            if (prevPrice != null && prevPrice !== price) {
              direction = price > prevPrice ? "up" : "down";
            }
            prevRef.current[row.coingeckoId] = price;
            next[row.coingeckoId] = { price, direction };
          }
          return next;
        });
      } catch {
        // ignore
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 15_000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`flex ${vertical ? "flex-col gap-1.5" : "flex-row items-center gap-2 sm:gap-4"} text-[10px] sm:text-xs shrink-0`}>
      {HEADER_QUOTE_ROWS.map(({ label, coingeckoId }) => {
        const t = tickers[coingeckoId];
        if (!t) return null;
        const isUp = t.direction === "up";
        const isDown = t.direction === "down";
        const colorClass = isUp
          ? "text-[var(--positive)]"
          : isDown
            ? "text-[var(--negative)]"
            : "text-[var(--muted)]";

        return (
          <div key={coingeckoId} className={`flex items-center gap-0.5 font-mono ${colorClass}`}>
            {t.direction === "up" && <ChevronUp className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />}
            {t.direction === "down" && <ChevronDown className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />}
            {t.direction === null && <Minus className="w-3.5 h-3.5 shrink-0 opacity-50" strokeWidth={2} />}
            <span className="text-[10px] text-[var(--muted)] mr-0.5">{label}</span>
            <span>${formatCompactUsdPrice(t.price, coingeckoId)}</span>
          </div>
        );
      })}
    </div>
  );
}

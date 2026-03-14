"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";

const BINANCE_API = "https://api.binance.com/api/v3/ticker/price";
const PAIRS = [
  { symbol: "BTCUSDT", label: "BTC" },
  { symbol: "ETHUSDT", label: "ETH" },
  { symbol: "USDCUSDT", label: "USDT" },
] as const;

type TickDirection = "up" | "down" | null;

type TickerState = {
  price: number;
  direction: TickDirection;
};

function formatPrice(price: number, symbol: string): string {
  // USDCUSDT ~1 — показываем 4 знака
  if (symbol === "USDCUSDT") return price.toFixed(4);
  if (price >= 1000) return price.toLocaleString("en", { maximumFractionDigits: 0 });
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}

type HeaderTickersProps = { vertical?: boolean };

export function HeaderTickers({ vertical }: HeaderTickersProps) {
  const [tickers, setTickers] = useState<Record<string, TickerState>>({});
  const prevRef = useRef<Record<string, number>>({});
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const fetchPrices = async () => {
      try {
        const symbols = JSON.stringify(PAIRS.map((p) => p.symbol));
        const res = await fetch(`${BINANCE_API}?symbols=${symbols}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;

        setTickers((prev) => {
          const next: Record<string, TickerState> = {};
          for (const item of data) {
            const price = parseFloat(item.price);
            if (isNaN(price)) continue;
            const prevPrice = prevRef.current[item.symbol];
            let direction: TickDirection = null;
            if (prevPrice != null && prevPrice !== price) {
              direction = price > prevPrice ? "up" : "down";
            }
            prevRef.current[item.symbol] = price;
            next[item.symbol] = { price, direction };
          }
          return { ...prev, ...next };
        });
      } catch {
        // ignore
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`flex ${vertical ? "flex-col gap-1.5" : "flex-row items-center gap-2 sm:gap-4"} text-[10px] sm:text-xs shrink-0`}>
      {PAIRS.map(({ symbol, label }) => {
        const t = tickers[symbol];
        if (!t) return null;
        const isUp = t.direction === "up";
        const isDown = t.direction === "down";
        const colorClass = isUp
          ? "text-[var(--positive)]"
          : isDown
            ? "text-[var(--negative)]"
            : "text-[var(--muted)]";

        return (
          <div key={symbol} className={`flex items-center gap-0.5 font-mono ${colorClass}`}>
            {t.direction === "up" && <ChevronUp className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />}
            {t.direction === "down" && <ChevronDown className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />}
            {t.direction === null && <Minus className="w-3.5 h-3.5 shrink-0 opacity-50" strokeWidth={2} />}
            <span className="text-[10px] text-[var(--muted)] mr-0.5">{label}</span>
            <span>${formatPrice(t.price, symbol)}</span>
          </div>
        );
      })}
    </div>
  );
}

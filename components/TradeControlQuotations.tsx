"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CryptoIcon } from "@/components/CryptoIcon";
import { TRADE_CONTROL_QUOTE_ROWS, fetchCoingeckoSimpleUsdEurRub } from "@/lib/coingecko-quotes";
import { formatUsdAmount, formatEurAmount, formatRubAmount } from "@/lib/fiat-fx";

/** CoinGecko free tier */
const POLL_MS = 20_000;

/** Сколько активов показываем на одном «экране» каталога. */
const QUOTES_PER_PAGE = 8;

type TickerState = {
  usd: number;
  eur?: number;
  rub?: number;
};

function formatUpdatedAt(date: Date | null) {
  if (!date) return "waiting for market data";
  return `updated ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
}

function chunkPages<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size) as T[]);
  }
  return out;
}

/** Котировки CoinGecko: компактная карусель по страницам, стиль под тему приложения. */
export function TradeControlQuotations() {
  const pages = useMemo(() => chunkPages(TRADE_CONTROL_QUOTE_ROWS, QUOTES_PER_PAGE), []);
  const [pageIndex, setPageIndex] = useState(0);
  const [tickers, setTickers] = useState<Record<string, TickerState>>({});
  const [loading, setLoading] = useState(true);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const maxPage = pages.length - 1;
  const safePage = Math.min(pageIndex, maxPage);
  const currentRows = pages[safePage] ?? [];

  useEffect(() => {
    if (pageIndex > maxPage) setPageIndex(maxPage);
  }, [pageIndex, maxPage]);

  useEffect(() => {
    const ids = TRADE_CONTROL_QUOTE_ROWS.map((r) => r.coingeckoId);

    const tick = async () => {
      try {
        const data = await fetchCoingeckoSimpleUsdEurRub(ids);
        if (!data) {
          setQuoteError("CoinGecko unavailable or rate limit — try again later.");
          return;
        }
        setQuoteError(null);
        setTickers((prev) => {
          const next: Record<string, TickerState> = { ...prev };
          for (const row of TRADE_CONTROL_QUOTE_ROWS) {
            const q = data[row.coingeckoId];
            if (!q) continue;
            next[row.coingeckoId] = {
              usd: q.usd,
              eur: q.eur,
              rub: q.rub,
            };
          }
          return next;
        });
        setLastUpdatedAt(new Date());
      } catch {
        setQuoteError("Network error");
      } finally {
        setLoading(false);
      }
    };

    tick();
    const interval = setInterval(tick, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  const goPrev = () => setPageIndex((p) => Math.max(0, p - 1));
  const goNext = () => setPageIndex((p) => Math.min(maxPage, p + 1));

  return (
    <div
      className="overflow-hidden rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]
        shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
    >
      <div className="border-b border-[var(--card-border)] bg-[var(--sidebar-hover)]/35 px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--accent)]/25 bg-[var(--accent)]/10 text-[var(--accent)]">
                <Activity className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-[var(--foreground)]">Live quotations</h2>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Major crypto assets, priced in USD, EUR and RUB
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-8 items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 text-xs text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent-dim)]" />
              {formatUpdatedAt(lastUpdatedAt)}
            </span>
            <span className="inline-flex h-8 items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 text-xs text-[var(--muted)]">
              <RefreshCcw className="h-3.5 w-3.5" />
              {POLL_MS / 1000}s refresh
            </span>
            {pages.length > 1 && (
              <div className="inline-flex rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-1">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={safePage <= 0}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--foreground)]
                    disabled:cursor-not-allowed disabled:opacity-35 hover:bg-[var(--sidebar-hover)] transition"
                  aria-label="Previous quote page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="flex h-7 items-center px-2 text-xs text-[var(--muted)]">
                  {safePage + 1} / {pages.length}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={safePage >= maxPage}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--foreground)]
                    disabled:cursor-not-allowed disabled:opacity-35 hover:bg-[var(--sidebar-hover)] transition"
                  aria-label="Next quote page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {quoteError && (
          <p className="mb-3 rounded-lg border border-[var(--negative)]/25 bg-[var(--negative)]/10 p-3 text-xs text-[var(--negative)]">
            {quoteError}
          </p>
        )}

        <div className="relative min-h-[296px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={safePage}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="grid auto-rows-fr grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {currentRows.map(({ label, iconSymbol, coingeckoId }) => {
                const t = tickers[coingeckoId];
                if (loading && !t) {
                  return (
                    <div
                      key={coingeckoId}
                      className="min-h-[8.25rem] animate-pulse rounded-lg border border-[var(--card-border)] bg-[var(--sidebar-hover)]/40 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-[var(--card-border)]/50" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-16 rounded bg-[var(--card-border)]/45" />
                          <div className="space-y-2 pt-1">
                            <div className="h-5 w-full rounded bg-[var(--card-border)]/35" />
                            <div className="h-px w-full bg-[var(--card-border)]/40" />
                            <div className="h-5 w-full rounded bg-[var(--card-border)]/28" />
                            <div className="h-px w-full bg-[var(--card-border)]/40" />
                            <div className="h-5 w-full rounded bg-[var(--card-border)]/28" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                if (!t) return null;

                return (
                  <article
                    key={coingeckoId}
                    className="group flex min-w-0 flex-col rounded-lg border border-[var(--card-border)] bg-[var(--background)]/35 p-3
                      transition duration-200 hover:border-[var(--accent)]/35 hover:bg-[var(--card-bg)] hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <CryptoIcon symbol={iconSymbol} size={28} className="rounded-full" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--foreground)]">{label}</p>
                        <p className="text-xs text-[var(--muted)]">vs fiat</p>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-[var(--card-border)]/70 pt-2">
                      <div className="flex items-baseline justify-between gap-3 py-1.5">
                        <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">USD</span>
                        <span className="truncate font-mono text-[15px] font-medium tabular-nums text-[var(--foreground)]">
                          ${formatUsdAmount(t.usd)}
                        </span>
                      </div>
                      <div className="h-px w-full bg-[var(--card-border)]/65" />
                      <div className="flex items-baseline justify-between gap-3 py-1.5">
                        <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">EUR</span>
                        <span className="truncate font-mono text-sm font-medium tabular-nums text-[var(--foreground)]">
                          {t.eur != null ? `€${formatEurAmount(t.eur)}` : "—"}
                        </span>
                      </div>
                      <div className="h-px w-full bg-[var(--card-border)]/65" />
                      <div className="flex items-baseline justify-between gap-3 py-1.5">
                        <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">RUB</span>
                        <span className="truncate font-mono text-sm font-medium tabular-nums text-[var(--foreground)]">
                          {t.rub != null ? `₽${formatRubAmount(t.rub)}` : "—"}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {pages.length > 1 && (
          <div className="mt-4 flex flex-col gap-3 border-t border-[var(--card-border)] pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--muted)]">
              Set {safePage + 1} of {pages.length} · {TRADE_CONTROL_QUOTE_ROWS.length} tracked assets
            </p>
            <div className="flex items-center gap-2">
              {pages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPageIndex(i)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    i === safePage
                      ? "w-9 bg-[var(--accent)] shadow-[0_0_10px_var(--accent-dim)]"
                      : "w-2.5 bg-[var(--card-border)] hover:bg-[var(--muted)]/50"
                  }`}
                  aria-label={`Page ${i + 1}`}
                  aria-current={i === safePage}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

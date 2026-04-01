"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TradeDetailExpandable } from "@/components/TradeDetailExpandable";
import { analyticsSummary, analyticsTradesDetailed, type PairPosition } from "@/lib/api";
import { parseBackendUtcDate } from "@/lib/date";
import {
  isAprilFoolsActive,
  jokePairsDetail,
  jokePct,
  jokeSpreadPct,
  jokeUsdt,
} from "@/lib/april-fools";

type Trade = {
  id: number;
  opened_at: string | null;
  closed_at: string | null;
  duration_sec: number;
  entry_spread_pct: number;
  exit_spread_pct: number;
  pnl_pct: number;
  pnl_usdt: number;
  total_volume_usdt?: number;
  long_basket: string | null;
  short_basket: string | null;
  reason: string | null;
  pairs_detail?: Record<string, PairPosition>;
};

function fmtDate(s: string | null) {
  const d = parseBackendUtcDate(s);
  return d ? d.toLocaleString("en-US") : "—";
}

function fmtDuration(sec: number | null | undefined) {
  if (!sec) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<{
    trades_count: number;
    winrate_pct: number;
    pnl_total_pct: number;
    pnl_total_usdt: number;
    avg_trade_pct: number;
  } | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    analyticsSummary().then((r) => r.ok && r.data && setSummary(r.data));
    analyticsTradesDetailed(100).then((r) => r.ok && r.data?.trades && setTrades(r.data.trades));
  }, []);

  const fool = isAprilFoolsActive();
  const displaySummary = useMemo(() => {
    if (!summary) return null;
    if (!fool) return summary;
    return {
      ...summary,
      pnl_total_pct: jokePct(summary.pnl_total_pct),
      pnl_total_usdt: jokeUsdt(summary.pnl_total_usdt),
      avg_trade_pct: jokePct(summary.avg_trade_pct),
      winrate_pct: jokePct(summary.winrate_pct),
    };
  }, [summary, fool]);

  return (
    <DashboardLayout>
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Analytics</h1>

      {displaySummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8"
        >
          {[
            { label: "Trades", value: displaySummary.trades_count },
            { label: "Win rate", value: `${displaySummary.winrate_pct.toFixed(1)}%` },
            {
              label: "PnL %",
              value: `${displaySummary.pnl_total_pct >= 0 ? "+" : ""}${displaySummary.pnl_total_pct.toFixed(2)}%`,
              positive: displaySummary.pnl_total_pct >= 0,
            },
            {
              label: "PnL USDT",
              value: `${displaySummary.pnl_total_usdt >= 0 ? "+" : ""}$${displaySummary.pnl_total_usdt.toFixed(2)}`,
              positive: displaySummary.pnl_total_usdt >= 0,
            },
            { label: "Avg trade", value: `${displaySummary.avg_trade_pct.toFixed(2)}%` },
          ].map(({ label, value, positive }) => (
            <div key={label} className="card-glass p-4">
              <p className="text-sm text-[var(--muted)]">{label}</p>
              <p
                className={`text-xl font-semibold mt-1 ${
                  positive === true ? "text-[var(--positive)]" : positive === false ? "text-[var(--negative)]" : ""
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Trades Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card-glass overflow-hidden"
      >
        <h2 className="text-lg font-medium p-4 md:p-6 pb-0">Trades</h2>
        <p className="text-sm text-[var(--muted)] px-4 md:px-6 pb-2">Click a row to expand positions detail</p>
        <div className="overflow-x-auto p-4 md:p-6 -mx-4 md:mx-0 md:px-6">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[var(--muted)] border-b border-[var(--card-border)]">
                <th className="pb-3 pr-4 w-6"></th>
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">Opened</th>
                <th className="pb-3 pr-4">Closed</th>
                <th className="pb-3 pr-4">Dur.</th>
                <th className="pb-3 pr-4">Entry %</th>
                <th className="pb-3 pr-4">Exit %</th>
                <th className="pb-3 pr-4">PnL %</th>
                <th className="pb-3 pr-4">PnL USDT</th>
                <th className="pb-3 pr-4">Volume</th>
                <th className="pb-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => {
                const hasDetail = t.pairs_detail && Object.keys(t.pairs_detail).length > 0;
                const isExpanded = expandedId === t.id;
                return (
                  <React.Fragment key={t.id}>
                    <tr
                      onClick={() => hasDetail && setExpandedId(isExpanded ? null : t.id)}
                      className={`border-b border-[var(--card-border)]/50 transition ${
                        hasDetail ? "cursor-pointer hover:bg-[var(--card-border)]/20" : ""
                      }`}
                    >
                      <td className="py-3 pr-2">
                        {hasDetail ? (
                          <span className="text-[var(--muted)] text-xs">
                            {isExpanded ? "▼" : "▶"}
                          </span>
                        ) : (
                          <span className="opacity-0">·</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">{t.id}</td>
                      <td className="py-3 pr-4 text-xs">{fmtDate(t.opened_at)}</td>
                      <td className="py-3 pr-4 text-xs">{fmtDate(t.closed_at)}</td>
                      <td className="py-3 pr-4 text-xs">{fmtDuration(t.duration_sec)}</td>
                      <td className="py-3 pr-4">
                        {(fool ? jokeSpreadPct(Number(t.entry_spread_pct)) : Number(t.entry_spread_pct)).toFixed(3)}
                      </td>
                      <td className="py-3 pr-4">
                        {(fool ? jokeSpreadPct(Number(t.exit_spread_pct)) : Number(t.exit_spread_pct)).toFixed(3)}
                      </td>
                      <td
                        className={`py-3 pr-4 font-medium ${
                          (fool ? jokePct(Number(t.pnl_pct)) : Number(t.pnl_pct)) >= 0
                            ? "text-[var(--positive)]"
                            : "text-[var(--negative)]"
                        }`}
                      >
                        {(fool ? jokePct(Number(t.pnl_pct)) : Number(t.pnl_pct)) >= 0 ? "+" : ""}
                        {(fool ? jokePct(Number(t.pnl_pct)) : Number(t.pnl_pct)).toFixed(2)}%
                      </td>
                      <td
                        className={`py-3 pr-4 ${
                          (fool ? jokeUsdt(Number(t.pnl_usdt)) : Number(t.pnl_usdt)) >= 0
                            ? "text-[var(--positive)]"
                            : "text-[var(--negative)]"
                        }`}
                      >
                        ${(fool ? jokeUsdt(Number(t.pnl_usdt)) : Number(t.pnl_usdt)).toFixed(2)}
                      </td>
                      <td className="py-3 pr-4 text-xs text-[var(--muted)]">
                        {t.total_volume_usdt != null
                          ? `$${(fool ? jokeUsdt(Number(t.total_volume_usdt)) : Number(t.total_volume_usdt)).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                          : "—"}
                      </td>
                      <td className="py-3 text-xs text-[var(--muted)]">{t.reason || "—"}</td>
                    </tr>
                    <AnimatePresence>
                      {isExpanded && hasDetail && t.pairs_detail && (
                        <tr key={`${t.id}-detail`} className="border-none">
                          <td colSpan={11} className="p-0 bg-[var(--card-border)]/10 align-top">
                            <TradeDetailExpandable
                              pairsDetail={fool && t.pairs_detail ? jokePairsDetail(t.pairs_detail) : t.pairs_detail!}
                              longBasket={t.long_basket}
                              shortBasket={t.short_basket}
                            />
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {trades.length === 0 && (
            <p className="text-center text-[var(--muted)] py-12">No trades</p>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

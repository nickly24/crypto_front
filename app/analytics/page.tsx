"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { analyticsSummary, analyticsTrades } from "@/lib/api";
import { parseBackendUtcDate } from "@/lib/date";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
  Cell,
} from "recharts";

type Trade = {
  id: number;
  opened_at: string | null;
  closed_at: string | null;
  duration_sec: number;
  entry_spread_pct: number;
  exit_spread_pct: number;
  pnl_pct: number;
  pnl_usdt: number;
  long_basket: string | null;
  short_basket: string | null;
  reason: string | null;
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

  useEffect(() => {
    analyticsSummary().then((r) => r.ok && r.data && setSummary(r.data));
    analyticsTrades(100).then((r) => r.ok && r.data?.trades && setTrades(r.data.trades));
  }, []);

  const pnlByTrade = trades
    .slice()
    .reverse()
    .map((t, i) => ({
      idx: i + 1,
      pnl: Number(t.pnl_pct),
      usdt: Number(t.pnl_usdt),
    }));

  const cumulativePnl = pnlByTrade.map((t, i) => ({
    ...t,
    cumulative: pnlByTrade.slice(0, i + 1).reduce((a, x) => a + x.pnl, 0),
  }));

  return (
    <DashboardLayout>
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Analytics</h1>

      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8"
        >
          {[
            { label: "Trades", value: summary.trades_count },
            { label: "Win rate", value: `${summary.winrate_pct.toFixed(1)}%` },
            {
              label: "PnL %",
              value: `${summary.pnl_total_pct >= 0 ? "+" : ""}${summary.pnl_total_pct.toFixed(2)}%`,
              positive: summary.pnl_total_pct >= 0,
            },
            {
              label: "PnL USDT",
              value: `${summary.pnl_total_usdt >= 0 ? "+" : ""}$${summary.pnl_total_usdt.toFixed(2)}`,
              positive: summary.pnl_total_usdt >= 0,
            },
            { label: "Avg trade", value: `${summary.avg_trade_pct.toFixed(2)}%` },
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

      {/* PnL Charts */}
      {cumulativePnl.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card-glass p-4 md:p-6 min-w-0 overflow-hidden"
          >
            <h2 className="text-sm font-medium text-[var(--muted)] mb-4">PnL by trade (%)</h2>
            <div className="h-40 sm:h-52 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pnlByTrade} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                  <XAxis dataKey="idx" tick={{ fill: "var(--muted)", fontSize: 10 }} label={{ value: "Trade", position: "insideBottom", offset: -2, fill: "var(--muted)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8 }}
                    formatter={(v: number) => [`${v.toFixed(3)}%`, "PnL"]}
                  />
                  <ReferenceLine y={0} stroke="var(--muted)" strokeDasharray="3 3" />
                  <Bar dataKey="pnl" isAnimationActive radius={[3, 3, 0, 0]}>
                    {pnlByTrade.map((entry, i) => (
                      <Cell key={i} fill={entry.pnl >= 0 ? "var(--positive)" : "var(--negative)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-glass p-4 md:p-6 min-w-0 overflow-hidden"
          >
            <h2 className="text-sm font-medium text-[var(--muted)] mb-4">Cumulative PnL (%)</h2>
            <div className="h-40 sm:h-52 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativePnl} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                  <XAxis dataKey="idx" tick={{ fill: "var(--muted)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8 }}
                    formatter={(v: number) => [`${v.toFixed(3)}%`, "Cumulative PnL"]}
                  />
                  <ReferenceLine y={0} stroke="var(--muted)" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="cumulative" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)", r: 2 }} isAnimationActive />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* Trades Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card-glass overflow-hidden"
      >
        <h2 className="text-lg font-medium p-4 md:p-6 pb-0">Trades</h2>
        <div className="overflow-x-auto p-4 md:p-6 -mx-4 md:mx-0 md:px-6">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[var(--muted)] border-b border-[var(--card-border)]">
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">Opened</th>
                <th className="pb-3 pr-4">Closed</th>
                <th className="pb-3 pr-4">Dur.</th>
                <th className="pb-3 pr-4">Entry %</th>
                <th className="pb-3 pr-4">Exit %</th>
                <th className="pb-3 pr-4">PnL %</th>
                <th className="pb-3 pr-4">PnL USDT</th>
                <th className="pb-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-b border-[var(--card-border)]/50 hover:bg-[var(--card-border)]/20 transition">
                  <td className="py-3 pr-4">{t.id}</td>
                  <td className="py-3 pr-4 text-xs">{fmtDate(t.opened_at)}</td>
                  <td className="py-3 pr-4 text-xs">{fmtDate(t.closed_at)}</td>
                  <td className="py-3 pr-4 text-xs">{fmtDuration(t.duration_sec)}</td>
                  <td className="py-3 pr-4">{Number(t.entry_spread_pct).toFixed(3)}</td>
                  <td className="py-3 pr-4">{Number(t.exit_spread_pct).toFixed(3)}</td>
                  <td className={`py-3 pr-4 font-medium ${Number(t.pnl_pct) >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                    {Number(t.pnl_pct) >= 0 ? "+" : ""}{Number(t.pnl_pct).toFixed(2)}%
                  </td>
                  <td className={`py-3 pr-4 ${Number(t.pnl_usdt) >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                    ${Number(t.pnl_usdt).toFixed(2)}
                  </td>
                  <td className="py-3 text-xs text-[var(--muted)]">{t.reason || "—"}</td>
                </tr>
              ))}
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

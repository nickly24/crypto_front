"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import Link from "next/link";
import {
  botStatus,
  analyticsSummary,
  analyticsTrades,
  botStart,
  botStop,
  botClosePosition,
  getBotConfig,
} from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Customized,
} from "recharts";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Layers,
  Maximize2,
  Play,
  Settings2,
  Square,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from "lucide-react";

type BotStatusData = {
  alive?: boolean;
  db_state?: {
    actual_state?: string;
    current_spread_pct?: number | string | null;
    balance_usdt?: number | string | null;
    available_usdt?: number | string | null;
    pnl_total_pct?: number | string;
    pnl_long_pct?: number | string;
    pnl_short_pct?: number | string;
    pnl_total_usdt?: number | string | null;
    position_open?: number;
    long_basket?: string | null;
    short_basket?: string | null;
    buy_basket?: string | null;
    sell_basket?: string | null;
    positions_data?: string | Record<string, { side?: string; qty?: number; avg_price?: number; upl?: number }> | null;
    entry_spread_pct?: number | string | null;
    entry_time?: string | null;
    connection_status?: string;
    quotes_snapshot?: string;
    reference_prices?: string | null;
    updated_at?: string;
    running_since?: string;
    okx_ping_ms?: number;
    dca_count_current?: number;
  };
  pid?: number;
  uptime_seconds?: number;
};

type BotConfig = {
  baskets: Array<{ basket1: string; basket2: string }>;
  params: Record<string, number | boolean>;
  modes: Record<string, boolean>;
};

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

const POLL_INTERVAL_MS = 2500;

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  return typeof v === "number" ? v : parseFloat(v) || 0;
}

function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleString("ru");
}

function fmtDuration(sec: number | null | undefined) {
  if (!sec) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}ч ${m}м`;
  return `${m}м`;
}

export default function DashboardPage() {
  const [status, setStatus] = useState<BotStatusData | null>(null);
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    trades_count: number;
    winrate_pct: number;
    pnl_total_pct: number;
    pnl_total_usdt: number;
    avg_trade_pct: number;
  } | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [botActionLoading, setBotActionLoading] = useState(false);
  const [botActionLabel, setBotActionLabel] = useState<string | null>(null);
  const [spreadHistory, setSpreadHistory] = useState<Array<{ t: string; v: number }>>([]);
  const [pnlHistory, setPnlHistory] = useState<Array<{ t: string; v: number }>>([]);
  const pollVersionRef = useRef(0);

  function fetchConfig() {
    getBotConfig().then((r) => {
      setConfigLoaded(true);
      if (r.ok && r.data) {
        setConfig(r.data);
        setConfigError(null);
      } else {
        setConfig({ baskets: [], params: {}, modes: {} });
        setConfigError(r.error || "Ошибка загрузки");
      }
    });
  }

  function fetchStatus() {
    pollVersionRef.current += 1;
    const myVersion = pollVersionRef.current;
    botStatus().then((r) => {
      if (pollVersionRef.current !== myVersion) return; // устаревший ответ — игнорируем
      if (r.ok && r.data) {
        const d = r.data as unknown as BotStatusData;
        setStatus(d);
        const sp = d.db_state?.current_spread_pct;
        if (sp != null) {
          const v = num(sp);
          setSpreadHistory((prev) => {
            const now = new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            const next = [...prev, { t: now, v }];
            return next.length > 60 ? next.slice(-60) : next;
          });
        }
        if (d.db_state?.position_open === 1) {
          const pnlVal = d.db_state?.pnl_total_pct;
          if (pnlVal != null) {
            const p = num(pnlVal);
            setPnlHistory((prev) => {
              const now = new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
              const next = [...prev, { t: now, v: p }];
              return next.length > 60 ? next.slice(-60) : next;
            });
          }
        } else {
          setPnlHistory([]);
        }
      }
    });
  }

  function fetchSummary() {
    analyticsSummary().then((r) => r.ok && r.data && setSummary(r.data));
  }

  function fetchTrades() {
    analyticsTrades(10).then((r) => r.ok && r.data?.trades && setTrades(r.data.trades));
  }

  useEffect(() => {
    fetchStatus();
    fetchSummary();
    fetchConfig();
    fetchTrades();
    const id = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  async function handleStart() {
    setBotActionLoading(true);
    setBotActionLabel("Запуск бота...");
    try {
      const r = await botStart();
      if (r.ok && r.data?.status === "started") {
        setBotActionLabel("Бот запущен");
      } else {
        setBotActionLabel("Перезагрузка...");
        setTimeout(() => window.location.reload(), 500);
        return;
      }
    } catch {
      setBotActionLabel("Перезагрузка...");
      setTimeout(() => window.location.reload(), 500);
      return;
    }
    fetchStatus();
    setTimeout(() => { setBotActionLoading(false); setBotActionLabel(null); }, 1500);
  }

  async function handleStop() {
    setBotActionLoading(true);
    setBotActionLabel("Остановка бота...");
    try {
      const r = await botStop();
      if (r.ok && r.data?.status === "stopped") {
        setBotActionLabel("Бот остановлен");
      } else {
        setBotActionLabel("Перезагрузка...");
        setTimeout(() => window.location.reload(), 500);
        return;
      }
    } catch {
      setBotActionLabel("Перезагрузка...");
      setTimeout(() => window.location.reload(), 500);
      return;
    }
    fetchStatus();
    setTimeout(() => { setBotActionLoading(false); setBotActionLabel(null); }, 1500);
  }

  async function handleClosePosition() {
    if (!confirm("Закрыть текущую позицию?")) return;
    setBotActionLoading(true);
    setBotActionLabel("Закрытие позиции на бирже...");
    try {
      const r = await botClosePosition();
      if (r.ok && r.data?.position_closed) {
        const pnl = r.data?.trade?.pnl_pct;
        setBotActionLabel(
          pnl != null ? `Позиция закрыта (PnL: ${Number(pnl) >= 0 ? "+" : ""}${Number(pnl).toFixed(3)}%)` : "Позиция закрыта"
        );
      } else if (r.ok && r.data?.status === "timeout") {
        setBotActionLabel("Закрытие заняло больше времени — проверьте OKX");
      } else {
        setBotActionLabel("Ошибка закрытия — проверьте OKX");
      }
    } catch {
      setBotActionLabel("Ошибка закрытия");
    }
    fetchStatus();
    fetchTrades();
    fetchSummary();
    setTimeout(() => { setBotActionLoading(false); setBotActionLabel(null); }, 3000);
  }

  const ds = status?.db_state;
  const spread = ds?.current_spread_pct != null ? num(ds.current_spread_pct) : null;
  const balance = num(ds?.balance_usdt);
  const available = num(ds?.available_usdt);
  const pnl = num(ds?.pnl_total_pct);
  const pnlLong = num(ds?.pnl_long_pct);
  const pnlShort = num(ds?.pnl_short_pct);
  const pnlUsdt = ds?.pnl_total_usdt != null ? num(ds.pnl_total_usdt) : null;
  const positionOpen = ds?.position_open === 1;
  const entrySpread = ds?.entry_spread_pct != null ? num(ds.entry_spread_pct) : null;
  const ping = ds?.okx_ping_ms ?? null;
  const longBasket = ds?.long_basket ?? null;

  const tpPct = config?.params?.take_profit_pct != null ? Number(config.params.take_profit_pct) : null;
  const slPct = config?.params?.stop_loss_pct != null ? Number(config.params.stop_loss_pct) : null;
  const slEnabled = config?.params?.stop_loss_enabled ?? false;

  const spreadLevels = useMemo(() => {
    if (!positionOpen || entrySpread == null) return null;
    const isLongB2 = longBasket === "basket2";
    const tp = tpPct != null ? (isLongB2 ? entrySpread - tpPct : entrySpread + tpPct) : null;
    const sl = slPct != null && slEnabled ? (isLongB2 ? entrySpread + slPct : entrySpread - slPct) : null;
    const deviation = spread != null ? spread - entrySpread : null;
    return { entry: entrySpread, tp, sl, deviation };
  }, [positionOpen, entrySpread, longBasket, tpPct, slPct, slEnabled, spread]);

  const quotes: Record<string, number> = useMemo(() => {
    if (!ds?.quotes_snapshot) return {};
    try { return JSON.parse(ds.quotes_snapshot); } catch { return {}; }
  }, [ds?.quotes_snapshot]);

  const refPrices: Record<string, number> = useMemo(() => {
    if (!ds?.reference_prices) return {};
    try { return JSON.parse(ds.reference_prices); } catch { return {}; }
  }, [ds?.reference_prices]);

  const quotesArr = useMemo(() => {
    return Object.entries(quotes).map(([sym, price]) => {
      const ref = refPrices[sym];
      const change = ref ? ((price - ref) / ref) * 100 : null;
      return { symbol: sym, price, change };
    }).sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [quotes, refPrices]);

  const positionsBreakdown = useMemo(() => {
    if (!positionOpen || !config?.baskets?.length || !ds?.positions_data) return null;
    let positions: Record<string, { side?: string; qty?: number; avg_price?: number; upl?: number; fee?: number; fundingFee?: number }> = {};
    try {
      const raw = ds.positions_data;
      positions = typeof raw === "string" ? JSON.parse(raw) : raw || {};
    } catch {
      return null;
    }
    const entries = Object.entries(positions);
    if (entries.length === 0) return null;
    const longSyms = new Set(
      (ds.long_basket === "basket2" ? config.baskets.map((b) => b.basket2) : config.baskets.map((b) => b.basket1))
    );
    const shortSyms = new Set(
      (ds.short_basket === "basket2" ? config.baskets.map((b) => b.basket2) : config.baskets.map((b) => b.basket1))
    );
    const longItems: Array<{ instId: string; shortName: string; upl: number }> = [];
    const shortItems: Array<{ instId: string; shortName: string; upl: number }> = [];
    let longTotal = 0;
    let shortTotal = 0;
    let totalCommission = 0;
    for (const [instId, p] of entries) {
      const upl = num(p?.upl ?? 0);
      const fee = num(p?.fee ?? 0);
      const fundingFee = num(p?.fundingFee ?? 0);
      totalCommission += fee + fundingFee;
      const side = longSyms.has(instId) ? "long" : "short";
      const shortName = instId.replace("-USDT-SWAP", "");
      if (side === "long") {
        longTotal += upl;
        longItems.push({ instId, shortName, upl });
      } else {
        shortTotal += upl;
        shortItems.push({ instId, shortName, upl });
      }
    }
    return { longItems, shortItems, longTotal, shortTotal, totalCommission };
  }, [positionOpen, config?.baskets, ds?.positions_data, ds?.long_basket, ds?.short_basket]);

  const profitData = [
    { period: "1H", value: summary ? summary.avg_trade_pct * 0.3 : 0 },
    { period: "1D", value: summary ? summary.avg_trade_pct * 0.6 : 0 },
    { period: "1W", value: summary ? summary.avg_trade_pct : 0 },
    { period: "1M", value: summary ? summary.pnl_total_pct * 0.5 : 0 },
    { period: "ALL", value: summary ? summary.pnl_total_pct : 0 },
  ];

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 20 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { duration: 0.3, delay },
  });

  return (
    <DashboardLayout>
      <AnimatePresence>
        {botActionLoading && botActionLabel && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-lg flex items-center gap-3"
          >
            <span className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">{botActionLabel}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-2xl font-semibold mb-6">Мой дашборд</h1>

      {/* Row 1: Overview, Spread & PnL (expanded) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview */}
        <motion.div {...anim(0)} className="card-glass p-6 lg:col-span-1">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-4">Баланс</h2>
          <p className="text-3xl font-semibold">
            ${balance.toFixed(2)}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">
            Доступно: ${available.toFixed(2)}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="p-2 rounded bg-[var(--background)]/50 text-center">
              <p className="text-xs text-[var(--muted)]">PnL Long</p>
              <p className={`text-sm font-semibold ${pnlLong >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                {pnlLong >= 0 ? "+" : ""}{pnlLong.toFixed(3)}%
              </p>
            </div>
            <div className="p-2 rounded bg-[var(--background)]/50 text-center">
              <p className="text-xs text-[var(--muted)]">PnL Short</p>
              <p className={`text-sm font-semibold ${pnlShort >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                {pnlShort >= 0 ? "+" : ""}{pnlShort.toFixed(3)}%
              </p>
            </div>
            <div className="p-2 rounded bg-[var(--background)]/50 text-center">
              <p className="text-xs text-[var(--muted)]">PnL Total</p>
              <p className={`text-sm font-semibold ${pnl >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                {pnl >= 0 ? "+" : ""}{pnl.toFixed(3)}%
              </p>
              {positionOpen && pnlUsdt != null && (
                <p className={`text-xs mt-0.5 ${pnlUsdt >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                  {pnlUsdt >= 0 ? "+" : ""}${pnlUsdt.toFixed(2)}
                </p>
              )}
              {positionOpen && positionsBreakdown && positionsBreakdown.totalCommission !== 0 && (
                <p className="text-xs mt-0.5 text-[var(--muted)]">
                  Комиссия: {positionsBreakdown.totalCommission >= 0 ? "+" : ""}${positionsBreakdown.totalCommission.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Spread & Chart */}
        <motion.div {...anim(0.05)} className="card-glass p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-[var(--muted)]">Спред (live)</h2>
            <div className="flex gap-1">
              <Link
                href="/dashboard/chart?mode=spread"
                className="p-1.5 rounded-lg hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] transition"
                title="Развернуть график спреда"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/chart?mode=instruments"
                className="p-1.5 rounded-lg hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] transition"
                title="График инструментов"
              >
                <Layers className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="flex items-baseline gap-3 mb-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={spread ?? "na"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-2xl font-bold text-[var(--accent)]"
              >
                {spread != null ? `${spread.toFixed(4)}%` : "—"}
              </motion.span>
            </AnimatePresence>
            {ping != null && (
              <span className="text-xs text-[var(--muted)]">{ping}ms</span>
            )}
          </div>

          {spreadLevels && (
            <div className="flex items-center gap-3 mb-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-amber-400 inline-block" style={{ borderTop: "2px dashed" }} />
                <span className="text-[var(--muted)]">Вход: {spreadLevels.entry.toFixed(4)}%</span>
              </span>
              {spreadLevels.sl != null && (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 inline-block" style={{ borderTop: "2px dashed rgb(239,68,68)" }} />
                  <span className="text-[var(--muted)]">SL: {spreadLevels.sl.toFixed(4)}%</span>
                </span>
              )}
              {spreadLevels.deviation != null && (
                <span className={`font-semibold ml-auto ${
                  spreadLevels.deviation >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
                }`}>
                  {spreadLevels.deviation >= 0 ? "+" : ""}{spreadLevels.deviation.toFixed(4)}%
                </span>
              )}
            </div>
          )}

          <div className={`flex gap-4 ${spreadLevels ? "flex-row" : ""}`}>
          <div className={`flex-1 min-w-0 ${spreadLevels ? "h-40" : "h-28"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spreadHistory} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis
                  hide
                  domain={[
                    (dataMin: number) => {
                      if (!isFinite(dataMin)) return -0.2;
                      let min = dataMin;
                      if (spreadLevels) {
                        min = Math.min(min, spreadLevels.entry);
                        if (spreadLevels.sl != null) min = Math.min(min, spreadLevels.sl);
                      }
                      return min - 0.01;
                    },
                    (dataMax: number) => {
                      if (!isFinite(dataMax)) return 0.2;
                      let max = dataMax;
                      if (spreadLevels) {
                        max = Math.max(max, spreadLevels.entry);
                        if (spreadLevels.sl != null) max = Math.max(max, spreadLevels.sl);
                      }
                      return max + 0.01;
                    },
                  ]}
                />
                <Tooltip
                  contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${typeof v === "number" ? v.toFixed(4) : v}%`, "Спред"]}
                />
                <Area type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={1.5} fill="url(#spreadGrad)" isAnimationActive={false} />
                {spreadLevels && (
                  <Customized
                    component={(props: { yAxisMap?: Record<string, { scale: (v: number) => number }>; offset?: { left: number; width: number; height: number } }) => {
                      const yAxis = props.yAxisMap && Object.values(props.yAxisMap)[0];
                      const { width = 0 } = props.offset || {};
                      if (!yAxis?.scale || width <= 0) return null;
                      const scale = yAxis.scale;
                      const lines: Array<{ y: number; stroke: string; dash: string }> = [
                        { y: spreadLevels.entry, stroke: "#f59e0b", dash: "6 3" },
                        ...(spreadLevels.sl != null ? [{ y: spreadLevels.sl, stroke: "#ef4444", dash: "4 4" }] : []),
                      ];
                      return (
                        <g>
                          {lines.map((l, i) => {
                            const py = scale(l.y);
                            if (!isFinite(py)) return null;
                            return (
                              <line
                                key={i}
                                x1={0}
                                y1={py}
                                x2={width}
                                y2={py}
                                stroke={l.stroke}
                                strokeWidth={1.5}
                                strokeDasharray={l.dash}
                              />
                            );
                          })}
                        </g>
                      );
                    }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {spreadLevels && tpPct != null && (
            <div className="flex-1 min-w-0 h-40 flex flex-col">
              <p className="text-xs text-[var(--muted)] mb-1">PnL Live</p>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pnlHistory} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <defs>
                      <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" hide />
                    <YAxis
                      hide
                      domain={[
                        (dataMin: number) => {
                          const d = isFinite(dataMin) ? dataMin : 0;
                          return Math.min(0, d, -tpPct * 0.5) - 0.01;
                        },
                        (dataMax: number) => {
                          const d = isFinite(dataMax) ? dataMax : 0;
                          return Math.max(tpPct * 1.2, d, 0) + 0.01;
                        },
                      ]}
                    />
                    <Tooltip
                      contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [`${typeof v === "number" ? (v >= 0 ? "+" : "") + v.toFixed(3) : v}%`, "PnL"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="var(--accent)"
                      strokeWidth={1.5}
                      fill="url(#pnlGrad)"
                      isAnimationActive={false}
                    />
                    <Customized
                      component={(props: { yAxisMap?: Record<string, { scale: (v: number) => number }>; offset?: { left: number; width: number; height: number } }) => {
                        const yAxis = props.yAxisMap && Object.values(props.yAxisMap)[0];
                        const { width = 0 } = props.offset || {};
                        if (!yAxis?.scale || width <= 0) return null;
                        const scale = yAxis.scale;
                        const lines: Array<{ y: number; stroke: string; dash: string }> = [
                          { y: 0, stroke: "#f59e0b", dash: "6 3" },
                          { y: tpPct, stroke: "#22c55e", dash: "4 4" },
                        ];
                        return (
                          <g>
                            {lines.map((l, i) => {
                              const py = scale(l.y);
                              if (!isFinite(py)) return null;
                              return (
                                <line
                                  key={i}
                                  x1={0}
                                  y1={py}
                                  x2={width}
                                  y2={py}
                                  stroke={l.stroke}
                                  strokeWidth={1.5}
                                  strokeDasharray={l.dash}
                                />
                              );
                            })}
                          </g>
                        );
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted)]">
                <span>0%</span>
                <span className="text-[var(--positive)]">TP: +{tpPct.toFixed(2)}%</span>
              </div>
            </div>
          )}
          </div>
        </motion.div>
      </div>

      {/* Bot status */}
      <motion.div {...anim(0.08)} className="card-glass p-4 mt-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${status?.alive ? "bg-[var(--positive)] animate-pulse" : "bg-[var(--negative)]"}`} />
          <span className="font-medium">{status?.alive ? "Бот активен" : "Бот остановлен"}</span>
        </div>
        {status?.alive && (
          <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
            <span>Uptime: {status?.uptime_seconds != null ? fmtDuration(status.uptime_seconds) : "—"}</span>
            <span>Состояние: {ds?.actual_state || "—"}</span>
            <span>Подключение: {ds?.connection_status || "—"}</span>
          </div>
        )}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={handleStart}
            disabled={botActionLoading || !!status?.alive}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--positive)]/20 text-[var(--positive)] hover:bg-[var(--positive)]/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Play className="w-4 h-4" />
            Старт
          </button>
          <button
            onClick={handleStop}
            disabled={botActionLoading || !status?.alive}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--negative)]/20 text-[var(--negative)] hover:bg-[var(--negative)]/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Square className="w-4 h-4" />
            Стоп
          </button>
        </div>
      </motion.div>

      {/* Row 2: Current Position + Quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Current Position */}
        <motion.div {...anim(0.15)} className="card-glass p-6">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Текущая позиция
          </h2>
          {positionOpen ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[var(--positive)]/10 border border-[var(--positive)]/20">
                  <div className="flex items-center gap-1 text-[var(--positive)]">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">LONG</span>
                  </div>
                  <p className="text-sm font-semibold mt-1">{ds?.long_basket || "—"}</p>
                  <p className={`text-lg font-bold mt-1 ${pnlLong >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                    {pnlLong >= 0 ? "+" : ""}{pnlLong.toFixed(3)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--negative)]/10 border border-[var(--negative)]/20">
                  <div className="flex items-center gap-1 text-[var(--negative)]">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">SHORT</span>
                  </div>
                  <p className="text-sm font-semibold mt-1">{ds?.short_basket || "—"}</p>
                  <p className={`text-lg font-bold mt-1 ${pnlShort >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                    {pnlShort >= 0 ? "+" : ""}{pnlShort.toFixed(3)}%
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-2 rounded bg-[var(--background)]/50">
                  <p className="text-xs text-[var(--muted)]">Спред входа</p>
                  <p className="font-medium">{entrySpread != null ? `${entrySpread.toFixed(4)}%` : "—"}</p>
                </div>
                <div className="p-2 rounded bg-[var(--background)]/50">
                  <p className="text-xs text-[var(--muted)]">DCA</p>
                  <p className="font-medium">{ds?.dca_count_current ?? 0}</p>
                </div>
                <div className="p-2 rounded bg-[var(--background)]/50">
                  <p className="text-xs text-[var(--muted)]">Суммарный PnL</p>
                  <p className={`font-medium ${pnl >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                    {pnl >= 0 ? "+" : ""}{pnl.toFixed(3)}%
                    {pnlUsdt != null && (
                      <span className={`block text-xs mt-0.5 ${pnlUsdt >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                        {pnlUsdt >= 0 ? "+" : ""}${pnlUsdt.toFixed(2)}
                      </span>
                    )}
                    {positionsBreakdown && positionsBreakdown.totalCommission !== 0 && (
                      <span className="block text-xs mt-0.5 text-[var(--muted)]">
                        Комиссия: {positionsBreakdown.totalCommission >= 0 ? "+" : ""}${positionsBreakdown.totalCommission.toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {positionsBreakdown && (
                <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
                  <p className="text-xs text-[var(--muted)] mb-2">Позиции по инструментам (PnL USDT)</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-h-44 overflow-y-auto">
                    <div>
                      <p className="text-xs font-medium text-[var(--positive)] mb-1">LONG</p>
                      {positionsBreakdown.longItems.map((item) => (
                        <div key={item.instId} className="flex items-center justify-between py-1 px-2 rounded bg-[var(--positive)]/5 text-sm">
                          <span>{item.shortName}</span>
                          <span className={`font-medium ${item.upl >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                            {item.upl >= 0 ? "+" : ""}${item.upl.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--negative)] mb-1">SHORT</p>
                      {positionsBreakdown.shortItems.map((item) => (
                        <div key={item.instId} className="flex items-center justify-between py-1 px-2 rounded bg-[var(--negative)]/5 text-sm">
                          <span>{item.shortName}</span>
                          <span className={`font-medium ${item.upl >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                            {item.upl >= 0 ? "+" : ""}${item.upl.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--card-border)]/50 text-sm">
                    <span className="text-[var(--muted)]">LONG: <span className={`font-medium ${positionsBreakdown.longTotal >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>{positionsBreakdown.longTotal >= 0 ? "+" : ""}${positionsBreakdown.longTotal.toFixed(2)}</span></span>
                    <span className="text-[var(--muted)]">SHORT: <span className={`font-medium ${positionsBreakdown.shortTotal >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>{positionsBreakdown.shortTotal >= 0 ? "+" : ""}${positionsBreakdown.shortTotal.toFixed(2)}</span></span>
                  </div>
                  {positionsBreakdown.totalCommission !== 0 && (
                    <div className="mt-1 text-sm text-[var(--muted)] text-right">
                      Комиссия: {positionsBreakdown.totalCommission >= 0 ? "+" : ""}${positionsBreakdown.totalCommission.toFixed(2)}
                    </div>
                  )}
                  <div className="mt-1 text-sm font-semibold text-right">
                    <span className="text-[var(--muted)]">Итого: </span>
                    <span className={pnlUsdt != null && pnlUsdt >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}>
                      {pnlUsdt != null ? `${pnlUsdt >= 0 ? "+" : ""}$${pnlUsdt.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={handleClosePosition}
                disabled={botActionLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--negative)]/15 text-[var(--negative)] border border-[var(--negative)]/20 hover:bg-[var(--negative)]/25 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
              >
                <X className="w-4 h-4" />
                Закрыть позицию
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-[var(--muted)]">
              <Activity className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Нет открытой позиции</p>
            </div>
          )}
        </motion.div>

        {/* Quotes Table */}
        <motion.div {...anim(0.2)} className="card-glass p-6">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-4">Котировки инструментов</h2>
          {quotesArr.length > 0 ? (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {quotesArr.map((q) => (
                <div key={q.symbol} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--background)]/50 hover:bg-[var(--background)]/80 transition">
                  <span className="text-sm font-medium">{q.symbol.replace("-USDT-SWAP", "")}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono">${q.price.toFixed(q.price < 1 ? 5 : 2)}</span>
                    {q.change != null && (
                      <span className={`text-xs font-medium w-16 text-right ${q.change >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                        {q.change >= 0 ? "+" : ""}{q.change.toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)] text-center py-8">Нет данных</p>
          )}
        </motion.div>
      </div>

      {/* Row 3: Stats + Profit Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <motion.div {...anim(0.25)} className="card-glass p-6 lg:col-span-2">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-4">Статистика</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[var(--background)]/50">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Activity className="w-4 h-4" />
                <span className="text-xs">Сделок</span>
              </div>
              <p className="text-xl font-semibold mt-1">{summary?.trades_count ?? 0}</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--background)]/50">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Винрейт</span>
              </div>
              <p className="text-xl font-semibold mt-1">{summary?.winrate_pct != null ? `${summary.winrate_pct.toFixed(1)}%` : "—"}</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--background)]/50">
              <span className="text-xs text-[var(--muted)]">PnL %</span>
              <p className={`text-xl font-semibold mt-1 ${(summary?.pnl_total_pct ?? 0) >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                {summary?.pnl_total_pct != null ? `${summary.pnl_total_pct >= 0 ? "+" : ""}${summary.pnl_total_pct.toFixed(2)}%` : "—"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--background)]/50">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Wallet className="w-4 h-4" />
                <span className="text-xs">PnL USDT</span>
              </div>
              <p className={`text-xl font-semibold mt-1 ${(summary?.pnl_total_usdt ?? 0) >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                {summary?.pnl_total_usdt != null ? `${summary.pnl_total_usdt >= 0 ? "+" : ""}$${summary.pnl_total_usdt.toFixed(2)}` : "—"}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div {...anim(0.3)} className="card-glass p-6">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-4">Прибыль</h2>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                <XAxis dataKey="period" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Row 4: Baskets + Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div {...anim(0.3)} className="card-glass p-6">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Корзины (пары)
          </h2>
          {configError && <p className="text-sm text-amber-500 mb-2">{configError}</p>}
          {config?.baskets && config.baskets.length > 0 ? (
            <div className="space-y-2">
              {config.baskets.map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background)]/50">
                  <span className="text-xs text-[var(--muted)] w-8">#{i + 1}</span>
                  <span className="font-medium text-[var(--positive)]">{b.basket1}</span>
                  <span className="text-[var(--muted)]">vs</span>
                  <span className="font-medium text-[var(--negative)]">{b.basket2}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">Нет настроенных корзин</p>
          )}
        </motion.div>

        <motion.div {...anim(0.35)} className="card-glass p-6">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-4 flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Настройки входа
          </h2>
          {configError && <p className="text-sm text-amber-500 mb-2">{configError}</p>}
          {config?.params && Object.keys(config.params).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[var(--background)]/50">
                <p className="text-xs text-[var(--muted)]">Вход спред %</p>
                <p className="font-semibold text-[var(--accent)]">{typeof config.params.entry_spread_pct === "number" ? `${config.params.entry_spread_pct.toFixed(2)}%` : "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--background)]/50">
                <p className="text-xs text-[var(--muted)]">Тейк-профит %</p>
                <p className="font-semibold text-[var(--positive)]">{typeof config.params.take_profit_pct === "number" ? `${config.params.take_profit_pct.toFixed(2)}%` : "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--background)]/50">
                <p className="text-xs text-[var(--muted)]">Стоп-лосс %</p>
                <p className="font-semibold text-[var(--negative)]">{typeof config.params.stop_loss_pct === "number" ? `${config.params.stop_loss_pct.toFixed(2)}%` : "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--background)]/50">
                <p className="text-xs text-[var(--muted)]">Позиция %</p>
                <p className="font-semibold">{config.params.position_size_pct ?? "—"}%</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--background)]/50">
                <p className="text-xs text-[var(--muted)]">DCA шаг %</p>
                <p className="font-semibold">{typeof config.params.dca_step_pct === "number" ? `${config.params.dca_step_pct.toFixed(2)}%` : "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--background)]/50">
                <p className="text-xs text-[var(--muted)]">Плечо</p>
                <p className="font-semibold">{config.params.leverage ?? "—"}x</p>
              </div>
            </div>
          ) : configLoaded ? (
            <p className="text-sm text-[var(--muted)]">{configError ? "Конфиг не найден" : "Параметры не заданы"}</p>
          ) : (
            <p className="text-sm text-[var(--muted)]">Загрузка...</p>
          )}
        </motion.div>
      </div>

      {/* Row 5: Recent Trades */}
      <motion.div {...anim(0.4)} className="card-glass p-6 mt-6">
        <h2 className="text-sm font-medium text-[var(--muted)] mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Последние сделки
        </h2>
        {trades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--muted)] border-b border-[var(--card-border)]">
                  <th className="pb-3 pr-4">Открыта</th>
                  <th className="pb-3 pr-4">Закрыта</th>
                  <th className="pb-3 pr-4">Длит.</th>
                  <th className="pb-3 pr-4">Вход %</th>
                  <th className="pb-3 pr-4">Выход %</th>
                  <th className="pb-3 pr-4">PnL %</th>
                  <th className="pb-3 pr-4">PnL USDT</th>
                  <th className="pb-3">Причина</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-[var(--card-border)]/50 hover:bg-[var(--card-border)]/20 transition">
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
          </div>
        ) : (
          <p className="text-center text-[var(--muted)] py-8">Нет сделок</p>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

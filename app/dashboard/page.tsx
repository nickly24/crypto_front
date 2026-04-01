"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import Link from "next/link";
import {
  botStatus,
  analyticsSummary,
  analyticsTradesDetailed,
  botStart,
  botStop,
  botClosePosition,
  getBotConfig,
  syncSubscriptionAfterPayment,
  botPositionsLive,
  LivePosition,
} from "@/lib/api";
import { parseBackendUtcDate } from "@/lib/date";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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
  HelpCircle,
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
import { CryptoIcon } from "@/components/CryptoIcon";
import { TradeDetailExpandable } from "@/components/TradeDetailExpandable";
import { GuideTour } from "@/components/GuideTour";
import { DASHBOARD_TOUR_STEPS } from "@/lib/tour-steps";
import { useFiatRates } from "@/lib/useFiatRates";
import { useAuth } from "@/providers/auth";
import { useTheme } from "@/providers/theme";
import {
  APRIL_FOOLS_POSITION_TARGET_USDT,
  foolLivePositionsUpl,
  foolPositionBreakdown,
  jokeLiquidationBarRatio,
  jokePairsDetail,
  jokePct,
  jokeQty,
  jokeSpreadPct,
  jokeUsdt,
  isAprilFoolsActive,
} from "@/lib/april-fools";

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

type PairPosition = { qty: number; upl: number; avg_price: number; side?: string };

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

const POLL_INTERVAL_MS = 2500;

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  return typeof v === "number" ? v : parseFloat(v) || 0;
}

function fmtDate(s: string | null | undefined) {
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

function DashboardPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paymentParam = searchParams.get("payment");
  const { refreshUser } = useAuth();
  const paymentReturnHandledRef = useRef(false);
  const [tourOpen, setTourOpen] = useState(false);
  const paymentSuccessTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
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
  const [expandedTradeId, setExpandedTradeId] = useState<number | null>(null);
  const [botActionLoading, setBotActionLoading] = useState(false);
  const [botActionLabel, setBotActionLabel] = useState<string | null>(null);
  const [spreadHistory, setSpreadHistory] = useState<Array<{ t: string; v: number }>>([]);
  const [pnlHistory, setPnlHistory] = useState<Array<{ t: string; v: number }>>([]);
  const [livePositions, setLivePositions] = useState<LivePosition[] | null>(null);
  const pollVersionRef = useRef(0);
  const fiatRates = useFiatRates();
  const { positiveColor, negativeColor, accentColor } = useTheme();
  const fool = isAprilFoolsActive();

  function fetchConfig() {
    getBotConfig().then((r) => {
      setConfigLoaded(true);
      if (r.ok && r.data) {
        setConfig(r.data);
        setConfigError(null);
      } else {
        setConfig({ baskets: [], params: {}, modes: {} });
        setConfigError(r.error || "Load error");
      }
    });
  }

  function fetchStatus() {
    pollVersionRef.current += 1;
    const myVersion = pollVersionRef.current;
    botStatus().then((r) => {
      if (pollVersionRef.current !== myVersion) return; // stale response — ignore
      if (r.ok && r.data) {
        const d = r.data as unknown as BotStatusData;
        setStatus(d);
        const sp = d.db_state?.current_spread_pct;
        if (sp != null) {
          const v = num(sp);
          setSpreadHistory((prev) => {
            const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            const next = [...prev, { t: now, v }];
            return next.length > 60 ? next.slice(-60) : next;
          });
        }
        if (d.db_state?.position_open === 1) {
          const pnlVal = d.db_state?.pnl_total_pct;
          if (pnlVal != null) {
            const p = num(pnlVal);
            setPnlHistory((prev) => {
              const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
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

  function fetchLivePositions() {
    botPositionsLive().then((r) => {
      if (r.ok && r.data) {
        setLivePositions(r.data.positions || []);
      } else {
        setLivePositions(null);
      }
    });
  }

  function fetchSummary() {
    analyticsSummary().then((r) => r.ok && r.data && setSummary(r.data));
  }

  function fetchTrades() {
    analyticsTradesDetailed(10).then((r) => r.ok && r.data?.trades && setTrades(r.data.trades));
  }

  useEffect(() => {
    fetchStatus();
    fetchSummary();
    fetchConfig();
    fetchTrades();
    fetchLivePositions();
    const id = setInterval(() => {
      fetchStatus();
      fetchLivePositions();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (paymentParam !== "success") {
      paymentReturnHandledRef.current = false;
      return;
    }
    if (paymentReturnHandledRef.current) return;
    paymentReturnHandledRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        await syncSubscriptionAfterPayment();
      } catch (_) {
        // ignore network errors; user may still have paid and webhook will apply
      }
      if (cancelled) return;
      await refreshUser();
      if (cancelled) return;
      setPaymentSuccess(true);
      // pathname вместо литерала — корректно при basePath; replace убирает query без лишних циклов
      router.replace(pathname, { scroll: false });
      if (paymentSuccessTimeoutRef.current) clearTimeout(paymentSuccessTimeoutRef.current);
      paymentSuccessTimeoutRef.current = setTimeout(() => setPaymentSuccess(false), 4000);
    })();

    return () => {
      cancelled = true;
      paymentReturnHandledRef.current = false;
      if (paymentSuccessTimeoutRef.current) {
        clearTimeout(paymentSuccessTimeoutRef.current);
        paymentSuccessTimeoutRef.current = null;
      }
    };
  }, [paymentParam, pathname, refreshUser, router]);

  async function handleStart() {
    setBotActionLoading(true);
    setBotActionLabel("Starting bot...");
    try {
      const r = await botStart();
      if (r.ok && r.data?.status === "started") {
        setBotActionLabel("Bot started");
      } else {
        setBotActionLabel("Error — refreshing status");
        fetchStatus();
      }
    } catch {
      setBotActionLabel("Network error");
      fetchStatus();
    }
    setTimeout(() => { setBotActionLoading(false); setBotActionLabel(null); }, 1500);
  }

  async function handleStop() {
    setBotActionLoading(true);
    setBotActionLabel("Stopping bot...");
    try {
      const r = await botStop();
      if (r.ok && r.data?.status === "stopped") {
        setBotActionLabel("Bot stopped");
      } else {
        setBotActionLabel("Error — refreshing status");
        fetchStatus();
      }
    } catch {
      setBotActionLabel("Network error");
      fetchStatus();
    }
    setTimeout(() => { setBotActionLoading(false); setBotActionLabel(null); }, 1500);
  }

  async function handleClosePosition() {
    if (!confirm("Close current position?")) return;
    setBotActionLoading(true);
    setBotActionLabel("Closing position on exchange...");
    try {
      const r = await botClosePosition();
      if (r.ok && r.data?.position_closed) {
        const pnl = r.data?.trade?.pnl_pct;
        setBotActionLabel(
          pnl != null ? `Position closed (PnL: ${Number(pnl) >= 0 ? "+" : ""}${Number(pnl).toFixed(3)}%)` : "Position closed"
        );
      } else if (r.ok && r.data?.status === "timeout") {
        setBotActionLabel("Close took too long — check OKX");
      } else {
        setBotActionLabel("Close failed — check OKX");
      }
    } catch {
      setBotActionLabel("Close error");
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

  const dBal = fool ? jokeUsdt(balance) : balance;
  const dAvail = fool ? jokeUsdt(available) : available;
  const dPnl = fool ? jokePct(pnl) : pnl;
  const dPnlLong = fool ? jokePct(pnlLong) : pnlLong;
  const dPnlShort = fool ? jokePct(pnlShort) : pnlShort;
  const dPnlUsdt =
    fool && positionOpen
      ? APRIL_FOOLS_POSITION_TARGET_USDT
      : pnlUsdt != null
        ? fool
          ? jokeUsdt(pnlUsdt)
          : pnlUsdt
        : null;
  const dEntrySpread = entrySpread != null ? (fool ? jokeSpreadPct(entrySpread) : entrySpread) : null;
  const sumPnlPct = summary ? (fool ? jokePct(summary.pnl_total_pct) : summary.pnl_total_pct) : null;
  const sumPnlUsdt = summary ? (fool ? jokeUsdt(summary.pnl_total_usdt) : summary.pnl_total_usdt) : null;
  const sumWinrate = summary ? (fool ? jokePct(summary.winrate_pct) : summary.winrate_pct) : null;

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

  const displaySpread = useMemo(() => {
    if (spread == null) return null;
    return fool ? jokeSpreadPct(spread) : spread;
  }, [spread, fool]);

  const displaySpreadLevels = useMemo(() => {
    if (!spreadLevels) return null;
    if (!fool) return spreadLevels;
    const entry = jokeSpreadPct(spreadLevels.entry);
    const tp = spreadLevels.tp != null ? jokeSpreadPct(spreadLevels.tp) : null;
    const sl = spreadLevels.sl != null ? jokeSpreadPct(spreadLevels.sl) : null;
    const deviation = displaySpread != null ? displaySpread - entry : null;
    return { entry, tp, sl, deviation };
  }, [spreadLevels, fool, displaySpread]);

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

  const quotesByInstId = useMemo(() => {
    const map: Record<string, { price: number; change: number | null }> = {};
    for (const q of quotesArr) {
      map[q.symbol] = { price: q.price, change: q.change };
    }
    return map;
  }, [quotesArr]);

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

  const displayPositionsBreakdown = useMemo(() => {
    if (!positionsBreakdown) return null;
    if (!fool) return positionsBreakdown;
    return foolPositionBreakdown(positionsBreakdown);
  }, [positionsBreakdown, fool]);

  const profitData = useMemo(() => {
    const base = [
      { period: "1H", value: summary ? summary.avg_trade_pct * 0.3 : 0 },
      { period: "1D", value: summary ? summary.avg_trade_pct * 0.6 : 0 },
      { period: "1W", value: summary ? summary.avg_trade_pct : 0 },
      { period: "1M", value: summary ? summary.pnl_total_pct * 0.5 : 0 },
      { period: "ALL", value: summary ? summary.pnl_total_pct : 0 },
    ];
    if (!fool) return base;
    return base.map((row) => ({ ...row, value: jokePct(row.value) }));
  }, [summary, fool]);

  const displayLivePositions = useMemo(() => {
    if (!livePositions || !fool) return livePositions;
    return foolLivePositionsUpl(livePositions).map((p) => ({
      ...p,
      qty: jokeQty(p.qty),
    }));
  }, [livePositions, fool]);

  const displaySpreadHistory = useMemo(
    () => (fool ? spreadHistory.map((d) => ({ ...d, v: jokeSpreadPct(d.v) })) : spreadHistory),
    [spreadHistory, fool]
  );

  const displayPnlHistory = useMemo(
    () => (fool ? pnlHistory.map((d) => ({ ...d, v: jokePct(d.v) })) : pnlHistory),
    [pnlHistory, fool]
  );

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

      <div className="flex items-center justify-between gap-4 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={() => setTourOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition"
          title="Start guide"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Guide</span>
        </button>
      </div>

      <GuideTour steps={DASHBOARD_TOUR_STEPS} open={tourOpen} onClose={() => setTourOpen(false)} />

      <AnimatePresence>
        {paymentSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[var(--positive)]/20 border border-[var(--positive)]/40 text-[var(--positive)] text-sm font-medium"
          >
            Payment successful. Subscription extended.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row 1: Overview, Spread & PnL (expanded) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Overview */}
        <motion.div {...anim(0)} data-tour="tour-balance" className="card-glass p-4 md:p-6 lg:col-span-1">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-4">Balance</h2>
          <div className="flex items-center gap-2">
            <CryptoIcon symbol="USDT" size={28} />
            <p className="text-3xl font-semibold">
              {dBal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            Available: {dAvail.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="p-2 rounded bg-[var(--background)]/50 text-center">
              <p className="text-xs text-[var(--muted)]">PnL Long</p>
              <p className={`text-sm font-semibold ${positionOpen ? (dPnlLong >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]") : "text-[var(--muted)]"}`}>
                {positionOpen ? `${dPnlLong >= 0 ? "+" : ""}${dPnlLong.toFixed(3)}%` : "—"}
              </p>
            </div>
            <div className="p-2 rounded bg-[var(--background)]/50 text-center">
              <p className="text-xs text-[var(--muted)]">PnL Short</p>
              <p className={`text-sm font-semibold ${positionOpen ? (dPnlShort >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]") : "text-[var(--muted)]"}`}>
                {positionOpen ? `${dPnlShort >= 0 ? "+" : ""}${dPnlShort.toFixed(3)}%` : "—"}
              </p>
            </div>
            <div className="p-2 rounded bg-[var(--background)]/50 text-center">
              <p className="text-xs text-[var(--muted)]">PnL Total</p>
              <p className={`text-sm font-semibold ${positionOpen ? (dPnl >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]") : "text-[var(--muted)]"}`}>
                {positionOpen ? `${dPnl >= 0 ? "+" : ""}${dPnl.toFixed(3)}%` : "—"}
              </p>
              {positionOpen && dPnlUsdt != null && (
                <p className={`text-xs mt-0.5 ${dPnlUsdt >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                  {dPnlUsdt >= 0 ? "+" : ""}{dPnlUsdt.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDT
                </p>
              )}
              {positionOpen && displayPositionsBreakdown && displayPositionsBreakdown.totalCommission !== 0 && (
                <p className="text-xs mt-0.5 text-[var(--muted)]">
                  Fee: {displayPositionsBreakdown.totalCommission >= 0 ? "+" : ""}{displayPositionsBreakdown.totalCommission.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          {fiatRates && (
            <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[var(--muted)]/80">$</span>
                <span className="text-xs text-[var(--muted)]/90">
                  {dBal.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[var(--muted)]/80">€</span>
                <span className="text-xs text-[var(--muted)]/90">
                  {(dBal * fiatRates.EUR).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} EUR
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)]/80">₽</span>
                <span className="text-xs text-[var(--muted)]/90">
                  {(dBal * fiatRates.RUB).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} RUB
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Spread & Chart */}
        <motion.div {...anim(0.05)} data-tour="tour-spread" className="card-glass p-4 md:p-6 lg:col-span-2 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-[var(--muted)]">Spread (live)</h2>
            <div className="flex gap-1">
              <Link
                href="/trading?mode=spread"
                className="p-1.5 rounded-lg hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] transition"
                title="Trading analysis — Spread"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <Link
                href="/trading?mode=instruments"
                className="p-1.5 rounded-lg hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] transition"
                title="Trading analysis — Instruments"
              >
                <Layers className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="flex items-baseline gap-3 mb-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={displaySpread ?? "na"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-2xl font-bold text-[var(--accent)]"
              >
                {displaySpread != null ? `${displaySpread.toFixed(4)}%` : "—"}
              </motion.span>
            </AnimatePresence>
            {ping != null && (
              <span className="text-xs text-[var(--muted)]">{ping}ms</span>
            )}
          </div>

          {displaySpreadLevels && (
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-amber-400 inline-block" style={{ borderTop: "2px dashed" }} />
                <span className="text-[var(--muted)]">Entry: {displaySpreadLevels.entry.toFixed(4)}%</span>
              </span>
              {displaySpreadLevels.sl != null && (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 inline-block" style={{ borderTop: `2px dashed ${negativeColor}` }} />
                  <span className="text-[var(--muted)]">SL: {displaySpreadLevels.sl.toFixed(4)}%</span>
                </span>
              )}
              {displaySpreadLevels.deviation != null && (
                <span className={`font-semibold ml-auto ${
                  displaySpreadLevels.deviation >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
                }`}>
                  {displaySpreadLevels.deviation >= 0 ? "+" : ""}{displaySpreadLevels.deviation.toFixed(4)}%
                </span>
              )}
            </div>
          )}

          <div className={`flex flex-col sm:flex-row gap-4 ${displaySpreadLevels ? "" : ""}`}>
          <div className={`flex-1 min-w-0 min-h-[120px] ${displaySpreadLevels ? "h-32 sm:h-40" : "h-24 sm:h-28"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={displaySpreadHistory.map((d) => ({
                  ...d,
                  vPos: d.v >= 0 ? d.v : null,
                  vNeg: d.v < 0 ? d.v : null,
                }))}
                margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="spreadGradPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={positiveColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={positiveColor} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spreadGradNeg" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={negativeColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={negativeColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis
                  hide
                  domain={[
                    (dataMin: number) => {
                      if (!isFinite(dataMin)) return -0.2;
                      let min = dataMin;
                      if (displaySpreadLevels) {
                        min = Math.min(min, displaySpreadLevels.entry);
                        if (displaySpreadLevels.sl != null) min = Math.min(min, displaySpreadLevels.sl);
                      }
                      return min - 0.01;
                    },
                    (dataMax: number) => {
                      if (!isFinite(dataMax)) return 0.2;
                      let max = dataMax;
                      if (displaySpreadLevels) {
                        max = Math.max(max, displaySpreadLevels.entry);
                        if (displaySpreadLevels.sl != null) max = Math.max(max, displaySpreadLevels.sl);
                      }
                      return max + 0.01;
                    },
                  ]}
                />
                <Tooltip
                  contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${typeof v === "number" ? v.toFixed(4) : v}%`, "Spread"]}
                />
                <ReferenceLine y={0} stroke="var(--muted)" strokeWidth={0.5} strokeDasharray="2 2" />
                <Area type="monotone" dataKey="vPos" stroke={positiveColor} strokeWidth={1.5} fill="url(#spreadGradPos)" isAnimationActive={false} connectNulls />
                <Area type="monotone" dataKey="vNeg" stroke={negativeColor} strokeWidth={1.5} fill="url(#spreadGradNeg)" isAnimationActive={false} connectNulls baseValue={0} />
                {displaySpreadLevels && (
                  <Customized
                    component={(props: { yAxisMap?: Record<string, { scale: (v: number) => number }>; offset?: { left: number; width: number; height: number } }) => {
                      const yAxis = props.yAxisMap && Object.values(props.yAxisMap)[0];
                      const { width = 0 } = props.offset || {};
                      if (!yAxis?.scale || width <= 0) return null;
                      const scale = yAxis.scale;
                      const lines: Array<{ y: number; stroke: string; dash: string }> = [
                        { y: displaySpreadLevels.entry, stroke: accentColor, dash: "6 3" },
                        ...(displaySpreadLevels.sl != null ? [{ y: displaySpreadLevels.sl, stroke: negativeColor, dash: "4 4" }] : []),
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

          {displaySpreadLevels && tpPct != null && (
            <div className="flex-1 min-w-0 min-h-[120px] h-32 sm:h-40 flex flex-col">
              <p className="text-xs text-[var(--muted)] mb-1">PnL Live</p>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={displayPnlHistory.map((d) => ({
                      ...d,
                      vPos: d.v >= 0 ? d.v : null,
                      vNeg: d.v < 0 ? d.v : null,
                    }))}
                    margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="pnlGradPos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={positiveColor} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={positiveColor} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="pnlGradNeg" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor={negativeColor} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={negativeColor} stopOpacity={0} />
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
                    <ReferenceLine y={0} stroke="var(--muted)" strokeWidth={0.5} strokeDasharray="2 2" />
                    <Area type="monotone" dataKey="vPos" stroke={positiveColor} strokeWidth={1.5} fill="url(#pnlGradPos)" isAnimationActive={false} connectNulls />
                    <Area type="monotone" dataKey="vNeg" stroke={negativeColor} strokeWidth={1.5} fill="url(#pnlGradNeg)" isAnimationActive={false} connectNulls baseValue={0} />
                    <Customized
                      component={(props: { yAxisMap?: Record<string, { scale: (v: number) => number }>; offset?: { left: number; width: number; height: number } }) => {
                        const yAxis = props.yAxisMap && Object.values(props.yAxisMap)[0];
                        const { width = 0 } = props.offset || {};
                        if (!yAxis?.scale || width <= 0) return null;
                        const scale = yAxis.scale;
                        const lines: Array<{ y: number; stroke: string; dash: string }> = [
                          { y: 0, stroke: accentColor, dash: "6 3" },
                          { y: tpPct, stroke: positiveColor, dash: "4 4" },
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
      <motion.div {...anim(0.08)} data-tour="tour-bot-status" className="card-glass p-3 md:p-4 mt-4 md:mt-6 flex flex-wrap items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${status?.alive ? "bg-[var(--positive)] animate-pulse" : "bg-[var(--negative)]"}`} />
          <span className="font-medium">{status?.alive ? "Bot active" : "Bot stopped"}</span>
        </div>
        {status?.alive && (
          <div className="hidden sm:flex items-center gap-4 text-xs text-[var(--muted)]">
            <span>Uptime: {status?.uptime_seconds != null ? fmtDuration(status.uptime_seconds) : "—"}</span>
            <span>State: {ds?.actual_state || "—"}</span>
            <span>Connection: {ds?.connection_status || "—"}</span>
          </div>
        )}
        <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
          <button
            type="button"
            onClick={handleStart}
            disabled={botActionLoading || !!status?.alive}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--positive)]/20 text-[var(--positive)] hover:bg-[var(--positive)]/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
          <button
            type="button"
            onClick={handleStop}
            disabled={botActionLoading || !status?.alive}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--negative)]/20 text-[var(--negative)] hover:bg-[var(--negative)]/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        </div>
      </motion.div>

      {/* Row 2: Current Position + Quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
        {/* Current Position */}
        <motion.div {...anim(0.15)} data-tour="tour-position" className="card-glass p-4 md:p-6">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Current position
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
                  <p className={`text-lg font-bold mt-1 ${dPnlLong >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                    {dPnlLong >= 0 ? "+" : ""}{dPnlLong.toFixed(3)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--negative)]/10 border border-[var(--negative)]/20">
                  <div className="flex items-center gap-1 text-[var(--negative)]">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">SHORT</span>
                  </div>
                  <p className="text-sm font-semibold mt-1">{ds?.short_basket || "—"}</p>
                  <p className={`text-lg font-bold mt-1 ${dPnlShort >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                    {dPnlShort >= 0 ? "+" : ""}{dPnlShort.toFixed(3)}%
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-2 rounded bg-[var(--background)]/50">
                  <p className="text-xs text-[var(--muted)]">Entry spread</p>
                  <p className="font-medium">{dEntrySpread != null ? `${dEntrySpread.toFixed(4)}%` : "—"}</p>
                </div>
                <div className="p-2 rounded bg-[var(--background)]/50">
                  <p className="text-xs text-[var(--muted)]">DCA</p>
                  <p className="font-medium">
                    {fool
                      ? -(Math.abs(ds?.dca_count_current ?? 0) + 9)
                      : ds?.dca_count_current ?? 0}
                  </p>
                </div>
                <div className="p-2 rounded bg-[var(--background)]/50">
                  <p className="text-xs text-[var(--muted)]">Total PnL</p>
                  <p className={`font-medium ${dPnl >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                    {dPnl >= 0 ? "+" : ""}{dPnl.toFixed(3)}%
                    {dPnlUsdt != null && (
                      <span className={`block text-xs mt-0.5 ${dPnlUsdt >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                        {dPnlUsdt >= 0 ? "+" : ""}${dPnlUsdt.toFixed(2)}
                      </span>
                    )}
                    {displayPositionsBreakdown && displayPositionsBreakdown.totalCommission !== 0 && (
                      <span className="block text-xs mt-0.5 text-[var(--muted)]">
                        Fee: {displayPositionsBreakdown.totalCommission >= 0 ? "+" : ""}${displayPositionsBreakdown.totalCommission.toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {displayPositionsBreakdown && (
                <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
                  <p className="text-xs text-[var(--muted)] mb-2">Position breakdown (PnL USDT)</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-h-44 overflow-y-auto">
                    <div>
                      <p className="text-xs font-medium text-[var(--positive)] mb-1">LONG</p>
                      {displayPositionsBreakdown.longItems.map((item) => (
                        <div key={item.instId} className="flex items-center justify-between py-1 px-2 rounded bg-[var(--positive)]/5 text-sm">
                          <span className="flex items-center gap-2">
                            <CryptoIcon symbol={item.instId} size={18} />
                            {item.shortName}
                          </span>
                          <span className={`font-medium ${item.upl >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                            {item.upl >= 0 ? "+" : ""}${item.upl.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--negative)] mb-1">SHORT</p>
                      {displayPositionsBreakdown.shortItems.map((item) => (
                        <div key={item.instId} className="flex items-center justify-between py-1 px-2 rounded bg-[var(--negative)]/5 text-sm">
                          <span className="flex items-center gap-2">
                            <CryptoIcon symbol={item.instId} size={18} />
                            {item.shortName}
                          </span>
                          <span className={`font-medium ${item.upl >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                            {item.upl >= 0 ? "+" : ""}${item.upl.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--card-border)]/50 text-sm">
                    <span className="text-[var(--muted)]">LONG: <span className={`font-medium ${displayPositionsBreakdown.longTotal >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>{displayPositionsBreakdown.longTotal >= 0 ? "+" : ""}${displayPositionsBreakdown.longTotal.toFixed(2)}</span></span>
                    <span className="text-[var(--muted)]">SHORT: <span className={`font-medium ${displayPositionsBreakdown.shortTotal >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>{displayPositionsBreakdown.shortTotal >= 0 ? "+" : ""}${displayPositionsBreakdown.shortTotal.toFixed(2)}</span></span>
                  </div>
                  {displayPositionsBreakdown.totalCommission !== 0 && (
                    <div className="mt-1 text-sm text-[var(--muted)] text-right">
                      Fee: {displayPositionsBreakdown.totalCommission >= 0 ? "+" : ""}${displayPositionsBreakdown.totalCommission.toFixed(2)}
                    </div>
                  )}
                  <div className="mt-1 text-sm font-semibold text-right">
                    <span className="text-[var(--muted)]">Total: </span>
                    <span className={dPnlUsdt != null && dPnlUsdt >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}>
                      {dPnlUsdt != null ? `${dPnlUsdt >= 0 ? "+" : ""}$${dPnlUsdt.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>
              )}
              {/* live positions UI перенесли в правый столбец, чтобы не загромождать текущую позицию */}
              <button
                onClick={handleClosePosition}
                disabled={botActionLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--negative)]/15 text-[var(--negative)] border border-[var(--negative)]/20 hover:bg-[var(--negative)]/25 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
              >
                <X className="w-4 h-4" />
                Close position
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-[var(--muted)]">
              <Activity className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No open position</p>
            </div>
          )}
        </motion.div>

        {/* Instruments & Live positions (combined) */}
        <motion.div {...anim(0.2)} className="card-glass p-4 md:p-6 min-w-0 overflow-hidden flex flex-col gap-3">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-1">Instruments & live positions</h2>
          {displayLivePositions && displayLivePositions.length > 0 ? (
            <div className="space-y-2 overflow-x-hidden">
              {[...displayLivePositions]
                .sort((a, b) => (a.side === "long" ? 0 : 1) - (b.side === "long" ? 0 : 1))
                .map((p) => {
                const shortName = p.instId.replace("-USDT-SWAP", "");
                const q = quotesByInstId[p.instId];
                const price = q?.price ?? p.markPx;
                const change = q?.change ?? null;
                const hasLiq = p.liqPx > 0 && p.markPx > 0 && p.avgPx > 0;
                const isLong = p.side === "long";
                let ratio: number | null = null;
                if (hasLiq) {
                  // Для LONG: шкала от liq -> entry, для SHORT: от entry -> liq.
                  if (isLong) {
                    const liq = p.liqPx;
                    const entry = p.avgPx;
                    const current = p.markPx;
                    const span = entry - liq;
                    if (span > 0) {
                      const clamped = Math.max(liq, Math.min(current, entry));
                      ratio = (clamped - liq) / span;
                    }
                  } else {
                    const liq = p.liqPx;
                    const entry = p.avgPx;
                    const current = p.markPx;
                    const span = liq - entry;
                    if (span > 0) {
                      const clamped = Math.min(liq, Math.max(current, entry));
                      ratio = (liq - clamped) / span;
                    }
                  }
                  if (!isFinite(ratio!)) ratio = null;
                  if (ratio != null) {
                    ratio = Math.max(0, Math.min(1, ratio));
                  }
                }
                if (fool && hasLiq) {
                  ratio = jokeLiquidationBarRatio(p.instId);
                }
                const safeColor = isLong ? positiveColor : negativeColor;
                const dangerColor = isLong ? negativeColor : positiveColor;
                const barColor =
                  ratio == null
                    ? accentColor
                    : ratio > 0.6
                    ? safeColor
                    : ratio > 0.3
                    ? accentColor
                    : dangerColor;
                return (
                  <div key={p.instId} className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-[var(--background)]/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 min-w-0">
                        <CryptoIcon symbol={p.instId} size={18} />
                        <span className="truncate text-sm font-medium">{shortName}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${isLong ? "border-[var(--positive)] text-[var(--positive)]" : "border-[var(--negative)] text-[var(--negative)]"}`}>
                          {p.side.toUpperCase()}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-mono whitespace-nowrap">
                          ${price.toFixed(price < 1 ? 5 : 2)}
                        </span>
                        {change != null && (
                          <span className={`text-[11px] font-medium w-14 text-right ${change >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                            {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                      <span>
                        Entry: {p.avgPx?.toFixed(p.avgPx < 1 ? 5 : 3)}
                      </span>
                      <span>
                        Liq: {hasLiq ? p.liqPx.toFixed(p.liqPx < 1 ? 5 : 3) : "—"}
                      </span>
                    </div>
                    {ratio != null && (
                      <div className="h-2 rounded-full bg-[var(--card-border)]/60 overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${Math.round(ratio * 100)}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)] text-center py-8">No live positions</p>
          )}
        </motion.div>
      </div>

      {/* Row 3: Stats + Profit Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6">
        <motion.div {...anim(0.25)} className="card-glass p-4 md:p-6 lg:col-span-2 min-w-0 overflow-hidden">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-4">Statistics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <div className="p-4 rounded-lg bg-[var(--background)]/50">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Activity className="w-4 h-4" />
                <span className="text-xs">Trades</span>
              </div>
              <p className="text-xl font-semibold mt-1">{summary?.trades_count ?? 0}</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--background)]/50">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Win rate</span>
              </div>
              <p className="text-xl font-semibold mt-1">{sumWinrate != null ? `${sumWinrate.toFixed(1)}%` : "—"}</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--background)]/50">
              <span className="text-xs text-[var(--muted)]">PnL %</span>
              <p className={`text-xl font-semibold mt-1 ${(sumPnlPct ?? 0) >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                {sumPnlPct != null ? `${sumPnlPct >= 0 ? "+" : ""}${sumPnlPct.toFixed(2)}%` : "—"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--background)]/50">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Wallet className="w-4 h-4" />
                <span className="text-xs">PnL USDT</span>
              </div>
              <p className={`text-xl font-semibold mt-1 ${(sumPnlUsdt ?? 0) >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                {sumPnlUsdt != null ? `${sumPnlUsdt >= 0 ? "+" : ""}$${sumPnlUsdt.toFixed(2)}` : "—"}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div {...anim(0.3)} className="card-glass p-4 md:p-6 min-w-0 overflow-hidden">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-4">Profit</h2>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
        <motion.div {...anim(0.3)} className="card-glass p-4 md:p-6">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Baskets (pairs)
          </h2>
          {configError && <p className="text-sm text-amber-500 mb-2">{configError}</p>}
          {config?.baskets && config.baskets.length > 0 ? (
            <div className="space-y-2">
              {config.baskets.map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background)]/50">
                  <span className="text-xs text-[var(--muted)] w-8">#{i + 1}</span>
                  <span className="flex items-center gap-2 font-medium text-[var(--positive)]">
                    <CryptoIcon symbol={b.basket1} size={20} />
                    {b.basket1}
                  </span>
                  <span className="text-[var(--muted)]">vs</span>
                  <span className="flex items-center gap-2 font-medium text-[var(--negative)]">
                    <CryptoIcon symbol={b.basket2} size={20} />
                    {b.basket2}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">No baskets configured</p>
          )}
        </motion.div>

        <motion.div {...anim(0.35)} className="card-glass p-4 md:p-6">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-4 flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Entry settings
          </h2>
          {configError && <p className="text-sm text-amber-500 mb-2">{configError}</p>}
          {config?.params && Object.keys(config.params).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[var(--background)]/50">
                <p className="text-xs text-[var(--muted)]">Entry spread %</p>
                <p className="font-semibold text-[var(--accent)]">{typeof config.params.entry_spread_pct === "number" ? `${config.params.entry_spread_pct.toFixed(2)}%` : "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--background)]/50">
                <p className="text-xs text-[var(--muted)]">Take profit %</p>
                <p className="font-semibold text-[var(--positive)]">{typeof config.params.take_profit_pct === "number" ? `${config.params.take_profit_pct.toFixed(2)}%` : "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--background)]/50">
                <p className="text-xs text-[var(--muted)]">Stop loss %</p>
                <p className="font-semibold text-[var(--negative)]">{typeof config.params.stop_loss_pct === "number" ? `${config.params.stop_loss_pct.toFixed(2)}%` : "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--background)]/50">
                <p className="text-xs text-[var(--muted)]">Position %</p>
                <p className="font-semibold">{config.params.position_size_pct ?? "—"}%</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--background)]/50">
                <p className="text-xs text-[var(--muted)]">DCA step %</p>
                <p className="font-semibold">{typeof config.params.dca_step_pct === "number" ? `${config.params.dca_step_pct.toFixed(2)}%` : "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--background)]/50">
                <p className="text-xs text-[var(--muted)]">Leverage</p>
                <p className="font-semibold">{config.params.leverage ?? "—"}x</p>
              </div>
            </div>
          ) : configLoaded ? (
            <p className="text-sm text-[var(--muted)]">{configError ? "Config not found" : "Params not set"}</p>
          ) : (
            <p className="text-sm text-[var(--muted)]">Loading...</p>
          )}
        </motion.div>
      </div>

      {/* Row 5: Recent Trades */}
      <motion.div {...anim(0.4)} data-tour="tour-trades" className="card-glass p-4 md:p-6 mt-4 md:mt-6 overflow-hidden">
        <h2 className="text-sm font-medium text-[var(--muted)] mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent trades
        </h2>
        <p className="text-xs text-[var(--muted)] -mt-2 mb-2">Click a row to expand positions</p>
        {trades.length > 0 ? (
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-[var(--muted)] border-b border-[var(--card-border)]">
                  <th className="pb-3 pr-2 w-6"></th>
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
                {trades.map((t) => {
                  const hasDetail = t.pairs_detail && Object.keys(t.pairs_detail).length > 0;
                  const isExpanded = expandedTradeId === t.id;
                  return (
                    <React.Fragment key={t.id}>
                      <tr
                        onClick={() => hasDetail && setExpandedTradeId(isExpanded ? null : t.id)}
                        className={`border-b border-[var(--card-border)]/50 transition ${hasDetail ? "cursor-pointer hover:bg-[var(--card-border)]/20" : ""}`}
                      >
                        <td className="py-3 pr-2">
                          {hasDetail ? (
                            <span className="text-[var(--muted)] text-xs">{isExpanded ? "▼" : "▶"}</span>
                          ) : (
                            <span className="opacity-0">·</span>
                          )}
                        </td>
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
                        <td className="py-3 text-xs text-[var(--muted)]">{t.reason || "—"}</td>
                      </tr>
                      <AnimatePresence>
                        {isExpanded && hasDetail && t.pairs_detail && (
                          <tr key={`${t.id}-detail`} className="border-none">
                            <td colSpan={9} className="p-0 bg-[var(--card-border)]/10 align-top">
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
          </div>
        ) : (
          <p className="text-center text-[var(--muted)] py-8">No trades</p>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={null}>
      <DashboardPageInner />
    </React.Suspense>
  );
}

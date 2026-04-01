"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ChartView } from "@/components/ChartView";
import { botStatus, getBotConfig } from "@/lib/api";
import { TrendingUp } from "lucide-react";
import { isAprilFoolsActive, jokeSpreadPct } from "@/lib/april-fools";

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  return typeof v === "number" ? v : parseFloat(v) || 0;
}

function TradingPageContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") === "instruments" ? "instruments" : "spread") as "spread" | "instruments";

  const [spreadLevels, setSpreadLevels] = useState<{ entry: number; tp: number | null; sl: number | null } | null>(null);
  const [configBaskets, setConfigBaskets] = useState<Array<{ basket1: string; basket2: string }>>([]);
  const [hours, setHours] = useState(10);

  useEffect(() => {
    Promise.all([botStatus(), getBotConfig()]).then(([statusRes, configRes]) => {
      if (configRes.ok && configRes.data?.baskets) setConfigBaskets(configRes.data.baskets);
      if (statusRes.ok && statusRes.data) {
        const ds = (statusRes.data as { db_state?: Record<string, unknown> })?.db_state;
        const cfg = configRes.ok ? configRes.data?.params : null;
        if (ds && cfg && ds.position_open && ds.entry_spread_pct != null) {
          const entry = num(ds.entry_spread_pct as number | string | null);
          const longBasket = ds.long_basket as string;
          const tpPct = cfg?.take_profit_pct != null ? Number(cfg.take_profit_pct) : null;
          const slPct = cfg?.stop_loss_pct != null ? Number(cfg.stop_loss_pct) : null;
          const slEnabled = cfg?.stop_loss_enabled ?? false;
          const isLongB2 = longBasket === "basket2";
          const tp = tpPct != null ? (isLongB2 ? entry - tpPct : entry + tpPct) : null;
          const sl = slPct != null && slEnabled ? (isLongB2 ? entry + slPct : entry - slPct) : null;
          setSpreadLevels({ entry, tp, sl });
        }
      }
    });
  }, []);

  const fool = isAprilFoolsActive();
  const displaySpreadLevels = useMemo(() => {
    if (!spreadLevels) return null;
    if (!fool) return spreadLevels;
    return {
      entry: jokeSpreadPct(spreadLevels.entry),
      tp: spreadLevels.tp != null ? jokeSpreadPct(spreadLevels.tp) : null,
      sl: spreadLevels.sl != null ? jokeSpreadPct(spreadLevels.sl) : null,
    };
  }, [spreadLevels, fool]);

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[var(--accent)]" />
            Trading Analysis
          </h1>
          <div className="flex gap-1 p-1 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
            <a
              href="/trading?mode=spread"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === "spread" ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              Spread
            </a>
            <a
              href="/trading?mode=instruments"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === "instruments" ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              Instruments
            </a>
          </div>
        </div>
        {mode === "spread" && (
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-sm"
          >
            {[1, 3, 5, 10, 24].map((h) => (
              <option key={h} value={h}>{h}h</option>
            ))}
          </select>
        )}
      </div>

      <div className="card-glass p-4 md:p-6 overflow-hidden">
        <div className="min-h-[580px] md:min-h-[680px]">
          <ChartView
            mode={mode}
            hours={hours}
            spreadLevels={displaySpreadLevels}
            configBaskets={configBaskets}
          />
        </div>
      </div>
    </div>
  );
}

export default function TradingPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center text-[var(--muted)]">Loading...</div>}>
        <TradingPageContent />
      </Suspense>
    </DashboardLayout>
  );
}

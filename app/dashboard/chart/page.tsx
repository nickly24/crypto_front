"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ChartView } from "@/components/ChartView";
import { ArrowLeft } from "lucide-react";
import { botStatus, getBotConfig } from "@/lib/api";

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  return typeof v === "number" ? v : parseFloat(v) || 0;
}

function ChartPageContent() {
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
          const tpPct = cfg.take_profit_pct != null ? Number(cfg.take_profit_pct) : null;
          const slPct = cfg.stop_loss_pct != null ? Number(cfg.stop_loss_pct) : null;
          const slEnabled = cfg.stop_loss_enabled ?? false;
          const isLongB2 = longBasket === "basket2";
          const tp = tpPct != null ? (isLongB2 ? entry - tpPct : entry + tpPct) : null;
          const sl = slPct != null && slEnabled ? (isLongB2 ? entry + slPct : entry - slPct) : null;
          setSpreadLevels({ entry, tp, sl });
        }
      }
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="w-full mx-auto">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--foreground)] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Link>
            <div className="flex gap-1 p-1 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
              <Link
                href="/dashboard/chart?mode=spread"
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${mode === "spread" ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                Спред
              </Link>
              <Link
                href="/dashboard/chart?mode=instruments"
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${mode === "instruments" ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                Инструменты
              </Link>
            </div>
          </div>
          {mode === "spread" && (
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-sm"
            >
              {[1, 3, 5, 10, 24].map((h) => (
                <option key={h} value={h}>{h} ч</option>
              ))}
            </select>
          )}
        </div>

        <div className="card-glass p-4 md:p-4 overflow-hidden">
          <ChartView
            mode={mode}
            hours={hours}
            spreadLevels={spreadLevels}
            configBaskets={configBaskets}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ChartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[var(--muted)]">Загрузка...</div>}>
      <ChartPageContent />
    </Suspense>
  );
}

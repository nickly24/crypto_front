"use client";

import { useEffect, useState } from "react";
import { InstrumentChart } from "./InstrumentChart";
import { getChartInstruments } from "@/lib/api";
import { BarChart3, TrendingUp } from "lucide-react";

type InstrumentsChartsViewProps = {
  hours?: number;
  configBaskets?: Array<{ basket1: string; basket2: string }>;
};

export function InstrumentsChartsView({ configBaskets = [] }: InstrumentsChartsViewProps) {
  const [instruments, setInstruments] = useState<string[]>([]);
  const [selected1, setSelected1] = useState<string>("");
  const [selected2, setSelected2] = useState<string>("");
  const [bar, setBar] = useState("1m");
  const [chartType, setChartType] = useState<"candle" | "line">("candle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChartInstruments(10).then((r) => {
      setLoading(false);
      if (r.ok && r.data?.instruments?.length) {
        setInstruments(r.data.instruments);
        if (!selected1 && r.data.instruments[0]) setSelected1(r.data.instruments[0]);
        if (!selected2 && r.data.instruments.length > 1) setSelected2(r.data.instruments[1]);
      } else {
        const fromBaskets = [...new Set(configBaskets.flatMap((b) => [b.basket1, b.basket2]).filter(Boolean))];
        setInstruments(fromBaskets);
        if (fromBaskets[0]) setSelected1(fromBaskets[0]);
        if (fromBaskets[1]) setSelected2(fromBaskets[1]);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-[var(--muted)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px] w-full">
      <aside className="w-44 shrink-0 flex flex-col gap-1 border-r border-[var(--card-border)] pr-3 py-1 overflow-y-auto">
        <p className="text-xs font-medium text-[var(--muted)] mb-2">Select for chart</p>
        {instruments.map((inst) => {
          const short = inst.replace("-USDT-SWAP", "");
          const is1 = selected1 === inst;
          const is2 = selected2 === inst;
          return (
            <div key={inst} className="flex items-center gap-1">
              <span className="flex-1 text-sm text-[var(--foreground)] truncate">{short}</span>
              <button
                onClick={() => setSelected1(inst)}
                className={`w-7 h-7 rounded text-xs font-medium shrink-0 ${is1 ? "bg-[var(--accent)] text-white" : "bg-[var(--card-bg)] text-[var(--muted)] hover:bg-[var(--card-border)]"}`}
                title="Chart 1"
              >
                1
              </button>
              <button
                onClick={() => setSelected2(inst)}
                className={`w-7 h-7 rounded text-xs font-medium shrink-0 ${is2 ? "bg-[var(--accent)] text-white" : "bg-[var(--card-bg)] text-[var(--muted)] hover:bg-[var(--card-border)]"}`}
                title="Chart 2"
              >
                2
              </button>
            </div>
          );
        })}
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 flex-wrap shrink-0 py-1">
          <select
            value={bar}
            onChange={(e) => setBar(e.target.value)}
            className="px-2 py-1.5 rounded bg-[var(--background)] border border-[var(--card-border)] text-sm"
          >
            <option value="1m">1 min</option>
            <option value="5m">5 min</option>
            <option value="15m">15 min</option>
            <option value="1H">1h</option>
            <option value="4H">4h</option>
          </select>
          <div className="flex rounded-lg overflow-hidden border border-[var(--card-border)]">
            <button
              onClick={() => setChartType("candle")}
              className={`px-3 py-1.5 text-sm flex items-center gap-1.5 ${chartType === "candle" ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "text-[var(--muted)]"}`}
            >
              <BarChart3 className="w-4 h-4" />
              Candles
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`px-3 py-1.5 text-sm flex items-center gap-1.5 ${chartType === "line" ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "text-[var(--muted)]"}`}
            >
              <TrendingUp className="w-4 h-4" />
              Line
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col">
            <p className="text-xs text-[var(--muted)] shrink-0">{selected1 ? selected1.replace("-USDT-SWAP", "") : "Slot 1"}</p>
            <div className="flex-1 min-h-[180px]">
              <InstrumentChart instId={selected1} bar={bar} chartType={chartType} />
            </div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <p className="text-xs text-[var(--muted)] shrink-0">{selected2 ? selected2.replace("-USDT-SWAP", "") : "Slot 2"}</p>
            <div className="flex-1 min-h-[180px]">
              <InstrumentChart instId={selected2} bar={bar} chartType={chartType} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

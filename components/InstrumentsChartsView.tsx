"use client";

import { useEffect, useState } from "react";
import { InstrumentChart } from "./InstrumentChart";
import { CryptoIcon } from "./CryptoIcon";
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

  const InstrumentList = ({ selected, onSelect }: { selected: string; onSelect: (inst: string) => void }) => (
    <aside className="w-36 shrink-0 flex flex-col gap-0.5 border-r border-[var(--card-border)] pr-2 py-1 overflow-y-auto">
      {instruments.map((inst) => {
        const short = inst.replace("-USDT-SWAP", "");
        const isSelected = selected === inst;
        return (
          <button
            key={inst}
            onClick={() => onSelect(inst)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition ${
              isSelected ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "text-[var(--foreground)] hover:bg-[var(--card-bg)]"
            }`}
          >
            <CryptoIcon symbol={inst} size={16} />
            <span className="truncate">{short}</span>
          </button>
        );
      })}
    </aside>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-[560px] w-full gap-2">
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
      <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col gap-2 min-h-0 min-w-0">
          <div className="flex-1 flex min-h-[240px] overflow-hidden rounded-lg border border-[var(--card-border)]">
            <InstrumentList selected={selected1} onSelect={setSelected1} />
            <div className="flex-1 flex flex-col min-w-0">
              <p className="flex items-center gap-2 text-xs text-[var(--muted)] shrink-0 px-2 pt-1">
                {selected1 && <CryptoIcon symbol={selected1} size={16} />}
                {selected1 ? selected1.replace("-USDT-SWAP", "") : "Chart 1"}
              </p>
              <div className="flex-1 min-h-0">
                <InstrumentChart instId={selected1} bar={bar} chartType={chartType} />
              </div>
            </div>
          </div>
          <div className="flex-1 flex min-h-[240px] overflow-hidden rounded-lg border border-[var(--card-border)]">
            <InstrumentList selected={selected2} onSelect={setSelected2} />
            <div className="flex-1 flex flex-col min-w-0">
              <p className="flex items-center gap-2 text-xs text-[var(--muted)] shrink-0 px-2 pt-1">
                {selected2 && <CryptoIcon symbol={selected2} size={16} />}
                {selected2 ? selected2.replace("-USDT-SWAP", "") : "Chart 2"}
              </p>
              <div className="flex-1 min-h-0">
                <InstrumentChart instId={selected2} bar={bar} chartType={chartType} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

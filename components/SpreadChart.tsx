"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, LineSeries, LineData } from "lightweight-charts";
import { getChartSpread } from "@/lib/api";
import { utcMsToLocalChartTime } from "@/lib/chart-time";
import { Plus, Trash2 } from "lucide-react";
import { SpreadLiveMini } from "./SpreadLiveMini";
import { useTheme } from "@/providers/theme";

const DRAWINGS_KEY = "chart-drawings-spread";

type DrawingLine = { value: number; color: string; label?: string };

type SpreadChartProps = {
  hours?: number;
  spreadLevels?: { entry: number; tp: number | null; sl: number | null } | null;
};

function loadDrawings(): DrawingLine[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(DRAWINGS_KEY);
    if (!s) return [];
    return JSON.parse(s);
  } catch {
    return [];
  }
}

function saveDrawings(lines: DrawingLine[]) {
  localStorage.setItem(DRAWINGS_KEY, JSON.stringify(lines));
}

export function SpreadChart({ hours = 10, spreadLevels }: SpreadChartProps) {
  const { positiveColor, negativeColor, accentColor } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [drawings, setDrawings] = useState<DrawingLine[]>([]);
  const [newLineValue, setNewLineValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDrawings(loadDrawings());
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#94a3b8",
        attributionLogo: false,
      },
      grid: { vertLines: { color: "rgba(255,255,255,0.08)" }, horzLines: { color: "rgba(255,255,255,0.08)" } },
      rightPriceScale: {
        borderColor: "rgba(148,163,184,0.3)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
        textColor: "#94a3b8",
      },
      timeScale: {
        borderColor: "rgba(148,163,184,0.3)",
        timeVisible: true,
        secondsVisible: false,
      },
    });
    const lineSeries = chart.addSeries(LineSeries, {
      color: positiveColor,
      lineWidth: 2,
      priceFormat: { type: "percent", precision: 4, minMove: 0.0001 },
    });
    chartRef.current = chart;
    seriesRef.current = lineSeries;
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [positiveColor]);

  const [pointsCount, setPointsCount] = useState(0);
  useEffect(() => {
    setLoading(true);
    getChartSpread(hours).then((r) => {
      setLoading(false);
      if (r.ok && r.data && seriesRef.current) {
        const data: LineData[] = r.data.points.map((p) => ({
          time: utcMsToLocalChartTime(new Date(p.ts).getTime()) as LineData["time"],
          value: p.spread_pct,
        }));
        setPointsCount(data.length);
        seriesRef.current.setData(data);
      }
    });
  }, [hours]);

  useEffect(() => {
    const lineSeries = seriesRef.current;
    if (!lineSeries) return;
    const priceLines: { pl: ReturnType<typeof lineSeries.createPriceLine> }[] = [];
    if (spreadLevels) {
      priceLines.push({ pl: lineSeries.createPriceLine({ price: spreadLevels.entry, color: accentColor, lineWidth: 2, lineStyle: 2 }) });
      if (spreadLevels.sl != null) priceLines.push({ pl: lineSeries.createPriceLine({ price: spreadLevels.sl, color: negativeColor, lineWidth: 2, lineStyle: 2 }) });
    }
    drawings.forEach((d) => {
      priceLines.push({ pl: lineSeries.createPriceLine({ price: d.value, color: d.color || accentColor, lineWidth: 1, lineStyle: 2 }) });
    });
    return () => priceLines.forEach(({ pl }) => lineSeries.removePriceLine(pl));
  }, [spreadLevels, drawings, accentColor, negativeColor]);

  const addLine = () => {
    const v = parseFloat(newLineValue.replace(",", "."));
    if (isNaN(v)) return;
    const next = [...drawings, { value: v, color: accentColor }];
    setDrawings(next);
    saveDrawings(next);
    setNewLineValue("");
  };

  const removeLine = (i: number) => {
    const next = drawings.filter((_, idx) => idx !== i);
    setDrawings(next);
    saveDrawings(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="shrink-0">
        <SpreadLiveMini spreadLevels={spreadLevels} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--muted)]">Lines:</span>
        <input
          type="text"
          placeholder="Value % (e.g. -0.5)"
          value={newLineValue}
          onChange={(e) => setNewLineValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addLine()}
          className="w-36 px-2 py-1 text-sm rounded bg-[var(--background)] border border-[var(--card-border)]"
        />
        <button onClick={addLine} className="p-1.5 rounded hover:bg-[var(--card-bg)] text-[var(--accent)]" title="Add line">
          <Plus className="w-4 h-4" />
        </button>
        {drawings.map((d, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--background)] text-xs">
            {d.value.toFixed(2)}%
            <button onClick={() => removeLine(i)} className="text-[var(--negative)] hover:opacity-80">
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative h-[calc(100vh-280px)] min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]/80 rounded-lg z-10 text-[var(--muted)]">
            Loading...
          </div>
        )}
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
        {!loading && pointsCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]/80 rounded-lg text-[var(--muted)] text-center px-4">
            No data for the selected period. Start the bot to record spread.
          </div>
        )}
      </div>
    </div>
  );
}

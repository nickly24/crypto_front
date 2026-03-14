"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, CandlestickSeries, LineSeries } from "lightweight-charts";
import { getChartCandles } from "@/lib/api";
import { utcMsToLocalChartTime } from "@/lib/chart-time";
import { Plus, Trash2 } from "lucide-react";

const DRAWINGS_PREFIX = "chart-drawings-inst-";

type InstrumentChartProps = {
  instId: string;
  bar?: string;
  chartType?: "candle" | "line";
};

function loadDrawings(instId: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(DRAWINGS_PREFIX + instId);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function saveDrawings(instId: string, vals: number[]) {
  localStorage.setItem(DRAWINGS_PREFIX + instId, JSON.stringify(vals));
}

export function InstrumentChart({ instId, bar = "1m", chartType = "candle" }: InstrumentChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [drawings, setDrawings] = useState<number[]>([]);
  const [newLineValue, setNewLineValue] = useState("");

  useEffect(() => {
    if (instId) setDrawings(loadDrawings(instId));
  }, [instId]);

  useEffect(() => {
    if (!instId || !containerRef.current) return;
    lastSeriesRef.current = null;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#94a3b8",
      },
      grid: { vertLines: { color: "rgba(255,255,255,0.08)" }, horzLines: { color: "rgba(255,255,255,0.08)" } },
      rightPriceScale: {
        borderColor: "rgba(148,163,184,0.3)",
        scaleMargins: { top: 0.1, bottom: 0.2 },
        textColor: "#94a3b8",
      },
      timeScale: {
        borderColor: "rgba(148,163,184,0.3)",
        timeVisible: true,
        secondsVisible: false,
      },
    });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
      lastSeriesRef.current = null;
    };
  }, [instId, chartType]);

  const lastSeriesRef = useRef<any>(null);

  useEffect(() => {
    if (!instId || !chartRef.current) return;
    const chart = chartRef.current;
    const prevSeries = lastSeriesRef.current;
    if (prevSeries) {
      try {
        chart.removeSeries(prevSeries);
      } catch {
        // series already removed (e.g. chart was recreated)
      }
      lastSeriesRef.current = null;
    }
    getChartCandles(instId, bar, 300).then((r) => {
      if (!r.ok || !r.data || !chartRef.current) return;
      const chart = chartRef.current;
      let series: any;
      if (chartType === "candle") {
        series = chart.addSeries(CandlestickSeries, {
          upColor: "#9ddb00",
          downColor: "#db7500",
          borderVisible: false,
          wickUpColor: "#9ddb00",
          wickDownColor: "#db7500",
        });
        const data = r.data.candles
          .slice()
          .reverse()
          .map((c) => ({
            time: utcMsToLocalChartTime(c.ts) as any,
            open: c.o,
            high: c.h,
            low: c.l,
            close: c.c,
          }));
        series.setData(data);
      } else {
        series = chart.addSeries(LineSeries, {
          color: "#9ddb00",
          lineWidth: 2,
        });
        const data = r.data.candles
          .slice()
          .reverse()
          .map((c) => ({
            time: utcMsToLocalChartTime(c.ts) as any,
            value: c.c,
          }));
        series.setData(data);
      }
      lastSeriesRef.current = series;
      drawings.forEach((v) => series.createPriceLine({ price: v, color: "#6366f1", lineWidth: 1, lineStyle: 2 }));
    });
  }, [instId, bar, chartType, drawings]);

  const addLine = () => {
    const v = parseFloat(newLineValue.replace(",", "."));
    if (isNaN(v)) return;
    const next = [...drawings, v];
    setDrawings(next);
    saveDrawings(instId, next);
    setNewLineValue("");
  };

  const removeLine = (i: number) => {
    const next = drawings.filter((_, idx) => idx !== i);
    setDrawings(next);
    saveDrawings(instId, next);
  };

  if (!instId) {
    return (
      <div className="h-80 flex items-center justify-center text-[var(--muted)] rounded-lg border border-dashed border-[var(--card-border)]">
        Select instrument
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 h-full min-h-0">
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <input
          type="text"
          placeholder="Line price"
          value={newLineValue}
          onChange={(e) => setNewLineValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addLine()}
          className="w-28 px-2 py-1 text-xs rounded bg-[var(--background)] border border-[var(--card-border)]"
        />
        <button onClick={addLine} className="p-1 rounded hover:bg-[var(--card-bg)] text-[var(--accent)]" title="Add line">
          <Plus className="w-4 h-4" />
        </button>
        {drawings.map((v, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--background)] text-xs">
            {v}
            <button onClick={() => removeLine(i)} className="text-[var(--negative)] hover:opacity-80">
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div ref={containerRef} className="flex-1 min-h-[160px] w-full" />
    </div>
  );
}

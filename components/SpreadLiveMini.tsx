"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, LineSeries, LineData } from "lightweight-charts";
import { getChartSpread, botStatus } from "@/lib/api";

const LIVE_WINDOW_MS = 10 * 60 * 1000; // 10 минут
const POLL_MS = 1000;

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  return typeof v === "number" ? v : parseFloat(String(v)) || 0;
}

export function SpreadLiveMini({ spreadLevels }: { spreadLevels?: { entry: number; tp: number | null; sl: number | null } | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ReturnType<IChartApi["addSeries"]> | null>(null);
  const dataRef = useRef<LineData[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#94a3b8",
      },
      grid: { vertLines: { color: "rgba(255,255,255,0.06)" }, horzLines: { color: "rgba(255,255,255,0.06)" } },
      rightPriceScale: {
        borderColor: "rgba(148,163,184,0.25)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
        textColor: "#94a3b8",
      },
      timeScale: {
        borderColor: "rgba(148,163,184,0.25)",
        timeVisible: true,
        secondsVisible: true,
      },
      height: 160,
    });
    const lineSeries = chart.addSeries(LineSeries, {
      color: "#3b82f6",
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
  }, []);

  useEffect(() => {
    getChartSpread(undefined, 10).then((r) => {
      if (!r.ok || !r.data || !seriesRef.current) return;
      const now = Date.now();
      const cutoff = now - LIVE_WINDOW_MS;
      const past = r.data.points
        .map((p) => {
          const t = new Date(p.ts).getTime();
          return { time: Math.floor(t / 1000) as LineData["time"], value: p.spread_pct };
        })
        .filter((d) => {
          if (d.value == null || Number.isNaN(d.value)) return false;
          const ts = typeof d.time === "number" ? d.time * 1000 : new Date(d.time as string).getTime();
          return ts >= cutoff;
        });
      dataRef.current = past;
      if (past.length > 0) {
        seriesRef.current.setData(past);
      }
    });
  }, []);

  useEffect(() => {
    const addLivePoint = (value: number) => {
      const series = seriesRef.current;
      if (!series) return;
      const t = Math.floor(Date.now() / 1000);
      const point: LineData = { time: t as LineData["time"], value };
      dataRef.current = [...dataRef.current.filter((d) => {
        const ts = typeof d.time === "number" ? d.time * 1000 : new Date(d.time as string).getTime();
        return ts >= Date.now() - LIVE_WINDOW_MS;
      }), point];
      series.update(point);
    };

    const id = setInterval(() => {
      botStatus().then((r) => {
        if (!r.ok || !r.data) return;
        const sp = (r.data as { db_state?: { current_spread_pct?: number | string | null } })?.db_state?.current_spread_pct;
        if (sp != null) addLivePoint(num(sp));
      });
    }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series || !spreadLevels) return;
    const lines: ReturnType<typeof series.createPriceLine>[] = [];
    lines.push(series.createPriceLine({ price: spreadLevels.entry, color: "#f59e0b", lineWidth: 1, lineStyle: 2 }));
    if (spreadLevels.tp != null) lines.push(series.createPriceLine({ price: spreadLevels.tp, color: "#22c55e", lineWidth: 1, lineStyle: 2 }));
    if (spreadLevels.sl != null) lines.push(series.createPriceLine({ price: spreadLevels.sl, color: "#ef4444", lineWidth: 1, lineStyle: 2 }));
    return () => lines.forEach((pl) => series.removePriceLine(pl));
  }, [spreadLevels]);

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-[var(--muted)]">Live (10 мин)</p>
      <div ref={containerRef} className="w-full rounded-lg overflow-hidden border border-[var(--card-border)]" />
    </div>
  );
}

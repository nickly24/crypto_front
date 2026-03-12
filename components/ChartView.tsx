"use client";

import { SpreadChart } from "./SpreadChart";
import { InstrumentsChartsView } from "./InstrumentsChartsView";

type ChartViewProps = {
  mode: "spread" | "instruments";
  hours?: number;
  spreadLevels?: {
    entry: number;
    tp: number | null;
    sl: number | null;
  } | null;
  configBaskets?: Array<{ basket1: string; basket2: string }>;
};

export function ChartView({
  mode,
  hours = 10,
  spreadLevels,
  configBaskets = [],
}: ChartViewProps) {
  if (mode === "spread") {
    return (
      <SpreadChart hours={hours} spreadLevels={spreadLevels} />
    );
  }
  return (
    <InstrumentsChartsView hours={hours} configBaskets={configBaskets} />
  );
}

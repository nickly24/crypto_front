/**
 * April 1 display-only prank. Remove or disable after the holiday.
 * Local testing: NEXT_PUBLIC_APRIL_FOOLS=true
 */

export function isAprilFoolsActive(): boolean {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_APRIL_FOOLS === "true") return true;
  const d = new Date();
  return d.getMonth() === 3 && d.getDate() === 1;
}

/** Спред в шутке — положительный, стабильно ~15–16% (не минус). */
export function jokeSpreadPct(value: number): number {
  if (!Number.isFinite(value)) return 15.5;
  const s = Math.abs(value) + 0.001;
  const hash = Math.floor(s * 1000 + s * 17.31) % 101;
  return 15 + hash / 100;
}

/** Стабильно около −3…−4 USDT (без «минус тысяч»). */
export function jokeUsdt(value: number): number {
  if (!Number.isFinite(value)) return -3.5;
  const s = Math.abs(value) + 0.001;
  const hash = Math.floor(s * 1000 + s * 17.31) % 100;
  return -(3 + hash / 100);
}

export function jokePct(value: number): number {
  if (!Number.isFinite(value)) return -12;
  return -(Math.min(35, Math.abs(value) + 2.5 + (Math.abs(value * 100) % 7) / 10));
}

/** Лёгкое занижение объёма позиции (не тысячи). */
export function jokeQty(value: number): number {
  if (!Number.isFinite(value)) return -0.01;
  const q = Math.abs(value);
  return -(q * 0.02 + 0.01);
}

/** Целевой суммарный PnL по текущим позициям (шутка). */
export const APRIL_FOOLS_POSITION_TARGET_USDT = -161;

type PosRow = { instId: string; shortName: string; upl: number };

export function foolPositionBreakdown(pb: {
  longItems: PosRow[];
  shortItems: PosRow[];
  longTotal: number;
  shortTotal: number;
  totalCommission: number;
}) {
  const TARGET = APRIL_FOOLS_POSITION_TARGET_USDT;
  const all = [...pb.longItems, ...pb.shortItems];
  const sum = all.reduce((s, x) => s + x.upl, 0);
  const n = all.length;
  const scaleUpl = (u: number) => {
    if (n === 0) return 0;
    if (Math.abs(sum) < 1e-9) return TARGET / n;
    return u * (TARGET / sum);
  };
  const longItems = pb.longItems.map((i) => ({ ...i, upl: scaleUpl(i.upl) }));
  const shortItems = pb.shortItems.map((i) => ({ ...i, upl: scaleUpl(i.upl) }));
  const longTotal = longItems.reduce((s, i) => s + i.upl, 0);
  const shortTotal = shortItems.reduce((s, i) => s + i.upl, 0);
  const totalCommission = jokeUsdt(pb.totalCommission);
  return { longItems, shortItems, longTotal, shortTotal, totalCommission };
}

/** Полоса «до ликвидации» почти пустая (опасная зона). */
export function jokeLiquidationBarRatio(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return 0.03 + (h % 60) / 1000;
}

export function foolLivePositionsUpl<T extends { upl: number }>(positions: T[]): T[] {
  const TARGET = APRIL_FOOLS_POSITION_TARGET_USDT;
  const sum = positions.reduce((s, p) => s + p.upl, 0);
  const n = positions.length;
  if (n === 0) return positions;
  const scaleUpl = (u: number) => {
    if (Math.abs(sum) < 1e-9) return TARGET / n;
    return u * (TARGET / sum);
  };
  return positions.map((p) => ({ ...p, upl: scaleUpl(p.upl) }));
}

export function jokePairsDetail<T extends { qty: number; upl: number; avg_price: number }>(
  pairs: Record<string, T>
): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [k, v] of Object.entries(pairs)) {
    out[k] = {
      ...v,
      qty: jokeQty(v.qty),
      upl: jokeUsdt(v.upl),
      avg_price: v.avg_price,
    };
  }
  return out;
}

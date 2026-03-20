"use client";

import { motion } from "framer-motion";
import { CryptoIcon } from "@/components/CryptoIcon";
import type { PairPosition } from "@/lib/api";

function splitLongShort(pairs: Record<string, PairPosition>) {
  const longItems: { instId: string; pos: PairPosition }[] = [];
  const shortItems: { instId: string; pos: PairPosition }[] = [];
  for (const [instId, pos] of Object.entries(pairs)) {
    const item = { instId, pos };
    if ((pos.side || "").toLowerCase() === "long") longItems.push(item);
    else shortItems.push(item);
  }
  const longTotal = longItems.reduce((s, x) => s + Number(x.pos.upl || 0), 0);
  const shortTotal = shortItems.reduce((s, x) => s + Number(x.pos.upl || 0), 0);
  return { longItems, shortItems, longTotal, shortTotal };
}

function PnlBalanceBar({ longTotal, shortTotal }: { longTotal: number; shortTotal: number }) {
  const total = longTotal + shortTotal;
  const absLong = Math.abs(longTotal);
  const absShort = Math.abs(shortTotal);
  const sum = absLong + absShort || 1;
  const longPct = Math.round((absLong / sum) * 100);
  const shortPct = 100 - longPct;
  return (
    <div className="mt-3 pt-3 border-t border-[var(--card-border)]/50">
      <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1.5">
        <span>LONG {longTotal >= 0 ? "+" : ""}{longTotal.toFixed(2)}</span>
        <span className="font-medium text-[var(--foreground)]">Total: {total >= 0 ? "+" : ""}{total.toFixed(2)} USDT</span>
        <span>SHORT {shortTotal >= 0 ? "+" : ""}{shortTotal.toFixed(2)}</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden flex bg-[var(--card-border)]/20">
        <div
          className={`h-full opacity-80 transition-all ${longTotal >= 0 ? "bg-[var(--positive)]" : "bg-[var(--negative)]"}`}
          style={{ width: `${longPct}%` }}
          title={`Long: ${longTotal >= 0 ? "+" : ""}${longTotal.toFixed(2)}`}
        />
        <div className="w-px bg-[var(--card-border)] shrink-0 min-w-0.5" aria-hidden />
        <div
          className={`h-full opacity-80 transition-all ${shortTotal >= 0 ? "bg-[var(--positive)]" : "bg-[var(--negative)]"}`}
          style={{ width: `${shortPct}%` }}
          title={`Short: ${shortTotal >= 0 ? "+" : ""}${shortTotal.toFixed(2)}`}
        />
      </div>
    </div>
  );
}

export type TradeDetailProps = {
  pairsDetail: Record<string, PairPosition>;
  longBasket: string | null;
  shortBasket: string | null;
};

export function TradeDetailExpandable({ pairsDetail, longBasket, shortBasket }: TradeDetailProps) {
  const { longItems, shortItems, longTotal, shortTotal } = splitLongShort(pairsDetail);
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="p-4 pl-6 md:pl-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-[var(--positive)]/20 bg-[var(--positive)]/5 p-3">
            <p className="text-xs font-semibold text-[var(--positive)] mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--positive)]" />
              LONG {longBasket || ""}
            </p>
            <div className="space-y-1.5">
              {longItems.map(({ instId, pos }) => (
                <div key={instId} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-[var(--background)]/50 text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <CryptoIcon symbol={instId} size={20} />
                    <span className="truncate font-medium">{instId.replace("-USDT-SWAP", "")}</span>
                  </span>
                  <div className="shrink-0 text-right">
                    <span className={`font-medium ${Number(pos.upl) >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                      {Number(pos.upl) >= 0 ? "+" : ""}{Number(pos.upl).toFixed(2)} USDT
                    </span>
                    <p className="text-[var(--muted)] text-xs">qty {Number(pos.qty).toFixed(0)} · avg ${Number(pos.avg_price).toFixed(4)}</p>
                  </div>
                </div>
              ))}
              {longItems.length === 0 && <p className="text-xs text-[var(--muted)]">—</p>}
            </div>
          </div>
          <div className="rounded-lg border border-[var(--negative)]/20 bg-[var(--negative)]/5 p-3">
            <p className="text-xs font-semibold text-[var(--negative)] mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--negative)]" />
              SHORT {shortBasket || ""}
            </p>
            <div className="space-y-1.5">
              {shortItems.map(({ instId, pos }) => (
                <div key={instId} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-[var(--background)]/50 text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <CryptoIcon symbol={instId} size={20} />
                    <span className="truncate font-medium">{instId.replace("-USDT-SWAP", "")}</span>
                  </span>
                  <div className="shrink-0 text-right">
                    <span className={`font-medium ${Number(pos.upl) >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                      {Number(pos.upl) >= 0 ? "+" : ""}{Number(pos.upl).toFixed(2)} USDT
                    </span>
                    <p className="text-[var(--muted)] text-xs">qty {Number(pos.qty).toFixed(0)} · avg ${Number(pos.avg_price).toFixed(4)}</p>
                  </div>
                </div>
              ))}
              {shortItems.length === 0 && <p className="text-xs text-[var(--muted)]">—</p>}
            </div>
          </div>
        </div>
        <PnlBalanceBar longTotal={longTotal} shortTotal={shortTotal} />
      </div>
    </motion.div>
  );
}

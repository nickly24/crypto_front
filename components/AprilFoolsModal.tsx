"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon } from "lucide-react";
import { isAprilFoolsActive } from "@/lib/april-fools";

export function AprilFoolsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isAprilFoolsActive()) return;
    setOpen(true);
  }, []);

  function dismiss() {
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="april-fools-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="w-full max-w-md rounded-2xl border-2 border-red-600/80 bg-[var(--card-bg)] shadow-[0_0_60px_rgba(220,38,38,0.35)] p-6 md:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 rounded-xl bg-red-600/20 p-3 text-red-500">
                <AlertOctagon className="w-10 h-10" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="april-fools-title" className="text-lg md:text-xl font-bold text-red-500 tracking-tight">
                  CRITICAL MARGIN ALERT
                </h2>
                <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-[var(--foreground)]">
                  Dear user, your account balance is critically low and <strong className="text-red-500">approaching margin call</strong>.
                  Your collateral may be insufficient to maintain open positions. Liquidation risk is elevated.
                </p>
                <p className="mt-3 text-xs md:text-sm text-[var(--muted)] leading-relaxed">
                  Review all positions immediately. Consider reducing exposure or adding funds. This message is informational and
                  may reflect delayed or indicative data.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={dismiss}
                className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                I understand
              </button>
              <p className="text-center text-[10px] text-[var(--muted)]">April 1 — display-only joke; real exchange data is unchanged.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export type TourStep = {
  id: string;
  title: string;
  description: string;
  target: string; // data-tour attribute
};

type Props = {
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
};

export function GuideTour({ steps, open, onClose }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  const step = steps[stepIndex] ?? null;
  const isLast = stepIndex === steps.length - 1;

  const updateTarget = useCallback(() => {
    if (!step || typeof document === "undefined") return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      setTooltipPos({ top: rect.bottom + 12, left: rect.left + rect.width / 2 });
    } else {
      setTargetRect(null);
      setTooltipPos(null);
    }
  }, [step?.target]);

  useEffect(() => {
    if (!open || !step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      const t = setTimeout(updateTarget, 450);
      const ro = new ResizeObserver(updateTarget);
      ro.observe(el);
      const onScroll = () => requestAnimationFrame(updateTarget);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        clearTimeout(t);
        ro.disconnect();
        window.removeEventListener("scroll", onScroll);
      };
    }
    updateTarget();
  }, [open, step, updateTarget]);

  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  function handleNext() {
    if (isLast) {
      onClose();
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
        {targetRect ? (
          <>
            <div className="absolute top-0 left-0 right-0 bg-black/70" style={{ height: targetRect.top }} />
            <div className="absolute left-0 right-0 bottom-0 bg-black/70" style={{ height: window.innerHeight - targetRect.bottom }} />
            <div className="absolute bg-black/70" style={{ top: targetRect.top, left: 0, width: targetRect.left, height: targetRect.height }} />
            <div className="absolute bg-black/70" style={{ top: targetRect.top, left: targetRect.right, width: window.innerWidth - targetRect.right, height: targetRect.height }} />
          </>
        ) : (
          <div className="absolute inset-0 bg-black/70" />
        )}
      </motion.div>

      {/* Highlight ring around target */}
      {targetRect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute rounded-xl ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-transparent shadow-[0_0_0_9999px_transparent]"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: "0 0 0 4px var(--accent)",
          }}
        />
      )}

      {/* Tooltip */}
      {step && (
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="absolute z-10 w-80 max-w-[calc(100vw-2rem)]"
          style={
            targetRect && tooltipPos
              ? {
                  top: Math.min(tooltipPos.top, typeof window !== "undefined" ? window.innerHeight - 200 : 400),
                  left: typeof window !== "undefined" ? Math.max(16, Math.min(tooltipPos.left - 160, window.innerWidth - 336)) : 16,
                }
              : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
          }
        >
          <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-semibold text-[var(--foreground)]">{step.title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] transition shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[var(--muted)] mb-4">{step.description}</p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--muted)]">
                {stepIndex + 1} / {steps.length}
              </span>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--background)] font-medium hover:opacity-90 transition"
              >
                {isLast ? "Done" : "Got it"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

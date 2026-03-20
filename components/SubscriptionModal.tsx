"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useAuth } from "@/providers/auth";
import { createPaymentSubscription, getSubscriptionPrices } from "@/lib/api";
import { planDescription, PLAN_FEATURES, type Plan } from "@/lib/subscription";

type Props = {
  open: boolean;
  onClose: () => void;
};

const PLANS: Plan[] = ["FREE", "PRO", "PRO+"];

export function SubscriptionModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pricesRub, setPricesRub] = useState<Record<string, number>>({});
  const currentPlan = (user?.plan || "FREE") as Plan;

  useEffect(() => {
    if (open) getSubscriptionPrices().then((r) => r.ok && r.data?.prices && setPricesRub(r.data.prices));
  }, [open]);

  async function handlePurchase(plan: Plan) {
    if (plan === "FREE") return;
    setLoading(plan);
    setError(null);
    const r = await createPaymentSubscription(plan);
    setLoading(null);
    if (r.ok && r.data?.confirmation_url) {
      window.location.href = r.data.confirmation_url;
      return;
    }
    setError(r.error || "Payment failed");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={loading ? undefined : onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--card-border)] shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]/50 bg-[var(--card-bg)]/80 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Plans</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
            <motion.div
              key="plans"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 md:p-8"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">
                  Choose your plan
                </h1>
                <p className="text-base text-[var(--muted)]">
                  Unlock endless possibilities
                </p>
              </div>

              {error && (
                <p className="mb-6 text-sm text-[var(--negative)] text-center">{error}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((plan) => {
                  const isCurrent = currentPlan === plan;
                  const isFree = plan === "FREE";
                  const isPro = plan === "PRO";
                  const isProPlus = plan === "PRO+";

                  const cardBg = isFree
                    ? "bg-[var(--muted)]/5"
                    : isPro
                      ? "bg-violet-900/10 border-violet-500/20"
                      : "bg-violet-500/10 border-violet-500/40 shadow-[0_0_40px_-10px_rgba(139,92,246,0.4)]";

                  const checkColor = isFree ? "text-emerald-500" : isPro ? "text-violet-400" : "text-blue-400";

                  return (
                    <div
                      key={plan}
                      className={`relative rounded-2xl p-6 flex flex-col border ${cardBg} ${isProPlus ? "border-2 border-violet-500/60 ring-2 ring-violet-500/20" : ""}`}
                    >
                      {isPro && (
                        <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/30 text-violet-200">
                          Popular
                        </span>
                      )}

                      <h3 className={`text-xl font-bold mb-1 ${isFree ? "text-[var(--muted)]" : "text-[var(--foreground)]"}`}>
                        {plan}
                      </h3>
                      <p className="text-sm text-[var(--muted)] mb-6 min-h-[40px]">
                        {planDescription(plan)}
                      </p>

                      <div className="mb-6">
                        {isFree ? (
                          <span className="text-4xl font-bold text-[var(--foreground)]">0 ₽</span>
                        ) : (
                          <>
                            <span className="text-4xl font-bold text-[var(--foreground)]">
                              {pricesRub[plan] != null ? `${Number(pricesRub[plan]).toLocaleString("ru-RU")} ₽` : "—"}
                            </span>
                            <span className="text-base text-[var(--muted)] font-normal ml-1">/ 30 дней</span>
                          </>
                        )}
                      </div>

                      <ul className="space-y-3 flex-1 min-h-0">
                        {PLAN_FEATURES[plan].map((feature, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-sm text-[var(--muted)]">
                            <Check className={`w-4 h-4 shrink-0 ${checkColor}`} strokeWidth={2.5} />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {isFree ? (
                        <div className="mt-6 pt-6 border-t border-[var(--card-border)]/50 shrink-0">
                          <div className="py-3 px-4 rounded-xl text-center text-sm text-[var(--muted)] bg-[var(--background)]/50 border border-[var(--card-border)]">
                            {isCurrent ? "Current plan" : "Get started"}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6 pt-6 border-t border-[var(--card-border)]/50 shrink-0">
                          <button
                            onClick={() => handlePurchase(plan)}
                            disabled={!!loading}
                            className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2
                              ${isProPlus
                                ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white hover:opacity-90 shadow-lg"
                                : "bg-violet-500/20 text-violet-200 border border-violet-500/30 hover:bg-violet-500/30"
                              }`}
                          >
                            {loading === plan ? (
                              <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              isCurrent ? "Renew" : "Get started"
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getDeveloperConfig } from "@/lib/api";
import { useAuth } from "@/providers/auth";
import { useSubscriptionModal } from "@/providers/subscription-modal";
import { Layers, Settings2, Lock, Zap } from "lucide-react";
import { CryptoIcon } from "@/components/CryptoIcon";

type BotConfigData = {
  baskets: Array<{ basket1: string; basket2: string }>;
  params: Record<string, number | boolean>;
  modes: Record<string, boolean>;
  error_handling?: Record<string, string | number | boolean>;
};

const paramDefs: Array<{
  key: string;
  label: string;
  type: "number" | "boolean";
  suffix?: string;
}> = [
  { key: "entry_spread_pct", label: "Entry spread", type: "number", suffix: "%" },
  { key: "take_profit_pct", label: "Take profit", type: "number", suffix: "%" },
  { key: "stop_loss_pct", label: "Stop loss", type: "number", suffix: "%" },
  { key: "stop_loss_enabled", label: "Stop loss enabled", type: "boolean" },
  { key: "position_size_pct", label: "Position size", type: "number", suffix: "%" },
  { key: "orders_per_trade", label: "Orders per trade", type: "number" },
  { key: "dca_count", label: "DCA count", type: "number" },
  { key: "dca_step_pct", label: "DCA step", type: "number", suffix: "%" },
  { key: "leverage", label: "Leverage", type: "number", suffix: "x" },
];

export default function DeveloperConfigPage() {
  const { user } = useAuth();
  const modalCtx = useSubscriptionModal();
  const openSubscriptionModalRef = useRef(modalCtx?.openSubscriptionModal);
  openSubscriptionModalRef.current = modalCtx?.openSubscriptionModal;

  const [config, setConfig] = useState<BotConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isProPlus = (user?.plan || "FREE") === "PRO+";

  useEffect(() => {
    if (!isProPlus) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getDeveloperConfig()
      .then((r) => {
        if (r.ok && r.data) {
          setConfig(r.data);
          setError(null);
        } else {
          setConfig(null);
          setError(r.error || "Failed to load config");
        }
      })
      .finally(() => setLoading(false));
  }, [isProPlus]);

  const showSpinner = loading && isProPlus;
  const showLock = !isProPlus;
  const showContent = !loading && isProPlus;

  return (
    <DashboardLayout>
      {showSpinner && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {showLock && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">Developer config</h1>
            <p className="text-[var(--muted)] mt-1">Read-only view of main account trading configuration</p>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="w-20 h-20 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-[var(--muted)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">PRO+ only</h2>
            <p className="text-[var(--muted)] max-w-md mb-6">
              This feature is available on the PRO+ plan. Upgrade to view how the main account (user_id=1) is configured and trading.
            </p>
            <button
              type="button"
              onClick={() => openSubscriptionModalRef.current?.()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 font-medium transition"
            >
              <Zap className="w-5 h-5" />
              Upgrade to PRO+
            </button>
          </div>
        </>
      )}

      {showContent && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">Developer config</h1>
            <p className="text-[var(--muted)] mt-1">Read-only view of main account (user_id=1) trading configuration</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 mb-6">
              <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p>
            </div>
          )}

          {config && (
            <div className="space-y-6 max-w-4xl">
              <div className="card-glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">Trading pairs</h2>
                    <p className="text-xs text-[var(--muted)]">Basket 1 vs Basket 2</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {config.baskets.length === 0 ? (
                    <p className="py-6 text-center text-sm text-[var(--muted)]">No baskets configured</p>
                  ) : (
                    config.baskets.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[var(--background)]/40 border border-[var(--card-border)]/50"
                      >
                        <span className="text-xs font-medium text-[var(--muted)] w-6 shrink-0">{i + 1}</span>
                        <span className="flex items-center gap-2 font-medium text-[var(--positive)]">
                          <CryptoIcon symbol={b.basket1} size={18} />
                          {b.basket1}
                        </span>
                        <span className="text-[var(--muted)] text-sm">vs</span>
                        <span className="flex items-center gap-2 font-medium text-[var(--negative)]">
                          <CryptoIcon symbol={b.basket2} size={18} />
                          {b.basket2}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card-glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">Parameters</h2>
                    <p className="text-xs text-[var(--muted)]">Entry, exit and position settings</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paramDefs.map((pd) => {
                    const val = config.params[pd.key];
                    return (
                      <div
                        key={pd.key}
                        className="p-4 rounded-xl bg-[var(--background)]/40 border border-[var(--card-border)]/50"
                      >
                        <label className="block text-xs font-medium text-[var(--muted)] mb-2">{pd.label}</label>
                        {pd.type === "boolean" ? (
                          <span
                            className={`text-sm font-semibold ${val ? "text-[var(--positive)]" : "text-[var(--muted)]"}`}
                          >
                            {val ? "On" : "Off"}
                          </span>
                        ) : (
                          <span className="font-semibold text-[var(--foreground)]">
                            {typeof val === "number" ? val : "—"}
                            {pd.suffix && typeof val === "number" ? pd.suffix : ""}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-5 border-t border-[var(--card-border)]">
                  <p className="text-xs font-medium text-[var(--muted)] mb-3">Modes</p>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { key: "simulation_mode", label: "Simulation mode" },
                      { key: "no_new_position", label: "No new positions" },
                    ].map(({ key, label }) => {
                      const val = config.modes[key];
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-sm text-[var(--foreground)]">{label}</span>
                          <span
                            className={`text-sm font-semibold ${val ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}
                          >
                            {val ? "On" : "Off"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

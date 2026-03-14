"use client";

import { useState } from "react";
import { LandingHeader } from "@/components/LandingHeader";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is pair trading?",
    a: "Pair trading is a strategy where two correlated positions are opened (long on one instrument, short on another). Profit comes from spread convergence or divergence, not from overall market movement.",
  },
  {
    q: "Do I need a real OKX account?",
    a: "You can use OKX demo — the bot supports demo mode. For live trading you need a real account and API keys with trading permissions.",
  },
  {
    q: "Why doesn't the position close?",
    a: "Sometimes the exchange doesn't fill market orders immediately (low liquidity, technical limits). Try closing manually via OKX with 'Market' type and 'Reduce Only' flag. Ensure your IP is in the API key whitelist.",
  },
  {
    q: "How do I configure take profit and stop loss?",
    a: "In Settings, set the percentage for take profit (when to close at profit) and stop loss (when to close at loss). You can disable stop loss if you prefer manual control only.",
  },
  {
    q: "Why did the bot open only part of the positions?",
    a: "Previously this could happen when quotes didn't arrive in time. The bot now uses reference prices as fallback and should open all 10 positions (5 long + 5 short) with a correct balance.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <LandingHeader />
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">FAQ</h1>
        <p className="text-[var(--muted)] mb-12">Answers to common questions about the platform</p>

        <div className="space-y-2">
          {faqs.map(({ q, a }, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]/50 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left font-medium hover:bg-white/5 transition"
              >
                {q}
                <ChevronDown
                  className={`w-5 h-5 text-[var(--muted)] transition-transform ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-[var(--muted)] text-sm leading-relaxed">
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

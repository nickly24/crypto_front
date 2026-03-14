"use client";

import { LandingHeader } from "@/components/LandingHeader";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Connect OKX",
    desc: "In Settings, add API keys from demo or live OKX account. Don't forget to add your IP to the whitelist.",
  },
  {
    title: "Configure baskets",
    desc: "Select instrument pairs (e.g. BTC vs ETH, BNB vs XRP). The bot will trade the spread between them.",
  },
  {
    title: "Set parameters",
    desc: "Entry threshold (%), take profit, stop loss, position size and leverage — all configurable for your strategy.",
  },
  {
    title: "Start the bot",
    desc: "Click 'Start' on the dashboard. The bot connects to OKX, receives quotes and enters trades per your rules.",
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <LandingHeader />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2"
        >
          Platform guide
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[var(--muted)] mb-12"
        >
          Quick start guide
        </motion.p>

        <div className="space-y-8">
          {steps.map(({ title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex gap-6"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] font-bold">
                {i + 1}
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-1">{title}</h2>
                <p className="text-[var(--muted)] text-sm leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

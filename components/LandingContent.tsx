"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Shield,
  TrendingUp,
  BarChart3,
  Calculator,
  ArrowUpRight,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

const features = [
  {
    icon: Zap,
    title: "Fast entry",
    desc: "The bot reacts to spread in real time and opens positions per your rules.",
  },
  {
    icon: Shield,
    title: "Capital protection",
    desc: "Take profit, stop loss and DCA — configurable risk limits.",
  },
  {
    icon: TrendingUp,
    title: "Analytics",
    desc: "Statistics, trade history and PnL in a clear dashboard.",
  },
];

const chartData = [
  { m: "Month 1", pnl: 2 },
  { m: "Month 2", pnl: 5 },
  { m: "Month 3", pnl: 9 },
  { m: "Month 4", pnl: 14 },
  { m: "Month 5", pnl: 20 },
  { m: "Month 6", pnl: 28 },
];

const steps = [
  { n: "01", title: "Connect OKX API", desc: "Link your account with secure API keys." },
  { n: "02", title: "Configure baskets", desc: "Set thresholds, pairs and risk per your plan." },
  { n: "03", title: "Start the bot", desc: "Launch automation with one click." },
  { n: "04", title: "Track results", desc: "Review PnL and history in the dashboard." },
];

export function LandingContent() {
  const [deposit, setDeposit] = useState(5000);
  const [monthlyPct, setMonthlyPct] = useState(3);
  const months = 12;
  const projected = Array.from({ length: months }, (_, i) => {
    const val = deposit * Math.pow(1 + monthlyPct / 100, i + 1);
    return { m: `${i + 1}`, val: Math.round(val) };
  });

  const shell = "max-w-6xl mx-auto px-5 sm:px-6";

  return (
    <div className="space-y-20 sm:space-y-28 pb-24 sm:pb-32">
      {/* Features */}
      <section className={shell}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="text-sm font-medium text-[var(--accent)] tracking-wide uppercase mb-2">Why us</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Why <span className="text-[var(--accent)]">PairTrading</span>?
          </h2>
          <p className="text-[var(--muted)] mt-3 max-w-lg mx-auto text-sm sm:text-base">
            Built for spread traders who want execution without babysitting the chart.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative rounded-2xl border border-[var(--card-border)] bg-gradient-to-b from-[var(--card-bg)] to-[var(--card-bg)]/40 p-6 sm:p-8 shadow-[var(--shadow-sm)] hover:border-[var(--accent)]/35 hover:shadow-[var(--shadow-md)] transition-all"
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(600px_200px_at_50%_0%,rgba(157,219,0,0.06),transparent)] pointer-events-none" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center mb-5 ring-1 ring-[var(--accent)]/20">
                  <Icon className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-[var(--muted)] text-sm leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Calculator */}
      <section className={shell}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--card-bg)] via-[var(--card-bg)] to-[var(--background)] p-6 sm:p-10 overflow-hidden shadow-[var(--shadow-md)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-6 h-6 text-[var(--accent)]" />
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How much can you earn?</h2>
              </div>
              <p className="text-[var(--muted)] text-sm max-w-xl">
                Approximate calculation with reinvestment. Results depend on settings and market conditions.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
            <div className="space-y-8">
              <div>
                <label className="text-sm font-medium text-[var(--muted)]">Deposit (USDT)</label>
                <input
                  type="range"
                  min={1000}
                  max={50000}
                  step={1000}
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="w-full mt-3 h-2 rounded-full appearance-none cursor-pointer accent-[var(--accent)] bg-[var(--sidebar-hover)]"
                />
                <div className="flex justify-between mt-2 text-xs text-[var(--muted)]">
                  <span>$1k</span>
                  <span className="text-lg font-bold text-[var(--foreground)]">${deposit.toLocaleString()}</span>
                  <span>$50k</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted)]">Avg monthly return (%)</label>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={0.5}
                  value={monthlyPct}
                  onChange={(e) => setMonthlyPct(Number(e.target.value))}
                  className="w-full mt-3 h-2 rounded-full appearance-none cursor-pointer accent-[var(--accent)] bg-[var(--sidebar-hover)]"
                />
                <div className="flex justify-between mt-2 text-xs text-[var(--muted)]">
                  <span>1%</span>
                  <span className="text-lg font-bold text-[var(--foreground)]">{monthlyPct}%</span>
                  <span>8%</span>
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/8 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">After 12 months</span>
                  <span className="text-2xl font-bold text-[var(--accent)] tabular-nums">
                    ${projected[11]?.val.toLocaleString() ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-56 sm:h-64 lg:h-auto lg:min-h-[280px] rounded-2xl border border-[var(--card-border)] bg-[var(--background)]/50 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projected}>
                  <defs>
                    <linearGradient id="areaCalcGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9ddb00" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#9ddb00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--card-border)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="m" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                  <YAxis
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    formatter={(v: number) => [`$${v.toLocaleString()}`, "Balance"]}
                    contentStyle={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                      borderRadius: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke="#9ddb00"
                    strokeWidth={2}
                    fill="url(#areaCalcGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Growth chart */}
      <section className={shell}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)]/80 backdrop-blur-sm p-6 sm:p-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-6 h-6 text-[var(--accent)]" />
            <h2 className="text-2xl sm:text-3xl font-bold">Example portfolio growth</h2>
          </div>
          <p className="text-[var(--muted)] text-sm mb-8 max-w-2xl">
            Sample accumulation curve with a conservative strategy (~0.5% avg PnL per trade, 2–3 trades per week).
          </p>
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9ddb00" stopOpacity={0.5} />
                    <stop offset="50%" stopColor="#9ddb00" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#9ddb00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--card-border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="m" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v) => `+${v}%`} />
                <Tooltip
                  formatter={(v: number) => [`+${v}%`, "Accumulated PnL"]}
                  contentStyle={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    borderRadius: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  stroke="#9ddb00"
                  strokeWidth={2.5}
                  fill="url(#growthGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      {/* Steps */}
      <section className={shell}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-4"
        >
          Launch in four steps
        </motion.h2>
        <p className="text-center text-[var(--muted)] text-sm mb-12 max-w-md mx-auto">
          From API keys to live trades — a straight path.
        </p>
        <div className="max-w-3xl mx-auto space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-5 sm:gap-8"
            >
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/12 border border-[var(--accent)]/30 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-[var(--accent)]">
                    {step.n}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 min-h-[2rem] bg-gradient-to-b from-[var(--accent)]/35 to-transparent my-2" />
                )}
              </div>
              <div className={`pb-10 ${i === steps.length - 1 ? "pb-0" : ""}`}>
                <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-[var(--muted)] text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className={shell}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-5 sm:gap-6"
        >
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]/50 p-6 sm:p-8">
            <h3 className="text-lg font-semibold mb-5 text-[var(--muted)]">Manual trading</h3>
            <ul className="space-y-3 text-sm text-[var(--muted)]">
              {["Need to watch 24/7", "Emotions affect decisions", "Easy to miss entries", "Hard to scale"].map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-[var(--negative)] shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--accent)]/35 bg-gradient-to-br from-[var(--accent)]/10 to-transparent p-6 sm:p-8 shadow-[inset_0_0_0_1px_rgba(157,219,0,0.2)]">
            <h3 className="text-lg font-semibold mb-5 text-[var(--accent)]">PairTrading bot</h3>
            <ul className="space-y-3 text-sm">
              {["Runs automatically", "Clear rules, no emotions", "Never misses signals", "10 pairs at once"].map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[var(--positive)] shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className={shell}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/30 bg-gradient-to-b from-[var(--accent)]/12 to-transparent px-6 py-12 sm:px-12 sm:py-16 text-center"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(157, 219, 0, 0.15), transparent 55%)",
            }}
          />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Ready to start?</h2>
            <p className="text-[var(--muted)] text-sm sm:text-base mb-8 max-w-md mx-auto">
              Connect OKX and start the bot in minutes.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[var(--accent)] text-slate-900 font-semibold hover:brightness-105 transition shadow-lg shadow-[var(--accent)]/25"
            >
              Sign in to panel
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className={`${shell} pt-4 border-t border-[var(--card-border)]`}>
        <p className="text-center text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} PairTrading. Spread trading involves risk.
        </p>
      </footer>
    </div>
  );
}

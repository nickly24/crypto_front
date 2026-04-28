"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  Gauge,
  Layers3,
  LineChart,
  LockKeyhole,
  Radio,
  ShieldCheck,
  Split,
  Zap,
} from "lucide-react";

const pillars = [
  {
    icon: Split,
    title: "Spread-first logic",
    desc: "Signals are built around divergence between baskets, not a one-sided market bet.",
  },
  {
    icon: ShieldCheck,
    title: "Risk before entry",
    desc: "Take profit, stop loss, DCA, leverage, and allocation are visible before the bot opens exposure.",
  },
  {
    icon: Radio,
    title: "Live execution state",
    desc: "Track entries, hedge checks, open legs, and closure reasons without digging through exchange screens.",
  },
];

const systemCards = [
  { icon: Layers3, title: "Basket builder", value: "Long / short sets", detail: "Pair groups, weights, thresholds" },
  { icon: Gauge, title: "Signal engine", value: "Spread + z-score", detail: "Entry, exit, and reset conditions" },
  { icon: Bot, title: "Bot control", value: "Start / pause / close", detail: "One panel for runtime actions" },
  { icon: LineChart, title: "Analytics", value: "PnL history", detail: "Trades, win rate, exposure, timing" },
];

const workflow = [
  "Connect an OKX API key with the permissions you choose.",
  "Build baskets and set the exact spread threshold.",
  "Define position size, leverage, take profit, and stop loss.",
  "Launch the bot and watch execution, risk, and PnL in real time.",
];

export function LandingContent() {
  const shell = "mx-auto max-w-7xl px-5 sm:px-6 lg:px-10";

  return (
    <div className="pb-24 sm:pb-32">
      <section className={`${shell} py-14 sm:py-18 lg:py-16`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 max-w-3xl"
        >
          <p className="mb-3 text-sm font-semibold uppercase text-[var(--accent)]">Execution stack</p>
          <h2 className="text-3xl font-semibold leading-tight tracking-normal text-[var(--foreground)] sm:text-4xl">
            A trading desk for spreads, not another generic chart page.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
            PairTrading brings the pieces that matter into one controlled interface: baskets, live spread behavior,
            execution state, and portfolio risk.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-lg border border-[var(--card-border)] bg-[linear-gradient(180deg,rgba(40,44,43,0.9),rgba(31,35,34,0.82))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--accent)]/18 bg-[var(--accent)]/8">
                <Icon className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">{title}</h3>
              <p className="text-sm leading-6 text-[var(--muted)]">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-14 sm:py-18 lg:py-14">
        <div className={`${shell}`}>
          <div className="rounded-[24px] border border-[var(--accent)]/40 bg-[var(--accent)] p-5 text-slate-950 shadow-[0_30px_90px_rgba(0,0,0,0.18)] sm:p-7 lg:p-8">
            <div className="mb-8 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-2xl"
              >
                <p className="mb-3 text-sm font-semibold uppercase text-slate-900/70">Built for operators</p>
                <h2 className="text-3xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-4xl">
                  Less noise. More control at the exact moment of execution.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-900/72">
                  The value is disciplined automation, clear risk, and fast visibility when the spread reaches your
                  rules.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="lg:self-start"
              >
                <Link
                  href="/guide"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/70 bg-white px-5 text-sm font-semibold text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:bg-slate-100"
                >
                  See setup flow
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid gap-4 sm:grid-cols-2"
              >
                {systemCards.map(({ icon: Icon, title, value, detail }) => (
                  <div
                    key={title}
                    className="rounded-xl border border-black/8 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                  >
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--accent)]/22 bg-[var(--accent)]/12">
                        <Icon className="h-5 w-5 text-[var(--accent)]" />
                      </div>
                      <span className="rounded-md border border-slate-900/10 bg-slate-100 px-2 py-1 text-xs text-slate-500">
                        Live
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-slate-500">{title}</h3>
                    <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-xl border border-black/8 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:p-6"
              >
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--accent)]/22 bg-[var(--accent)]/12">
                  <Gauge className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-950">One operator surface for the full run.</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Basket structure, signal quality, control actions, and analytics sit in one visual rhythm instead of
                  being split across exchange tabs and notes.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    "Structure your long / short baskets before entry.",
                    "See runtime controls without leaving the panel.",
                    "Read analytics in the same visual system as execution.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-slate-950/8 bg-white/78 px-4 py-3 text-sm leading-6 text-slate-800"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--card-border)] bg-[var(--card-bg)]/35 py-14 sm:py-18 lg:py-14">
        <div className={`${shell} grid items-center gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 18 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto w-full max-w-[18rem] sm:max-w-[20rem] lg:max-w-[21rem]"
          >
            <div className="absolute inset-10 bg-[var(--accent)]/12 blur-3xl" />
            <Image
              src="/landing/mobile-bot-mockup-cutout.png"
              alt="Mobile bot control screen with pair list, risk mode, and compact PnL cards"
              width={854}
              height={1842}
              className="relative w-full object-contain drop-shadow-[0_34px_80px_rgba(0,0,0,0.45)]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl lg:pt-6"
          >
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--accent)]/25 bg-[var(--accent)]/12 text-[var(--accent)]">
              <Zap className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-semibold leading-tight tracking-normal text-[var(--foreground)] sm:text-4xl">
              Start simple. Scale into a full pair-trading cockpit.
            </h2>
            <div className="mt-8 space-y-4">
              {workflow.map((item, i) => (
                <div key={item} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--accent)]/25 bg-[var(--accent)]/10 text-sm font-semibold text-[var(--accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="pt-1 text-base leading-7 text-[var(--muted)]">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className={`${shell} py-14 sm:py-18 lg:py-16`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid gap-8 rounded-lg border border-[var(--accent)]/25 bg-[#171a19] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center"
        >
          <div>
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent)] text-slate-950">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl">
              Ready when your strategy is ready.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              Connect API access, keep your rules explicit, and use the panel as the command center for automated
              spread trading.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 text-sm font-semibold text-slate-950 transition hover:brightness-105"
          >
            Sign in to panel
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      <footer className={`${shell} border-t border-[var(--card-border)] pt-6`}>
        <p className="text-center text-xs leading-6 text-[var(--muted)]">
          © {new Date().getFullYear()} PairTrading. Spread trading involves risk.
        </p>
      </footer>
    </div>
  );
}

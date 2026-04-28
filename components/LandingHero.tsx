"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-45"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.055) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(to bottom, black 0%, black 54%, transparent 92%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent to-[var(--background)] pointer-events-none" />

      <div className="relative mx-auto grid min-h-[calc(88vh-4.25rem)] max-w-7xl items-center gap-10 px-5 py-12 sm:px-6 lg:min-h-[calc(74vh-4.25rem)] lg:grid-cols-[0.72fr_1.28fr] lg:gap-8 lg:px-10 lg:py-10 xl:min-h-[calc(76vh-4.25rem)]">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-6 inline-flex items-center gap-2 rounded-lg border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-3 py-2 text-sm font-medium text-[var(--accent)]"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_18px_var(--accent)]" />
            Market-neutral automation for OKX
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.04 }}
            className="mb-6 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-normal text-[var(--foreground)] sm:text-5xl"
          >
            Automate spread trading with controlled execution.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, delay: 0.1 }}
            className="mb-8 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg"
          >
            Build baskets, define risk, and let the bot monitor divergence, hedge entries, and exits from a single
            clean trading panel.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="mb-10 hidden gap-3 sm:flex-row lg:flex"
          >
            <Link
              href="/login"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 text-sm font-semibold text-slate-950 shadow-[0_18px_55px_rgba(157,219,0,0.22)] transition hover:brightness-105"
            >
              Open the panel
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/guide"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]/60 px-6 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
            >
              View workflow
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="relative -mx-5 sm:mx-0 lg:-mr-10 xl:-mr-18"
        >
          <div className="absolute inset-6 bg-[var(--accent)]/12 blur-3xl" />
          <Image
            src="/landing/trading-dashboard-mockup-cutout.png"
            alt="PairTrading dashboard with spread chart, bot execution timeline, and risk panels"
            width={1619}
            height={972}
            priority
            className="relative w-full max-w-[58rem] select-none object-contain drop-shadow-[0_32px_76px_rgba(0,0,0,0.48)] xl:max-w-[60rem]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="flex flex-col gap-3 lg:hidden"
        >
          <Link
            href="/login"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 text-sm font-semibold text-slate-950 shadow-[0_18px_55px_rgba(157,219,0,0.22)] transition hover:brightness-105"
          >
            Open the panel
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/guide"
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]/60 px-6 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
          >
            View workflow
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

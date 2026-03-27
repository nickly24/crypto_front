"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Activity, Clock, Shield, TrendingUp } from "lucide-react";

const heroStats = [
  { label: "Avg PnL / trade", value: "0.5–2%", icon: TrendingUp },
  { label: "Pairs parallel", value: "10", icon: Activity },
  { label: "Uptime", value: "24/7", icon: Clock },
  { label: "Exchange", value: "OKX", icon: Shield },
];

export function LandingHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMouse({ x, y });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  const dx = (mouse.x - 0.5) * 36;
  const dy = (mouse.y - 0.5) * 28;

  return (
    <section
      ref={containerRef}
      className="relative min-h-[min(92vh,56rem)] flex flex-col items-center justify-center overflow-hidden pt-6 pb-16 sm:pb-20"
    >
      {/* Ambient orbs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `perspective(900px) rotateX(${dy * 0.35}deg) rotateY(${dx * 0.35}deg)`,
        }}
      >
        <div
          className="absolute w-[min(42rem,90vw)] h-[min(42rem,90vw)] rounded-full blur-[120px] opacity-90"
          style={{
            background: "radial-gradient(circle, rgba(157,219,0,0.22) 0%, rgba(99,102,241,0.08) 45%, transparent 70%)",
            left: "50%",
            top: "18%",
            transform: `translate(calc(-50% + ${dx * 12}px), calc(-50% + ${dy * 12}px))`,
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full blur-[100px] opacity-70"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)",
            right: "8%",
            bottom: "12%",
            transform: `translate(${-dx * 10}px, ${-dy * 10}px)`,
          }}
        />
        <div
          className="absolute w-72 h-72 rounded-full blur-[90px] opacity-60"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)",
            left: "5%",
            bottom: "18%",
            transform: `translate(${dx * 8}px, ${dy * 8}px)`,
          }}
        />
      </div>

      {/* Grid + vignette */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35] dark:opacity-[0.45]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--card-border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--card-border) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 75% 60% at 50% 40%, black 20%, transparent 75%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/40 to-[var(--background)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/8 backdrop-blur-md mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
          </span>
          <span className="text-sm font-medium text-[var(--accent)] tracking-wide">Automated pair trading on OKX</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="text-[2.25rem] sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]"
        >
          <span className="bg-gradient-to-b from-[var(--foreground)] to-[var(--muted)] bg-clip-text text-transparent">
            Automated{" "}
          </span>
          <span className="bg-gradient-to-r from-emerald-400 via-[var(--accent)] to-lime-300 bg-clip-text text-transparent">
            pair trading
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="text-base sm:text-lg text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Trade crypto pairs on the spread. The bot enters and exits per your rules — minimize risk, aim for steady
          returns.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14 sm:mb-16"
        >
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2 min-w-[200px] px-8 py-3.5 rounded-full bg-[var(--accent)] text-slate-900 font-semibold shadow-xl shadow-[var(--accent)]/25 hover:brightness-105 transition"
          >
            Get started
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/guide"
            className="inline-flex items-center justify-center min-w-[200px] px-8 py-3.5 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)]/40 text-[var(--foreground)] font-medium backdrop-blur-sm hover:border-[var(--accent)]/35 hover:bg-[var(--sidebar-hover)] transition"
          >
            How it works
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
        >
          {heroStats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="relative rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]/60 backdrop-blur-xl px-4 py-4 sm:py-5 text-center shadow-[var(--shadow-sm)] hover:border-[var(--accent)]/25 transition-colors"
            >
              <Icon className="w-5 h-5 text-[var(--accent)] mx-auto mb-2 opacity-90" />
              <div className="text-lg sm:text-xl font-bold text-[var(--foreground)] tabular-nums">{value}</div>
              <div className="text-xs text-[var(--muted)] mt-1 leading-snug">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

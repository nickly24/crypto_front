"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

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

  const dx = (mouse.x - 0.5) * 40;
  const dy = (mouse.y - 0.5) * 30;

  return (
    <section
      ref={containerRef}
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
    >
      {/* 3D parallax — brighter, more visible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `perspective(800px) rotateX(${dy * 0.8}deg) rotateY(${dx * 0.8}deg)`,
        }}
      >
        <div
          className="absolute w-[550px] h-[550px] rounded-full blur-[110px]"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, rgba(99,102,241,0.15) 40%, transparent 70%)",
            left: "50%",
            top: "25%",
            transform: `translate(calc(-50% + ${dx * 15}px), calc(-50% + ${dy * 15}px))`,
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.45) 0%, transparent 70%)",
            right: "10%",
            bottom: "15%",
            transform: `translate(${-dx * 12}px, ${-dy * 12}px)`,
          }}
        />
        <div
          className="absolute w-[320px] h-[320px] rounded-full blur-[90px]"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
            left: "5%",
            bottom: "20%",
            transform: `translate(${dx * 10}px, ${dy * 10}px)`,
          }}
        />
        <div
          className="absolute w-[260px] h-[260px] rounded-full blur-[70px]"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)",
            left: "60%",
            top: "10%",
            transform: `translate(${-dx * 8}px, ${dy * 8}px)`,
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-2xl border border-indigo-400/25 bg-indigo-500/5 backdrop-blur-sm"
          style={{
            right: "20%",
            top: "30%",
            transform: `translate(${-dx * 18}px, ${-dy * 18}px) rotate(${dx * 8}deg)`,
          }}
        />
        <div
          className="absolute w-36 h-36 rounded-full border border-blue-400/30 bg-blue-500/5"
          style={{
            left: "25%",
            top: "35%",
            transform: `translate(${dx * 20}px, ${dy * 20}px)`,
          }}
        />
        <div
          className="absolute w-24 h-24 rounded-xl border border-purple-400/30 bg-purple-500/10"
          style={{
            right: "35%",
            bottom: "30%",
            transform: `translate(${dx * -15}px, ${dy * -15}px) rotate(${-dx * 6}deg)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
        >
          <span className="text-white">Автоматический </span>
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            pair trading
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-10"
        >
          Торгуйте парами криптовалют на спреде. Бот входит и выходит по настраиваемым правилам.
          Минимизируйте риск, максимизируйте стабильную доходность.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-indigo-500/25"
          >
            Начать
          </Link>
          <Link
            href="/guide"
            className="px-8 py-3 rounded-xl border border-white/20 text-white/90 font-medium hover:bg-white/5 transition"
          >
            Как это работает
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

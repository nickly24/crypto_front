"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Shield, TrendingUp, BarChart3, Calculator, ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const features = [
  { icon: Zap, title: "Быстрый вход", desc: "Бот реагирует на спред в реальном времени и открывает позиции по вашим правилам." },
  { icon: Shield, title: "Защита капитала", desc: "Тейк-профит, стоп-лосс и DCA — настраиваемые ограничения риска." },
  { icon: TrendingUp, title: "Аналитика", desc: "Статистика, история сделок и PnL в удобном дашборде." },
];

const stats = [
  { value: "0.5–2%", label: "Средний PnL на сделку" },
  { value: "10 пар", label: "Одновременно в работе" },
  { value: "24/7", label: "Бот работает без остановки" },
  { value: "OKX", label: "Интеграция с биржей" },
];

const chartData = [
  { m: "Месяц 1", pnl: 2 },
  { m: "Месяц 2", pnl: 5 },
  { m: "Месяц 3", pnl: 9 },
  { m: "Месяц 4", pnl: 14 },
  { m: "Месяц 5", pnl: 20 },
  { m: "Месяц 6", pnl: 28 },
];

const steps = [
  "Подключите OKX API",
  "Настройте корзины и пороги",
  "Запустите бота",
  "Получайте результат",
];

export function LandingContent() {
  const [deposit, setDeposit] = useState(5000);
  const [monthlyPct, setMonthlyPct] = useState(3);
  const months = 12;
  const projected = Array.from({ length: months }, (_, i) => {
    const val = deposit * Math.pow(1 + monthlyPct / 100, i + 1);
    return { m: `${i + 1}`, val: Math.round(val) };
  });

  const contentWidth = "max-w-4xl mx-auto px-6";

  return (
    <div className="space-y-24 pb-24">
      {/* Stats bar */}
      <section className={`py-16 ${contentWidth}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)]"
            >
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{value}</div>
              <div className="text-sm text-[var(--muted)] mt-1">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={contentWidth}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Почему <span className="text-[var(--accent)]">PairTrading</span>?
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]/80 hover:border-[var(--accent)]/40 transition"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-[var(--muted)] text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Calculator */}
      <section className={contentWidth}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]"
        >
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-6 h-6 text-[var(--accent)]" />
            <h2 className="text-2xl font-bold">Сколько можно заработать?</h2>
          </div>
          <p className="text-[var(--muted)] text-sm mb-6">
            Примерный расчёт при реинвестировании. Результат зависит от настроек и рыночных условий.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-sm text-[var(--muted)]">Депозит (USDT)</label>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value))}
                className="w-full mt-1 accent-[var(--accent)]"
              />
              <div className="text-xl font-semibold mt-1">${deposit.toLocaleString()}</div>
            </div>
            <div>
              <label className="text-sm text-[var(--muted)]">Средняя доходность в месяц (%)</label>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={monthlyPct}
                onChange={(e) => setMonthlyPct(Number(e.target.value))}
                className="w-full mt-1 accent-[var(--accent)]"
              />
              <div className="text-xl font-semibold mt-1">{monthlyPct}%</div>
            </div>
          </div>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projected}>
                <defs>
                  <linearGradient id="areaCalcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Баланс"]}
                  contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="val" stroke="#06b6d4" strokeWidth={2} fill="url(#areaCalcGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
            <span className="text-[var(--muted)]">Через 12 месяцев:</span>
            <span className="text-2xl font-bold text-[var(--accent)]">
              ${projected[11]?.val.toLocaleString() ?? 0}
            </span>
          </div>
        </motion.div>
      </section>

      {/* Growth chart infographic */}
      <section className={contentWidth}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-[var(--accent)]" />
            <h2 className="text-2xl font-bold">Пример роста портфеля</h2>
          </div>
          <p className="text-[var(--muted)] text-sm mb-6">
            Условная кривая накопления при консервативной стратегии (~0.5% средний PnL на сделку, 2–3 сделки в неделю).
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="50%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v) => `+${v}%`} />
                <Tooltip
                  formatter={(v: number) => [`+${v}%`, "Накопленный PnL"]}
                  contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={2.5} fill="url(#growthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      {/* How it works infographic */}
      <section className={contentWidth}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-center mb-12"
        >
          Запуск за 4 шага
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]/80"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] font-bold text-lg mb-3">
                {i + 1}
              </div>
              <p className="font-medium">{step}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[var(--accent)]/30" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison: manual vs bot */}
      <section className={contentWidth}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]/50">
            <h3 className="text-lg font-semibold mb-4 text-[var(--muted)]">Ручная торговля</h3>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {["Нужно следить 24/7", "Эмоции влияют на решения", "Легко пропустить вход", "Сложно масштабировать"].map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="text-[var(--negative)]">×</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent)]/5">
            <h3 className="text-lg font-semibold mb-4 text-[var(--accent)]">PairTrading бот</h3>
            <ul className="space-y-2 text-sm">
              {["Работает автоматически", "Чёткие правила без эмоций", "Не пропускает сигналы", "Одновременно 10 пар"].map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--positive)] flex-shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className={`${contentWidth} text-center`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex flex-col items-center p-10 rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-b from-[var(--accent)]/10 to-transparent"
        >
          <h2 className="text-2xl font-bold mb-2">Готовы начать?</h2>
          <p className="text-[var(--muted)] text-sm mb-6">Подключите OKX и запустите бота за несколько минут</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
          >
            Войти в панель
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

"use client";

import { LandingHeader } from "@/components/LandingHeader";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Подключите OKX",
    desc: "В настройках добавьте API-ключи от демо или реального аккаунта OKX. Не забудьте указать IP в whitelist.",
  },
  {
    title: "Настройте корзины",
    desc: "Выберите пары инструментов (например, BTC vs ETH, BNB vs XRP). Бот будет торговать спред между ними.",
  },
  {
    title: "Задайте параметры",
    desc: "Порог входа (%), тейк-профит, стоп-лосс, размер позиции и плечо — всё настраивается под вашу стратегию.",
  },
  {
    title: "Запустите бота",
    desc: "Нажмите «Старт» на дашборде. Бот подключится к OKX, начнёт получать котировки и входить в сделки по вашим правилам.",
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
          Гайд по платформе
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[var(--muted)] mb-12"
        >
          Краткая инструкция для быстрого старта
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

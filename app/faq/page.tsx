"use client";

import { useState } from "react";
import { LandingHeader } from "@/components/LandingHeader";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Что такое pair trading?",
    a: "Pair trading — стратегия, при которой открываются две связанные позиции (long по одному инструменту, short по другому). Доходность идёт от сходимости или расхождения спреда между ними, а не от общего движения рынка.",
  },
  {
    q: "Нужен ли реальный счёт OKX?",
    a: "Можно использовать демо-счёт OKX — бот поддерживает режим демо. Для реальной торговли потребуется реальный счёт и API-ключи с правами на торговлю.",
  },
  {
    q: "Почему позиция не закрывается?",
    a: "Иногда биржа не исполняет рыночный ордер сразу (низкая ликвидность, технические ограничения). Попробуйте закрыть вручную через OKX с типом «Market» и флагом «Reduce Only». Убедитесь, что IP добавлен в whitelist API-ключа.",
  },
  {
    q: "Как настроить тейк-профит и стоп-лосс?",
    a: "В разделе «Настройки» задайте процент для тейк-профита (при какой прибыли закрывать) и стоп-лосса (при каком убытке). Можно отключить стоп-лосс, если используете только ручное управление.",
  },
  {
    q: "Бот открыл только часть позиций — почему?",
    a: "Раньше это могло быть из-за того, что не все котировки успевали прийти до входа. Сейчас бот использует reference prices как fallback, и должен открывать все 10 позиций (5 long + 5 short) при корректном балансе.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <LandingHeader />
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Частые вопросы</h1>
        <p className="text-[var(--muted)] mb-12">Ответы на типичные вопросы о платформе</p>

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

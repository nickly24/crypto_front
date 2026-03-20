import type { TourStep } from "@/components/GuideTour";

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: "balance",
    target: "tour-balance",
    title: "Balance",
    description: "Your OKX account balance in USDT. PnL Long/Short/Total shows unrealized profit when a position is open.",
  },
  {
    id: "spread",
    target: "tour-spread",
    title: "Spread (live)",
    description: "Real-time spread between your trading baskets. The bot enters when spread crosses entry level and exits at take profit or stop loss.",
  },
  {
    id: "bot-status",
    target: "tour-bot-status",
    title: "Bot control",
    description: "Start or stop the trading bot. When running, it monitors the spread and opens/closes positions automatically.",
  },
  {
    id: "position",
    target: "tour-position",
    title: "Current position",
    description: "Shows your open position: long basket vs short basket, PnL, and position breakdown. Close position manually if needed.",
  },
  {
    id: "trades",
    target: "tour-trades",
    title: "Recent trades",
    description: "History of closed trades. Click a row to expand and see position details per instrument.",
  },
];

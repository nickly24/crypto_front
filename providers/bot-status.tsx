"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth";

const WS_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type BotStatusData = {
  alive?: boolean;
  db_state?: {
    actual_state?: string;
    current_spread_pct?: number | string | null;
    balance_usdt?: number | string | null;
    available_usdt?: number | string | null;
    pnl_total_pct?: number | string;
    pnl_long_pct?: number | string;
    pnl_short_pct?: number | string;
    pnl_total_usdt?: number | string | null;
    position_open?: number;
    long_basket?: string | null;
    short_basket?: string | null;
    buy_basket?: string | null;
    sell_basket?: string | null;
    positions_data?: string | Record<string, unknown> | null;
    entry_spread_pct?: number | string | null;
    connection_status?: string;
    quotes_snapshot?: string;
    reference_prices?: string | null;
    updated_at?: string;
    okx_ping_ms?: number;
    dca_count_current?: number;
  };
  pid?: number;
  uptime_seconds?: number;
  user_id?: number;
};

const BotStatusContext = createContext<{
  status: BotStatusData | null;
  connected: boolean;
  refresh: () => void;
}>({
  status: null,
  connected: false,
  refresh: () => {},
});

export function BotStatusProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<BotStatusData | null>(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const refresh = useCallback(() => {
    if (socket?.connected) {
      socket.emit("auth", { token: typeof window !== "undefined" ? localStorage.getItem("access_token") : null });
    }
  }, [socket]);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const s = io(WS_URL, { transports: ["websocket", "polling"], autoConnect: true });
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
      s.emit("auth", { token });
    });

    s.on("disconnect", () => setConnected(false));
    s.on("status", (data: BotStatusData) => setStatus(data));
    s.on("authenticated", () => {
      // initial status sent right after auth
    });
    s.on("error", (err: { message?: string }) => {
      console.warn("Bot status socket error:", err?.message);
    });

    return () => {
      s.disconnect();
      setSocket(null);
      setConnected(false);
      setStatus(null);
    };
  }, [user]);

  return (
    <BotStatusContext.Provider value={{ status, connected, refresh }}>
      {children}
    </BotStatusContext.Provider>
  );
}

export const useBotStatus = () => useContext(BotStatusContext);

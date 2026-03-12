const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nickly24-crypto-back-67f1.twc1.net";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export async function api<T>(
  path: string,
  options?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json.error || res.statusText };
    }
    return { ok: true, data: json.data ?? json };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function login(email: string, password: string) {
  return api<{ access_token: string; user: { id: number; email: string; role: string } }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
}

export async function me() {
  return api<{ id: number; email: string; role: string }>("/api/auth/me");
}

export async function botStatus() {
  return api<{
    alive: boolean;
    db_state: {
      actual_state: string;
      connection_status: string;
      current_spread_pct: number | null;
      quotes_snapshot: string;
      reference_prices: string | null;
      balance_usdt: number | null;
      available_usdt: number | null;
      pnl_long_pct: number;
      pnl_short_pct: number;
      pnl_total_pct: number;
      position_open: number;
      long_basket: string | null;
      short_basket: string | null;
      updated_at: string;
      okx_ping_ms: number;
    };
    pid: number;
    uptime_seconds: number;
    user_id: number;
  }>("/api/bot/status");
}

export async function botStart() {
  return api<{ status: string; alive: boolean }>("/api/bot/start", { method: "POST" });
}

export async function botStop() {
  return api<{ status: string; alive: boolean }>("/api/bot/stop", { method: "POST" });
}

export async function botClosePosition() {
  return api<{
    status: string;
    position_closed: boolean;
    trade?: { id: number; pnl_pct: number; reason: string };
  }>("/api/bot/close-position", { method: "POST" });
}

export async function botLogs(limit = 50) {
  return api<Array<{ id: number; level: string; message: string; created_at: string }>>(
    `/api/bot/logs?limit=${limit}`
  );
}

export async function analyticsSummary() {
  return api<{
    trades_count: number;
    winrate_pct: number;
    pnl_total_pct: number;
    pnl_total_usdt: number;
    avg_trade_pct: number;
  }>("/api/analytics/summary");
}

export async function analyticsTrades(limit = 50) {
  return api<{
    trades: Array<{
      id: number;
      opened_at: string | null;
      closed_at: string | null;
      duration_sec: number;
      entry_spread_pct: number;
      exit_spread_pct: number;
      pnl_pct: number;
      pnl_usdt: number;
      long_basket: string | null;
      short_basket: string | null;
      reason: string | null;
    }>;
  }>(`/api/analytics/trades?limit=${limit}`);
}

export async function getOkxKeys() {
  return api<{ masked_api_key: string | null; has_secret: boolean; has_passphrase: boolean }>(
    "/api/profile/okx-keys"
  );
}

export async function saveOkxKeys(data: {
  api_key?: string;
  secret_key?: string;
  passphrase?: string;
}) {
  return api("/api/profile/okx-keys", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export type BotConfigData = {
  baskets: Array<{ basket1: string; basket2: string }>;
  params: Record<string, number | boolean>;
  modes: Record<string, boolean>;
  error_handling?: Record<string, string | number | boolean>;
};

export async function getBotConfig() {
  return api<BotConfigData>("/api/bot/config");
}

export async function updateBotConfig(body: {
  baskets?: Array<{ basket1: string; basket2: string }>;
  params?: Record<string, number | boolean>;
  modes?: Record<string, boolean>;
  error_handling?: Record<string, string | number | boolean>;
}) {
  return api("/api/bot/config", { method: "PUT", body: JSON.stringify(body) });
}

export async function resetBotConfig() {
  return api("/api/bot/config/reset", { method: "POST" });
}

export async function getInstruments() {
  return api<{ instruments: string[] }>("/api/instruments");
}

export async function getChartSpread(hours = 10, minutes?: number) {
  const q = minutes != null ? `minutes=${minutes}` : `hours=${hours}`;
  return api<{ points: Array<{ ts: string; spread_pct: number; r_basket1_pct: number; r_basket2_pct: number }> }>(
    `/api/chart/spread?${q}`
  );
}

export async function getChartInstruments(hours = 10) {
  return api<{ points: Array<{ ts: string; inst_id: string; price: number }>; instruments: string[] }>(
    `/api/chart/instruments?hours=${hours}`
  );
}

export async function getChartCandles(instId: string, bar = "1m", limit = 300) {
  return api<{ candles: Array<{ ts: number; o: number; h: number; l: number; c: number; v: number }> }>(
    `/api/chart/candles?instId=${encodeURIComponent(instId)}&bar=${bar}&limit=${limit}`
  );
}

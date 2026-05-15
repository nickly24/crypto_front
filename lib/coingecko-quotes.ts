/**
 * CoinGecko Demo API — обычно отдаёт CORS из браузера.
 * @see https://docs.coingecko.com/reference/simple-price
 */

export const COINGECKO_SIMPLE_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price";

export type QuoteRowDef = {
  readonly label: string;
  /** Для CryptoIcon (как раньше: BTCUSDT и т.д.). */
  readonly iconSymbol: string;
  readonly coingeckoId: string;
};

export const HEADER_QUOTE_ROWS: readonly QuoteRowDef[] = [
  { label: "BTC", iconSymbol: "BTCUSDT", coingeckoId: "bitcoin" },
  { label: "ETH", iconSymbol: "ETHUSDT", coingeckoId: "ethereum" },
  { label: "USDT", iconSymbol: "USDT", coingeckoId: "tether" },
];

export const TRADE_CONTROL_QUOTE_ROWS: readonly QuoteRowDef[] = [
  { label: "BTC", iconSymbol: "BTCUSDT", coingeckoId: "bitcoin" },
  { label: "ETH", iconSymbol: "ETHUSDT", coingeckoId: "ethereum" },
  { label: "BNB", iconSymbol: "BNBUSDT", coingeckoId: "binancecoin" },
  { label: "SOL", iconSymbol: "SOLUSDT", coingeckoId: "solana" },
  { label: "XRP", iconSymbol: "XRPUSDT", coingeckoId: "ripple" },
  { label: "DOGE", iconSymbol: "DOGEUSDT", coingeckoId: "dogecoin" },
  { label: "ADA", iconSymbol: "ADAUSDT", coingeckoId: "cardano" },
  { label: "TRX", iconSymbol: "TRXUSDT", coingeckoId: "tron" },
  { label: "AVAX", iconSymbol: "AVAXUSDT", coingeckoId: "avalanche-2" },
  { label: "DOT", iconSymbol: "DOTUSDT", coingeckoId: "polkadot" },
  { label: "LINK", iconSymbol: "LINKUSDT", coingeckoId: "chainlink" },
  { label: "LTC", iconSymbol: "LTCUSDT", coingeckoId: "litecoin" },
  { label: "UNI", iconSymbol: "UNIUSDT", coingeckoId: "uniswap" },
  { label: "ATOM", iconSymbol: "ATOMUSDT", coingeckoId: "cosmos" },
  { label: "NEAR", iconSymbol: "NEARUSDT", coingeckoId: "near" },
  { label: "APT", iconSymbol: "APTUSDT", coingeckoId: "aptos" },
  { label: "OP", iconSymbol: "OPUSDT", coingeckoId: "optimism" },
  { label: "ARB", iconSymbol: "ARBUSDT", coingeckoId: "arbitrum" },
  { label: "SUI", iconSymbol: "SUIUSDT", coingeckoId: "sui" },
  { label: "INJ", iconSymbol: "INJUSDT", coingeckoId: "injective-protocol" },
];

export type CoingeckoSimpleQuote = {
  usd: number;
  eur?: number;
  rub?: number;
};

export async function fetchCoingeckoSimpleUsdEurRub(
  ids: readonly string[]
): Promise<Record<string, CoingeckoSimpleQuote> | null> {
  if (ids.length === 0) return null;
  const url = `${COINGECKO_SIMPLE_PRICE_URL}?ids=${encodeURIComponent(ids.join(","))}&vs_currencies=usd,eur,rub`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const raw = (await res.json()) as Record<string, Record<string, number> | undefined>;
  const out: Record<string, CoingeckoSimpleQuote> = {};
  for (const id of ids) {
    const row = raw[id];
    if (!row || typeof row.usd !== "number" || Number.isNaN(row.usd)) continue;
    out[id] = {
      usd: row.usd,
      eur: typeof row.eur === "number" && !Number.isNaN(row.eur) ? row.eur : undefined,
      rub: typeof row.rub === "number" && !Number.isNaN(row.rub) ? row.rub : undefined,
    };
  }
  return Object.keys(out).length ? out : null;
}

/** Цена в шапке (компактно, USDT ≈ $1). */
export function formatCompactUsdPrice(price: number, coingeckoId: string): string {
  if (coingeckoId === "tether") return price.toFixed(4);
  if (price >= 1000) return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}

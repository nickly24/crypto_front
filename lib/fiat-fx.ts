/** Курсы: сколько EUR и RUB за 1 USD (для пересчёта цены USDT). */

export type UsdFiatRatesReadout = {
  eurPerUsd: number;
  rubPerUsd: number;
};

function parseRatesJson(j: Record<string, unknown>): UsdFiatRatesReadout | null {
  const rates = (j.rates ?? j.conversion_rates) as Record<string, number> | undefined;
  if (!rates || typeof rates.EUR !== "number" || typeof rates.RUB !== "number") return null;
  if (!Number.isFinite(rates.EUR) || !Number.isFinite(rates.RUB)) return null;
  return { eurPerUsd: rates.EUR, rubPerUsd: rates.RUB };
}

export async function fetchUsdFiatRates(): Promise<UsdFiatRatesReadout | null> {
  const urls = [
    "https://api.exchangerate-api.com/v4/latest/USD",
    "https://open.er-api.com/v6/latest/USD",
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const j = (await res.json()) as Record<string, unknown>;
      const parsed = parseRatesJson(j);
      if (parsed) return parsed;
    } catch {
      /* try next */
    }
  }
  return null;
}

export function formatUsdAmount(usd: number, compact = false): string {
  if (usd >= 1_000_000) return usd.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (usd >= 1000)
    return usd.toLocaleString("en-US", { maximumFractionDigits: compact ? 0 : 2 });
  if (usd >= 1) return usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (usd >= 0.01) return usd.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return usd.toLocaleString("en-US", { maximumSignificantDigits: 4 });
}

export function formatEurAmount(eur: number): string {
  if (eur >= 1000) return eur.toLocaleString("de-DE", { maximumFractionDigits: 0 });
  if (eur >= 1) return eur.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return eur.toLocaleString("de-DE", { maximumSignificantDigits: 4 });
}

export function formatRubAmount(rub: number): string {
  if (rub >= 1_000_000) return rub.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
  if (rub >= 1000) return rub.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
  if (rub >= 1) return rub.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return rub.toLocaleString("ru-RU", { maximumSignificantDigits: 4 });
}

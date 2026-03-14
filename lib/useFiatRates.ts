"use client";

import { useEffect, useState } from "react";

const RATES_API = "https://api.exchangerate-api.com/v4/latest/USD";

export type FiatRates = {
  EUR: number;
  RUB: number;
};

export function useFiatRates(): FiatRates | null {
  const [rates, setRates] = useState<FiatRates | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(RATES_API)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const r = data?.rates;
        if (r?.EUR != null && r?.RUB != null) {
          setRates({ EUR: r.EUR, RUB: r.RUB });
        }
      })
      .catch(() => {});

    const interval = setInterval(() => {
      fetch(RATES_API)
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          const r = data?.rates;
          if (r?.EUR != null && r?.RUB != null) {
            setRates({ EUR: r.EUR, RUB: r.RUB });
          }
        })
        .catch(() => {});
    }, 60000); // обновлять раз в минуту

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return rates;
}

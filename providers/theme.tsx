"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { THEME_PRESETS, type ThemePresetId, getPresetColors } from "@/lib/theme-presets";

export type BaseTheme = "light" | "dark";

export type CustomColors = {
  accent?: string;
  positive?: string;
  negative?: string;
};

export type AppearanceState = {
  baseTheme: BaseTheme;
  presetId: ThemePresetId;
  customAccent: string | null;
  customColors: CustomColors | null;
};

export type ThemeContextValue = {
  theme: BaseTheme;
  setTheme: (t: BaseTheme) => void;
  toggleTheme: () => void;
  appearance: AppearanceState;
  setAppearance: (a: Partial<AppearanceState>) => void;
  accentColor: string;
  positiveColor: string;
  negativeColor: string;
};

const STORAGE_THEME = "pairtrading-theme";
const STORAGE_APPEARANCE = "pairtrading-appearance";

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  appearance: { baseTheme: "dark", presetId: "green-lime", customAccent: null, customColors: null },
  setAppearance: () => {},
  accentColor: "#9ddb00",
  positiveColor: "#9ddb00",
  negativeColor: "#db7500",
});

function loadAppearance(): AppearanceState {
  if (typeof window === "undefined")
    return { baseTheme: "dark", presetId: "green-lime", customAccent: null, customColors: null };
  try {
    const raw = localStorage.getItem(STORAGE_APPEARANCE);
    const legacyTheme = localStorage.getItem(STORAGE_THEME) as BaseTheme | null;
    const defaultState: AppearanceState = {
      baseTheme: legacyTheme === "light" || legacyTheme === "dark" ? legacyTheme : "dark",
      presetId: "green-lime",
      customAccent: null,
      customColors: null,
    };
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AppearanceState>;
    return {
      baseTheme: parsed.baseTheme === "light" ? "light" : "dark",
      presetId: (THEME_PRESETS.some((p) => p.id === parsed.presetId) || parsed.presetId === "custom" ? parsed.presetId : "green-lime") as ThemePresetId,
      customAccent: parsed.customAccent ?? null,
      customColors: parsed.customColors ?? null,
    };
  } catch {
    return { baseTheme: "dark", presetId: "green-lime", customAccent: null, customColors: null };
  }
}

function resolveColors(appearance: AppearanceState): { accent: string; positive: string; negative: string } {
  let accent = "#9ddb00";
  let positive = "#9ddb00";
  let negative = "#dc2626";
  if (appearance.presetId === "custom" && appearance.customAccent) {
    accent = appearance.customAccent;
    positive = appearance.customAccent;
    negative = "#dc2626";
  } else {
    const preset = THEME_PRESETS.find((p) => p.id === appearance.presetId) ?? THEME_PRESETS[0];
    const c = getPresetColors(preset);
    accent = c.accent;
    positive = c.positive;
    negative = c.negative;
  }
  const cc = appearance.customColors;
  if (cc) {
    if (cc.accent != null) accent = cc.accent;
    if (cc.positive != null) positive = cc.positive;
    if (cc.negative != null) negative = cc.negative;
  }
  return { accent, positive, negative };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return { h: 0, s: 0, l };

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;

  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
      break;
  }

  h *= 60;
  return { h, s, l };
}

function buildBrandMarkFilter(accentHex: string): string {
  const normalizedAccent = accentHex.toLowerCase();
  if (normalizedAccent === "#9ddb00") return "none";

  const source = hexToHsl("#9ddb00");
  const target = hexToHsl(normalizedAccent);
  if (!source || !target) return "none";

  const hueRotate = Math.round(target.h - source.h);
  const saturation = (0.9 + target.s * 0.85).toFixed(2);
  const brightness = (0.82 + target.l * 0.42).toFixed(2);

  return `hue-rotate(${hueRotate}deg) saturate(${saturation}) brightness(${brightness}) contrast(1.04)`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearanceState] = useState<AppearanceState>(() => {
    const initial = loadAppearance();
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(STORAGE_THEME) as BaseTheme | null;
      if (storedTheme === "light" || storedTheme === "dark") {
        initial.baseTheme = storedTheme;
      } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        initial.baseTheme = "light";
      }
    }
    return initial;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", appearance.baseTheme);
    localStorage.setItem(STORAGE_THEME, appearance.baseTheme);
    localStorage.setItem(STORAGE_APPEARANCE, JSON.stringify(appearance));
  }, [appearance]);

  const colors = resolveColors(appearance);

  useEffect(() => {
    const root = document.documentElement;
    const accentRgba = (hex: string, a: number) => {
      const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      if (!m) return hex;
      return `rgba(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}, ${a})`;
    };
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--accent-dim", accentRgba(colors.accent, 0.5));
    root.style.setProperty("--positive", colors.positive);
    root.style.setProperty("--negative", colors.negative);
    root.style.setProperty("--sidebar-active-bg", accentRgba(colors.accent, 0.12));
    root.style.setProperty("--sidebar-active-text", colors.accent);
    root.style.setProperty("--brand-mark-filter", buildBrandMarkFilter(colors.accent));
  }, [colors]);

  const setTheme = useCallback((t: BaseTheme) => {
    setAppearanceState((a) => ({ ...a, baseTheme: t }));
  }, []);

  const toggleTheme = useCallback(() => {
    setAppearanceState((a) => ({ ...a, baseTheme: a.baseTheme === "light" ? "dark" : "light" }));
  }, []);

  const setAppearance = useCallback((patch: Partial<AppearanceState>) => {
    setAppearanceState((a) => ({ ...a, ...patch }));
  }, []);

  const value: ThemeContextValue = {
    theme: appearance.baseTheme,
    setTheme,
    toggleTheme,
    appearance,
    setAppearance,
    accentColor: colors.accent,
    positiveColor: colors.positive,
    negativeColor: colors.negative,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

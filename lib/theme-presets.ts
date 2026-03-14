export type ThemePresetId = "green-lime" | "orange-mechanic" | "purple-disco" | "blue-powder" | "cyan-flow" | "rose" | "custom";

/** Большая палитра для выбора цвета (без нативного color picker) */
export const COLOR_PALETTE: string[] = [
  "#9ddb00", "#7ab800", "#b8e64c", "#6b8e23", "#adff2f", "#32cd32", "#22c55e", "#16a34a", "#15803d", "#166534",
  "#3b82f6", "#2563eb", "#1d4ed8", "#60a5fa", "#93c5fd", "#0ea5e9", "#06b6d4", "#0891b2", "#0e7490", "#155e75",
  "#a855f7", "#9333ea", "#7c3aed", "#6d28d9", "#c084fc", "#8b5cf6", "#6366f1", "#4f46e5", "#4338ca", "#3730a3",
  "#f43f5e", "#ec4899", "#e11d48", "#be185d", "#f472b6", "#db2777", "#dc2626", "#ef4444", "#f87171", "#b91c1c",
  "#f59e0b", "#f97316", "#ea580c", "#c2410c", "#fb923c", "#fbbf24", "#eab308", "#ca8a04", "#a16207", "#854d0e",
  "#64748b", "#94a3b8", "#475569", "#334155", "#1e293b", "#0f172a", "#71717a", "#52525b", "#3f3f46", "#27272a",
  "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155", "#1e293b",
  "#0f172a", "#020617", "#18181b", "#27272a", "#3f3f46", "#52525b", "#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7",
];

export type ThemePreset = {
  id: ThemePresetId;
  name: string;
  accent: string;
  positive: string;
  negative: string;
};

/**
 * Палитры: accent = основной цвет (лого, кнопки, плюсы).
 * positive = accent (весь «зелёный» перекрашивается в accent).
 * negative = контрастный цвет в той же теме для минусов/стопов.
 */
export const THEME_PRESETS: ThemePreset[] = [
  { id: "green-lime", name: "Green Lime", accent: "#9ddb00", positive: "#9ddb00", negative: "#c2410c" },
  { id: "orange-mechanic", name: "Orange Mechanic", accent: "#f59e0b", positive: "#f59e0b", negative: "#dc2626" },
  { id: "purple-disco", name: "Purple Disco", accent: "#a855f7", positive: "#a855f7", negative: "#ec4899" },
  { id: "blue-powder", name: "Blue Powder", accent: "#3b82f6", positive: "#3b82f6", negative: "#ea580c" },
  { id: "cyan-flow", name: "Cyan Flow", accent: "#06b6d4", positive: "#06b6d4", negative: "#f97316" },
  { id: "rose", name: "Rose", accent: "#f43f5e", positive: "#f43f5e", negative: "#7c3aed" },
];

export function hexToRgba(hex: string, alpha: number): string {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getPresetColors(preset: ThemePreset) {
  return {
    accent: preset.accent,
    accentDim: hexToRgba(preset.accent, 0.5),
    positive: preset.accent, // весь «зелёный» = accent
    negative: preset.negative,
    sidebarActiveBg: hexToRgba(preset.accent, 0.12),
  };
}

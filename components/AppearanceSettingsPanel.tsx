"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Palette, TrendingUp, TrendingDown } from "lucide-react";
import { useTheme } from "@/providers/theme";
import { THEME_PRESETS, type ThemePresetId } from "@/lib/theme-presets";
import { ColorPaletteGrid } from "@/components/ColorPaletteGrid";

function ThemeMockup({
  bg,
  cardBg,
  accent,
  negative,
}: {
  bg: string;
  cardBg: string;
  accent: string;
  negative: string;
}) {
  return (
    <div
      className="w-full aspect-[4/3] min-h-[100px] rounded-xl overflow-hidden flex gap-2 p-2.5"
      style={{ backgroundColor: bg }}
    >
      <div className="w-1/4 shrink-0 flex flex-col gap-1.5 pt-2">
        <div className="h-2.5 rounded-md" style={{ width: "85%", backgroundColor: accent }} />
        <div className="h-2 rounded-md opacity-60" style={{ width: "65%", backgroundColor: cardBg }} />
        <div className="h-2 rounded-md opacity-60" style={{ width: "75%", backgroundColor: cardBg }} />
        <div className="h-2 rounded-md opacity-60" style={{ width: "55%", backgroundColor: cardBg }} />
      </div>
      <div className="flex-1 flex flex-col gap-2 pt-2">
        <div className="flex gap-2">
          <div className="h-2.5 rounded-md flex-1" style={{ backgroundColor: cardBg }} />
          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
        </div>
        <div className="flex-1 rounded-lg flex flex-col gap-1.5 p-2" style={{ backgroundColor: cardBg }}>
          <div className="h-2 rounded-md w-4/5" style={{ backgroundColor: `${accent}50` }} />
          <div className="h-1.5 rounded w-full opacity-50" style={{ backgroundColor: cardBg }} />
          <div className="h-2 rounded-md w-3/4" style={{ backgroundColor: accent }} />
          <div className="h-2 rounded-md w-1/2" style={{ backgroundColor: negative }} />
        </div>
      </div>
    </div>
  );
}

export function AppearanceSettingsPanel() {
  const { theme, setTheme, appearance, setAppearance } = useTheme();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const currentPreset = THEME_PRESETS.find((p) => p.id === appearance.presetId);
  const baseColors = currentPreset
    ? { accent: currentPreset.accent, positive: currentPreset.accent, negative: currentPreset.negative }
    : { accent: "#9ddb00", positive: "#9ddb00", negative: "#dc2626" };
  const effectiveAccent = appearance.customColors?.accent ?? (appearance.customAccent ?? baseColors.accent);
  const effectivePositive = appearance.customColors?.positive ?? baseColors.positive;
  const effectiveNegative = appearance.customColors?.negative ?? baseColors.negative;

  function handleSelectPreset(id: ThemePresetId) {
    const preset = THEME_PRESETS.find((p) => p.id === id);
    setAppearance({
      presetId: id,
      customAccent: id === "custom" ? effectiveAccent : null,
      customColors: null,
    });
  }

  function setCustomColor(field: "accent" | "positive" | "negative", hex: string) {
    setAppearance({
      customColors: {
        ...appearance.customColors,
        [field]: hex,
      },
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div>
            <h3 className="text-base font-medium text-[var(--foreground)] mb-2">Interface</h3>
            <p className="text-sm text-[var(--muted)] mb-3">Light or dark mode</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition border ${
                  theme === "dark"
                    ? "bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/40"
                    : "bg-[var(--background)]/50 border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--muted)]"
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition border ${
                  theme === "light"
                    ? "bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/40"
                    : "bg-[var(--background)]/50 border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--muted)]"
                }`}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <h3 className="text-base font-medium text-[var(--foreground)] mb-2">Color presets</h3>
          <p className="text-sm text-[var(--muted)] mb-4">Accent and chart colors</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {THEME_PRESETS.map((preset) => {
              const isSelected = appearance.presetId === preset.id;
              const darkBg = theme === "dark" ? "#1e2120" : "#f8fafc";
              const cardBg = theme === "dark" ? "#262a29" : "#ffffff";
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id as ThemePresetId)}
                  className={`relative p-4 rounded-xl border-2 transition text-left ${
                    isSelected
                      ? "border-[var(--accent)] shadow-[0_0_0_2px_var(--accent)]"
                      : "border-[var(--card-border)] hover:border-[var(--muted)]"
                  }`}
                >
                  <ThemeMockup bg={darkBg} cardBg={cardBg} accent={preset.accent} negative={preset.negative} />
                  <span className="text-sm font-medium text-[var(--foreground)] truncate block mt-3">{preset.name}</span>
                  {isSelected && (
                    <span
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: preset.accent, color: "#000" }}
                    >
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--card-border)] pt-6">
        <button
          type="button"
          onClick={() => setDetailsOpen((o) => !o)}
          className="flex items-center justify-between w-full text-left py-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--accent)]/10">
              <Palette className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="text-base font-medium text-[var(--foreground)]">Customize colors</h3>
              <p className="text-sm text-[var(--muted)]">Accent, positive, negative — pick from palette</p>
            </div>
          </div>
          {detailsOpen ? <ChevronUp className="w-5 h-5 text-[var(--muted)] shrink-0" /> : <ChevronDown className="w-5 h-5 text-[var(--muted)] shrink-0" />}
        </button>
        <AnimatePresence>
          {detailsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-[var(--background)]/50 border border-[var(--card-border)]">
                  <div className="flex items-center gap-3 mb-4">
                    <Palette className="w-6 h-6 text-[var(--accent)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)]">Accent</p>
                      <p className="text-xs text-[var(--muted)]">Logo, buttons, links</p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-xl shrink-0 border-2 border-[var(--card-border)]"
                      style={{ backgroundColor: effectiveAccent }}
                    />
                  </div>
                  <ColorPaletteGrid value={effectiveAccent} onChange={(hex) => setCustomColor("accent", hex)} size="md" />
                </div>
                <div className="p-4 rounded-xl bg-[var(--background)]/50 border border-[var(--card-border)]">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 shrink-0" style={{ color: effectivePositive }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)]">Positive</p>
                      <p className="text-xs text-[var(--muted)]">Profits, growth, up</p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-xl shrink-0 border-2 border-[var(--card-border)]"
                      style={{ backgroundColor: effectivePositive }}
                    />
                  </div>
                  <ColorPaletteGrid value={effectivePositive} onChange={(hex) => setCustomColor("positive", hex)} size="md" />
                </div>
                <div className="p-4 rounded-xl bg-[var(--background)]/50 border border-[var(--card-border)]">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingDown className="w-6 h-6 shrink-0" style={{ color: effectiveNegative }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)]">Negative</p>
                      <p className="text-xs text-[var(--muted)]">Losses, stop, down</p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-xl shrink-0 border-2 border-[var(--card-border)]"
                      style={{ backgroundColor: effectiveNegative }}
                    />
                  </div>
                  <ColorPaletteGrid value={effectiveNegative} onChange={(hex) => setCustomColor("negative", hex)} size="md" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-[var(--muted)]">Changes apply immediately and are saved in this browser.</p>
    </div>
  );
}

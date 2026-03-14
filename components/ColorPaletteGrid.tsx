"use client";

import { COLOR_PALETTE } from "@/lib/theme-presets";

type Props = {
  value: string;
  onChange: (hex: string) => void;
  size?: "sm" | "md";
};

export function ColorPaletteGrid({ value, onChange, size = "md" }: Props) {
  const cell = size === "sm" ? "w-6 h-6" : "w-7 h-7";

  return (
    <div className="grid grid-cols-10 gap-1.5">
      {COLOR_PALETTE.map((hex, i) => {
        const isSelected = value.toLowerCase() === hex.toLowerCase();
        return (
          <button
            key={`${hex}-${i}`}
            type="button"
            onClick={() => onChange(hex)}
            className={`${cell} rounded-lg shrink-0 transition ring-offset-2 ring-offset-[var(--background)] ${
              isSelected ? "ring-2 ring-[var(--foreground)] scale-110" : "hover:scale-110"
            }`}
            style={{ backgroundColor: hex }}
            title={hex}
          />
        );
      })}
    </div>
  );
}

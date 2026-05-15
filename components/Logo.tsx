"use client";

import Image from "next/image";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function Logo({ className = "", showWordmark = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 shrink-0 ${className}`} aria-label="Lyrae Labs" role="img">
      <div className="relative aspect-square h-full overflow-hidden rounded-[0.85rem]">
        <Image
          src="/image-4.png"
          alt=""
          fill
          sizes="56px"
          className="object-cover"
          style={{ filter: "var(--brand-mark-filter)" }}
          priority
        />
      </div>
      {showWordmark && (
        <svg viewBox="0 0 182 82" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
          <text
            x="2"
            y="38"
            fill="var(--foreground)"
            fontFamily="'Avenir Next', 'Segoe UI', sans-serif"
            fontSize="34"
            fontWeight="600"
            letterSpacing="7"
          >
            LYRAE
          </text>
          <text
            x="4"
            y="66"
            fill="var(--accent)"
            fontFamily="'Avenir Next', 'Segoe UI', sans-serif"
            fontSize="16"
            fontWeight="600"
            letterSpacing="13"
          >
            LABS
          </text>
        </svg>
      )}
    </div>
  );
}

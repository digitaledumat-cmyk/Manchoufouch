"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { scoreTone } from "@/lib/seo/simulate-audit";

type ScoreRingProps = {
  score: number;
  label: string;
  size?: "sm" | "lg";
  animate?: boolean;
  className?: string;
};

const TONE_STROKE = {
  good: "stroke-emerald-600",
  average: "stroke-amber-500",
  poor: "stroke-rose-500",
} as const;

const TONE_TEXT = {
  good: "text-emerald-700",
  average: "text-amber-600",
  poor: "text-rose-600",
} as const;

export function ScoreRing({
  score,
  label,
  size = "sm",
  animate = true,
  className,
}: ScoreRingProps) {
  const [display, setDisplay] = useState(animate ? 0 : score);
  const tone = scoreTone(score);
  const radius = size === "lg" ? 54 : 40;
  const stroke = size === "lg" ? 8 : 6;
  const normalized = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalized;
  const progress = (display / 100) * circumference;
  const box = (radius + stroke) * 2;

  useEffect(() => {
    if (!animate) {
      setDisplay(score);
      return;
    }

    setDisplay(0);
    const start = performance.now();
    const duration = 1100;
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(score * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score, animate]);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "relative",
          size === "lg" ? "size-[140px]" : "size-[104px]",
        )}
      >
        <svg
          width={box}
          height={box}
          viewBox={`0 0 ${box} ${box}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={box / 2}
            cy={box / 2}
            r={normalized}
            fill="none"
            className="stroke-muted"
            strokeWidth={stroke}
          />
          <circle
            cx={box / 2}
            cy={box / 2}
            r={normalized}
            fill="none"
            className={cn(
              TONE_STROKE[tone],
              "transition-[stroke-dashoffset] duration-300",
            )}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-semibold tabular-nums leading-none",
              size === "lg" ? "text-4xl" : "text-2xl",
              TONE_TEXT[tone],
            )}
          >
            {display}
          </span>
          <span className="mt-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            / 100
          </span>
        </div>
      </div>
      <p className="text-center text-sm font-medium">{label}</p>
    </div>
  );
}

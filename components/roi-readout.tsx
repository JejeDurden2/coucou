"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";

import { hero } from "@/content/hero";

// The single hero count-up (design-system §6). The server renders the final
// value so no-JS and reduced-motion both read the true figure; with motion
// allowed, the counter re-runs from zero timed to land as the trace completes.
// Continuous value, so it writes to the DOM directly instead of useState (§6).

export function RoiReadout() {
  const reducedMotion = useReducedMotion();
  const figureRef = useRef<HTMLSpanElement>(null);
  const { label, value, prefix, suffix, caption } = hero.readout;

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure || reducedMotion) return;
    const controls = animate(0, value, {
      duration: 1.4,
      delay: 0.4,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: (v) => {
        figure.textContent = `${prefix}${Math.round(v)}${suffix}`;
      },
    });
    return () => {
      controls.stop();
      figure.textContent = `${prefix}${value}${suffix}`;
    };
  }, [reducedMotion, value, prefix, suffix]);

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-popover px-4 py-3.5 shadow-lg shadow-black/40">
      <span className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span
        ref={figureRef}
        className="font-display text-3xl leading-none font-bold tracking-[-0.02em] tabular-nums text-primary"
      >
        {prefix}
        {value}
        {suffix}
      </span>
      <span className="font-mono text-[0.625rem] text-foreground-dim">{caption}</span>
    </div>
  );
}

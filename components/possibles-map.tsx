"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { LogoMark } from "@/components/logo-mark";
import { hero } from "@/content/hero";

// « La carte des possibles » : a fixed 532x540 composition scaled to fit its
// column (ResizeObserver, transform-origin top center). A decorative SVG draws
// the coucou mark at the origin, faint rays and the six arrows; the six cards are real text (a ul)
// so screen readers get the content. The active card cycles once through the
// six (first switch after 1.3s, then every 2.6s), lighting its blue arrow +
// outline, and rests on the first: motion stays finite (design-system §6).
// Reduced motion: no cycle (card 0 stays lit) and entrance keyframes are gated
// off in globals.css.

// Geometry is presentation, not content: it lives here, next to the SVG.
// ORIGIN is where the rays fan out: the coucou mark's beak sits on it (x = beak
// tip), vertically centered on y, so the brand is the source of the possibles.
const ORIGIN = { x: 31, y: 270 };

// Origami mark size (px). Larger than a dot so it reads as the brand, not a
// floating blue blob. left/top place viewBox point (30.3, 16) — beak tip x,
// vertical center — exactly on ORIGIN, so the beak stays on the fan's axis
// whatever MARK_PX is (both offsets derive from it).
const MARK_PX = 44;

// Rays start this far (px) from ORIGIN along their own direction, leaving a
// clean ring around the beak: the fan reads as sourced from the mark, not
// piercing it. The head sits left of ORIGIN, the fan opens right, so this gap
// is pure breathing room, never overlapping the head.
const RAY_GAP = 14;

// Start point of a ray aimed at (x, y): ORIGIN pushed RAY_GAP px along the
// unit vector toward the target.
function rayStart(x: number, y: number): readonly [number, number] {
  const dx = x - ORIGIN.x;
  const dy = y - ORIGIN.y;
  const len = Math.hypot(dx, dy);
  return [ORIGIN.x + (dx / len) * RAY_GAP, ORIGIN.y + (dy / len) * RAY_GAP];
}

// Faint short rays, each ending in a tiny dot: [x, y, pathDelay, dotDelay].
const FAINT_RAYS: [number, number, number, number][] = [
  [120, 55, 0.7, 0.75],
  [215, 95, 0.76, 0.81],
  [140, 150, 0.82, 0.87],
  [240, 180, 0.88, 0.93],
  [110, 225, 0.94, 0.99],
  [250, 250, 1.0, 1.05],
  [122, 302, 1.06, 1.11],
  [245, 330, 1.12, 1.17],
  [135, 370, 1.18, 1.23],
  [220, 415, 1.24, 1.29],
  [115, 455, 1.3, 1.35],
  [235, 480, 1.36, 1.41],
  [160, 520, 1.42, 1.47],
  [90, 130, 1.48, 1.53],
];

// Arrow rays pointing at the six cards: [x, y, entranceDelay]. The dim arrow is
// always visible; the blue arrow (same geometry) fades in only when active.
const ARROW_RAYS: [number, number, number][] = [
  [288, 51, 0.45],
  [312, 139, 0.53],
  [288, 227, 0.61],
  [312, 315, 0.69],
  [288, 403, 0.77],
  [312, 491, 0.85],
];

// Card top-left positions and their entrance delays, index-aligned with mapItems.
const CARDS: [number, number, number][] = [
  [296, 12, 0.5],
  [320, 100, 0.58],
  [296, 188, 0.66],
  [320, 276, 0.74],
  [296, 364, 0.82],
  [320, 452, 0.9],
];

export function PossiblesMap() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();

  // Scale-to-fit: match the design’s _fit(), guarding the hidden (width 0) case.
  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const fit = () => setScale(Math.min(1, outer.clientWidth / 532) || 1);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  // Cycle the active card once through the six, then stop back on the first
  // (no infinite loop). Reduced motion keeps card 0 lit, no timers.
  useEffect(() => {
    if (reducedMotion) return;
    let ticks = 0;
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        ticks += 1;
        setActive(ticks % 6);
        if (ticks === 6) clearInterval(interval);
      }, 2600);
    }, 1300);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={outerRef}
      className="relative min-w-0"
      style={{ height: Math.round(540 * scale) }}
    >
      <div
        className="absolute top-0 left-1/2 h-135 w-133 origin-top"
        style={{ transform: `translateX(-50%) scale(${scale})` }}
      >
        <span className="absolute -top-3.5 left-0 font-mono text-[10px] tracking-[0.12em] text-foreground-dim uppercase">
          {hero.mapLabel}
        </span>

        <svg
          viewBox="0 0 532 540"
          width="100%"
          height="100%"
          aria-hidden
          className="absolute inset-0 overflow-visible"
        >
          <defs>
            <marker
              id="ccArrowDim"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path
                d="M1,1 L8,5 L1,9"
                className="fill-none stroke-foreground-dim/65"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </marker>
            <marker
              id="ccArrowBlue"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path
                d="M1,1 L8,5 L1,9"
                className="fill-none stroke-primary"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </marker>
          </defs>

          {FAINT_RAYS.map(([x, y, pathDelay, dotDelay]) => {
            const [sx, sy] = rayStart(x, y);
            return (
              <g key={`faint-${x}-${y}`}>
                <path
                  d={`M${sx},${sy} L${x},${y}`}
                  className="hero-fade fill-none stroke-foreground-dim/30"
                  strokeWidth="1"
                  style={{ animationDelay: `${pathDelay}s` }}
                />
                <circle
                  cx={x}
                  cy={y}
                  r="1.8"
                  className="hero-fade fill-foreground-dim/55"
                  style={{ animationDelay: `${dotDelay}s` }}
                />
              </g>
            );
          })}

          {ARROW_RAYS.map(([x, y, delay]) => {
            const [sx, sy] = rayStart(x, y);
            return (
              <path
                key={`dim-${x}-${y}`}
                d={`M${sx},${sy} L${x},${y}`}
                className="hero-fade fill-none stroke-foreground-dim/65"
                strokeWidth="1.2"
                markerEnd="url(#ccArrowDim)"
                style={{ animationDelay: `${delay}s` }}
              />
            );
          })}

          {ARROW_RAYS.map(([x, y], index) => {
            const [sx, sy] = rayStart(x, y);
            return (
              <path
                key={`blue-${x}-${y}`}
                d={`M${sx},${sy} L${x},${y}`}
                className="fill-none stroke-primary"
                strokeWidth="1.5"
                markerEnd="url(#ccArrowBlue)"
                style={{
                  opacity: active === index ? 1 : 0,
                  transition: "opacity 0.45s ease-out",
                }}
              />
            );
          })}
        </svg>

        {/* The source: the origami coucou head (LogoMark) sits on ORIGIN, not an anonymous blue dot. */}
        <LogoMark
          className="hero-fade absolute text-primary"
          style={{
            width: MARK_PX,
            height: MARK_PX,
            left: ORIGIN.x - 30.3 * (MARK_PX / 32),
            top: ORIGIN.y - 16 * (MARK_PX / 32),
            filter: "drop-shadow(0 2px 5px rgb(0 0 0 / 0.45))",
            animationDelay: "0.35s",
          }}
        />

        <ul aria-label={hero.mapLabel}>
          {hero.mapItems.map((item, index) => {
            const [left, top, delay] = CARDS[index];
            return (
              <li
                key={item.category}
                className="hero-in absolute flex h-19.5 w-53 flex-col justify-center gap-1.25 rounded-lg border border-border bg-popover px-3.5 py-2.5 shadow-[0_8px_24px_rgb(0_0_0/0.35)]"
                style={{ left, top, animationDelay: `${delay}s` }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-lg border border-primary transition-opacity duration-450"
                  style={{
                    opacity: active === index ? 1 : 0,
                    boxShadow:
                      "0 0 20px color-mix(in oklch, var(--primary) 25%, transparent)",
                  }}
                />
                <span className="flex items-center gap-1.75">
                  <span
                    aria-hidden
                    className="size-1.75 shrink-0 rounded-full border border-foreground-dim"
                  />
                  <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                    {item.category}
                  </span>
                </span>
                <span className="text-[13px] leading-snug font-medium">
                  {item.line}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

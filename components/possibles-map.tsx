"use client";

import { useEffect, useRef, useState } from "react";

import { hero } from "@/content/hero";

// « La carte des possibles » : a fixed 532x540 composition scaled to fit its
// column (ResizeObserver, transform-origin top center). A canvas draws the
// coucou head LARGE as an ordered-dither pixel field (Bayer 8x8): cells
// assemble from noise, a one-shot glitch shimmer passes, then dotted rays
// stipple from the beak to the six cards. The cards are real text (a ul) so
// screen readers get the content. Everything plays once (~2s) and stops on a
// static frame (design-system §6); the first card's outline rests lit.
// Reduced motion: the final frame is drawn once, entrance keyframes are gated
// off in globals.css, and a media-query flip either way is honored live.

// Geometry is presentation, not content: it lives here, next to the canvas.
// The head is the LogoMark's 32-unit geometry at scale 8 (256px), placed so
// its vertical center sits on the fan's axis; TIP is the beak tip, where the
// dotted rays start.
const HEAD = { x: 2, y: 142, scale: 8 };
const TIP = { x: HEAD.x + 30.3 * HEAD.scale, y: HEAD.y + 13.5 * HEAD.scale };

// Ray endpoints pointing at the six cards, index-aligned with mapItems.
const RAY_TARGETS: [number, number][] = [
  [288, 51],
  [312, 139],
  [288, 227],
  [312, 315],
  [288, 403],
  [312, 491],
];

// Card top-left positions and their entrance delays (synced to the dither
// timeline: head assembled ~1.0s, rays 1.0-1.55s), index-aligned with mapItems.
const CARDS: [number, number, number][] = [
  [296, 12, 1.15],
  [320, 100, 1.22],
  [296, 188, 1.29],
  [320, 276, 1.36],
  [296, 364, 1.43],
  [320, 452, 1.5],
];

// Bayer 8x8 ordered-dither matrix: cell arrival order for the assembly.
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
  14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55,
  23, 61, 29, 53, 21,
];

// The LogoMark's three facets (components/logo-mark.tsx geometry) as Path2D
// sources, drawn once on an offscreen canvas to sample which cells are "in".
const MARK_PATHS: [string, CanvasFillRule][] = [
  ["M12.25 6.3 L5.53 8.93 L2.6 16 L5.53 23.07 L12.25 25.7 Z", "nonzero"],
  [
    "M12.95 6.15V25.85L19.67 23.07L22.45 17.74L22.11 12.91L19.79 9.05ZM15.1 12.1a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0-4.2 0Z",
    "evenodd",
  ],
  ["M21.16 10.07 L30.3 13.5 L23.03 16.63 L22.72 12.72 Z", "nonzero"],
];

export function PossiblesMap() {
  const outerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(532 * dpr);
    canvas.height = Math.round(540 * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Resolve token -> "r,g,b" once via a probe canvas (flow-field idiom), so
    // the oklch tokens normalize to bytes we can compose an alpha onto.
    const tokens = getComputedStyle(canvas);
    const probe = document
      .createElement("canvas")
      .getContext("2d", { willReadFrequently: true });
    if (!probe) return;
    const bytes = (name: string) => {
      probe.fillStyle = "#000";
      probe.fillStyle = tokens.getPropertyValue(name).trim();
      probe.fillRect(0, 0, 1, 1);
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
      return `${r},${g},${b}`;
    };
    const blue = bytes("--primary");
    const coral = bytes("--accent-2");

    // Alpha map of the mark at scale 8: which 4px cells belong to the head.
    const off = document.createElement("canvas");
    off.width = 532;
    off.height = 540;
    const offCtx = off.getContext("2d", { willReadFrequently: true });
    if (!offCtx) return;
    offCtx.translate(HEAD.x, HEAD.y);
    offCtx.scale(HEAD.scale, HEAD.scale);
    for (const [d, rule] of MARK_PATHS) offCtx.fill(new Path2D(d), rule);
    const map = offCtx.getImageData(0, 0, 532, 540).data;

    const cells: {
      x: number;
      y: number;
      appear: number;
      alpha: number;
      warm: boolean;
    }[] = [];
    for (let gy = 140; gy < 400; gy += 4) {
      for (let gx = 0; gx < 264; gx += 4) {
        if (map[((gy + 2) * 532 + (gx + 2)) * 4 + 3] <= 120) continue;
        const m = BAYER[(Math.floor(gy / 4) % 8) * 8 + (Math.floor(gx / 4) % 8)];
        cells.push({
          x: gx,
          y: gy,
          appear: 0.2 + (m / 64) * 0.75 + Math.random() * 0.06,
          alpha: 0.55 + Math.random() * 0.35,
          warm: Math.random() < 0.05,
        });
      }
    }

    // Dotted rays from the beak tip to the six card anchors.
    const rayDots: { x: number; y: number; appear: number; end: boolean }[] =
      [];
    RAY_TARGETS.forEach(([tx, ty], index) => {
      const dx = tx - TIP.x;
      const dy = ty - TIP.y;
      const len = Math.hypot(dx, dy);
      for (let d = 24; d < len - 4; d += 9) {
        rayDots.push({
          x: TIP.x + (dx / len) * d,
          y: TIP.y + (dy / len) * d,
          appear: 1.0 + index * 0.07 + (d / len) * 0.25,
          end: false,
        });
      }
      rayDots.push({ x: tx, y: ty, appear: 1.0 + index * 0.07 + 0.27, end: true });
    });

    let noise: { x: number; y: number }[] = [];
    let frame = 0;

    // t = 99 is the settled final frame (also the reduced-motion frame).
    const drawFrame = (t: number) => {
      frame += 1;
      // Full redraw on a transparent canvas: the page's ambient glow and
      // flow-field stay visible behind the dither.
      ctx.clearRect(0, 0, 532, 540);

      // Ambient noise field while the head assembles.
      if (t < 1.0) {
        if (noise.length === 0 || frame % 4 === 0) {
          noise = [];
          for (let i = 0; i < 60; i++) {
            noise.push({
              x: Math.floor(Math.random() * 133) * 4,
              y: Math.floor(Math.random() * 135) * 4,
            });
          }
        }
        ctx.fillStyle = `rgba(${blue},${(0.06 * (1 - t)).toFixed(3)})`;
        for (const n of noise) ctx.fillRect(n.x, n.y, 3, 3);
      }

      // The dithered head: cells arrive in Bayer order with a settling jitter,
      // then a one-shot glitch shimmer shifts two bands by a whole cell.
      const glitch = t > 1.6 && t < 1.8;
      for (const c of cells) {
        if (t < c.appear) continue;
        const settling = t < c.appear + 0.3;
        const ox = settling ? Math.random() * 2 - 1 : 0;
        const oy = settling ? Math.random() * 2 - 1 : 0;
        ctx.fillStyle = c.warm
          ? `rgba(${coral},0.4)`
          : `rgba(${blue},${c.alpha.toFixed(2)})`;
        ctx.fillRect(c.x + ox, c.y + oy, 3, 3);
        if (glitch && ((c.y >= 186 && c.y < 216) || (c.y >= 306 && c.y < 336))) {
          ctx.fillStyle = `rgba(${blue},0.22)`;
          ctx.fillRect(c.x + (Math.sin(t * 45) > 0 ? 4 : -4), c.y, 3, 3);
        }
      }

      for (const dot of rayDots) {
        if (t < dot.appear) continue;
        ctx.fillStyle = `rgba(${blue},${dot.end ? 0.45 : 0.35})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.end ? 1.8 : 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let raf = 0;
    let t0: number | null = null;
    const loop = (ts: number) => {
      if (t0 === null) t0 = ts;
      const t = (ts - t0) / 1000;
      if (t < 2.1) {
        drawFrame(t);
        raf = requestAnimationFrame(loop);
      } else {
        drawFrame(99);
        raf = 0;
      }
    };

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Single control point: static final frame under reduced motion, one
    // play-through otherwise; honors the media query flipping either way.
    const play = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      if (media.matches) {
        drawFrame(99);
      } else {
        t0 = null;
        raf = requestAnimationFrame(loop);
      }
    };
    play();
    media.addEventListener("change", play);

    return () => {
      media.removeEventListener("change", play);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

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
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full"
        />

        <ul aria-label={hero.mapLabel}>
          {hero.mapItems.map((item, index) => {
            const [left, top, delay] = CARDS[index];
            return (
              <li
                key={item.category}
                className="hero-in absolute flex h-19.5 w-53 flex-col justify-center gap-1.25 rounded-lg border border-border bg-popover px-3.5 py-2.5 shadow-[0_1px_2px_rgb(0_0_0/0.05),0_10px_28px_rgb(0_0_0/0.07)]"
                style={{ left, top, animationDelay: `${delay}s` }}
              >
                {index === 0 && (
                  <span
                    aria-hidden
                    className="hero-fade pointer-events-none absolute -inset-px rounded-lg border border-primary"
                    style={{
                      animationDelay: "2.1s",
                      boxShadow:
                        "0 0 20px color-mix(in oklch, var(--primary) 25%, transparent)",
                    }}
                  />
                )}
                <span className="flex items-center gap-1.75">
                  <span
                    aria-hidden
                    className="size-1.75 shrink-0 rounded-full border border-accent-2"
                  />
                  <span className="type-label text-muted-foreground">
                    {item.category}
                  </span>
                </span>
                <span className="text-sm leading-snug font-medium">
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

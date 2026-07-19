"use client";

import { useEffect, useRef } from "react";

// Hero background: a flow-field of 200 particles leaving fading trails, ~7% lime.
// Colors are resolved once from the design tokens (never hard-coded): each token
// is painted onto a 1x1 probe canvas so whatever color space it uses (oklch)
// normalizes to rgb bytes we can compose an alpha onto. The buffer is scaled by
// devicePixelRatio so the 1px trails stay crisp on retina. The rAF loop only
// runs while the canvas is on-screen (IntersectionObserver) and motion is
// allowed; reduced-motion renders a single settled frame (240 pre-run steps)
// and reacts to the media query flipping either way. The bottom fade mask
// lives in globals.css (.hero-flow-mask), applied via className.

export function FlowField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resolve token -> rgba(r,g,b,alpha) once. The probe canvas turns any CSS
    // color (incl. oklch tokens) into sRGB bytes so we can apply our own alpha.
    const tokens = getComputedStyle(canvas);
    const probe = document
      .createElement("canvas")
      .getContext("2d", { willReadFrequently: true });
    if (!probe) return;
    const rgba = (name: string, alpha: number) => {
      probe.fillStyle = "#000";
      probe.fillStyle = tokens.getPropertyValue(name).trim();
      probe.fillRect(0, 0, 1, 1);
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
      return `rgba(${r},${g},${b},${alpha})`;
    };
    const clearFill = rgba("--background", 1);
    const trailFill = rgba("--background", 0.05);
    const limeStroke = rgba("--primary", 0.34);
    const greyStroke = rgba("--foreground-dim", 0.15);

    let particles: { x: number; y: number; lime: boolean }[] = [];
    let t = 0;
    // World size in CSS px; drawing happens in this space, the dpr transform
    // maps it onto the (larger) physical buffer.
    let w = 0;
    let h = 0;

    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      w = Math.max(2, Math.round(rect.width));
      h = Math.max(2, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = clearFill;
      ctx.fillRect(0, 0, w, h);
      particles = [];
      for (let i = 0; i < 200; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          lime: Math.random() < 0.07,
        });
      }
    };

    const step = () => {
      t += 0.006;
      ctx.fillStyle = trailFill;
      ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (const p of particles) {
        const angle =
          Math.sin(p.x * 0.0038 + t * 2.1) * 1.1 +
          Math.cos(p.y * 0.0031 - t * 1.4) * 1.1;
        const nx = p.x + Math.cos(angle) * 0.8 + 0.35;
        const ny = p.y + Math.sin(angle) * 0.8 - 0.1;
        ctx.strokeStyle = p.lime ? limeStroke : greyStroke;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        p.x = nx;
        p.y = ny;
        if (p.x < -4 || p.x > w + 4 || p.y < -4 || p.y > h + 4) {
          p.x = (p.x + w) % w;
          p.y = (p.y + h) % h;
        }
      }
    };

    fit();

    // A refit resets the whole field. Mobile URL-bar show/hide fires resize
    // with a height-only change: the CSS stretch it causes is invisible on an
    // ambient field, so only a width change refits.
    const onResize = () => {
      if (Math.round(canvas.getBoundingClientRect().width) !== w) fit();
    };
    window.addEventListener("resize", onResize);

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let visible = true;

    const loop = () => {
      step();
      raf = requestAnimationFrame(loop);
    };
    // Single control point: paints only while on-screen and motion is allowed.
    const play = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      if (!media.matches && visible) raf = requestAnimationFrame(loop);
    };

    if (media.matches) {
      for (let i = 0; i < 240; i++) step();
    }
    media.addEventListener("change", play);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      play();
    });
    io.observe(canvas);

    return () => {
      window.removeEventListener("resize", onResize);
      media.removeEventListener("change", play);
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}

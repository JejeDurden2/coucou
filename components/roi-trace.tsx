import { RoiReadout } from "@/components/roi-readout";
import { ScrollReveal } from "@/components/scroll-reveal";
import { hero } from "@/content/hero";

// The hero instrument: a stepped gain trace drawn above the flat baseline.
// Pure SVG + CSS animation (.trace-draw / .trace-pt in globals.css); the only
// client code is the readout counter. Delays stagger each point along the draw.

const TRACE_PATH =
  "M20,470 L100,470 L100,420 L180,420 L180,360 L260,360 L260,330 L340,330 L340,250 L420,250 L420,210 L500,210 L500,120 L580,120";

const POINTS = [
  { x: 100, y: 420, delay: 0.5 },
  { x: 180, y: 360, delay: 0.65 },
  { x: 260, y: 330, delay: 0.8 },
  { x: 340, y: 250, delay: 0.95 },
  { x: 420, y: 210, delay: 1.1 },
  { x: 500, y: 120, delay: 1.25 },
];

export function RoiTrace() {
  return (
    <div className="relative h-[30rem]">
      <span
        aria-hidden
        className="absolute top-2 -left-1.5 rotate-180 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-foreground-dim [writing-mode:vertical-rl]"
      >
        {hero.axisY}
      </span>

      <svg
        viewBox="0 0 600 560"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={hero.traceAlt}
      >
        <path
          d="M20,470 H580"
          fill="none"
          strokeWidth="1.5"
          strokeDasharray="4 7"
          className="stroke-border"
        />
        <text
          x="580"
          y="492"
          textAnchor="end"
          className="fill-foreground-dim font-mono text-[10px] uppercase tracking-[0.12em]"
        >
          {hero.baselineLabel}
        </text>
        <path
          d={TRACE_PATH}
          fill="none"
          strokeWidth="2"
          className="trace-draw stroke-primary"
        />
        {POINTS.map((point) => (
          <rect
            key={point.x}
            x={point.x - 3}
            y={point.y - 3}
            width="6"
            height="6"
            className="trace-pt fill-foreground-dim"
            style={{ animationDelay: `${point.delay}s` }}
          />
        ))}
        <rect
          x="575"
          y="115"
          width="10"
          height="10"
          className="trace-pt fill-primary"
          style={{ animationDelay: "1.4s" }}
        />
      </svg>

      <ScrollReveal delay={1.5} className="absolute top-[2%] right-0">
        <RoiReadout />
      </ScrollReveal>

      <span
        aria-hidden
        className="absolute right-0 bottom-8 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-foreground-dim"
      >
        {hero.axisX}
      </span>
    </div>
  );
}

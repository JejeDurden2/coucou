import { RoiReadout } from "@/components/roi-readout";
import { ScrollReveal } from "@/components/scroll-reveal";
import { hero } from "@/content/hero";

// The hero instrument tells one engagement's story: the trace sits on the
// baseline while nothing changes, jumps at the "Mise en production" marker,
// then climbs in decelerating steps and settles on a plateau (a durable gain,
// not a hockey stick). Grey squares are the monthly ROI readings named in the
// legend; the readout card is the latest one. Pure SVG + CSS animation
// (.trace-draw / .trace-pt in globals.css); only the readout counter is client.

const PROD_X = 150;

const TRACE_PATH =
  `M20,470 L${PROD_X},470 L${PROD_X},380 ` +
  "L210,380 L210,310 L270,310 L270,260 L330,260 L330,230 L390,230 L390,212 L450,212 L450,202 L510,202 L580,202";

// One square per monthly reading, staggered to pop as the draw passes them.
const READINGS = [
  { x: 210, y: 380, delay: 0.55 },
  { x: 270, y: 310, delay: 0.75 },
  { x: 330, y: 260, delay: 0.95 },
  { x: 390, y: 230, delay: 1.1 },
  { x: 450, y: 212, delay: 1.25 },
  { x: 510, y: 202, delay: 1.4 },
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
          d={`M${PROD_X},146 V490`}
          fill="none"
          strokeWidth="1"
          strokeDasharray="3 5"
          className="stroke-border"
        />
        <text
          x={PROD_X}
          y="136"
          textAnchor="start"
          className="fill-foreground-dim font-mono text-[10px] uppercase tracking-[0.12em]"
        >
          {hero.prodLabel}
        </text>

        <path
          d={TRACE_PATH}
          fill="none"
          strokeWidth="2"
          className="trace-draw stroke-primary"
        />
        {READINGS.map((reading) => (
          <rect
            key={reading.x}
            x={reading.x - 3}
            y={reading.y - 3}
            width="6"
            height="6"
            className="trace-pt fill-foreground-dim"
            style={{ animationDelay: `${reading.delay}s` }}
          />
        ))}
        <rect
          x="575"
          y="197"
          width="10"
          height="10"
          className="trace-pt fill-primary"
          style={{ animationDelay: "1.55s" }}
        />
      </svg>

      <ScrollReveal delay={1.6} className="absolute top-[12%] right-0">
        <RoiReadout />
      </ScrollReveal>

      <span
        aria-hidden
        className="absolute bottom-8 left-5 flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-foreground-dim"
      >
        <span className="size-1.5 bg-foreground-dim" />
        {hero.legendLabel}
      </span>
      <span
        aria-hidden
        className="absolute right-0 bottom-8 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-foreground-dim"
      >
        {hero.axisX}
      </span>
    </div>
  );
}

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FlowField } from "@/components/flow-field";
import { PossiblesMap } from "@/components/possibles-map";
import { ScrollReveal } from "@/components/scroll-reveal";
import { cn } from "@/lib/utils";
import { hero } from "@/content/hero";
import { bookingHref, ctaLabel } from "@/content/site";

// Hero « la carte des possibles »: a flow-field canvas, one ambient violet radial
// and four corner marks frame the viewport. The left column carries the pitch;
// the right column is the map of use-cases that light up (client leaf). The old
// method strip is gone: the Method section already lives further down the page.

const cornerMarks = [
  "top-20 left-4 border-t border-l",
  "top-20 right-4 border-t border-r",
  "bottom-4 left-4 border-b border-l",
  "bottom-4 right-4 border-b border-r",
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative -mt-16 flex min-h-svh flex-col overflow-hidden pt-16"
    >
      <FlowField className="hero-flow-mask pointer-events-none absolute inset-0 size-full" />
      <div
        aria-hidden
        className="trace-glow pointer-events-none absolute top-5 -right-35 h-150 w-190"
      />
      {cornerMarks.map((position) => (
        <div
          key={position}
          aria-hidden
          className={cn(
            "pointer-events-none absolute hidden size-4.5 border-input sm:block",
            position
          )}
        />
      ))}

      <div className="relative mx-auto grid w-full max-w-[1200px] flex-1 grid-cols-1 items-center gap-14 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <ScrollReveal delay={0}>
            <span className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
              {hero.kicker}
            </span>
          </ScrollReveal>

          <ScrollReveal delay={0.06}>
            <h1 className="mt-6 font-display text-[2.75rem] leading-[1.02] font-bold tracking-[-0.03em] text-balance sm:text-[3.5rem] lg:text-[4.5rem]">
              {hero.headlineSolid}{" "}
              <span className="text-hollow">{hero.headlineHollow}</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            <p className="mt-6 max-w-[46ch] text-pretty text-lg leading-relaxed text-muted-foreground">
              {hero.lede}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.18}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button nativeButton={false} render={<a href={bookingHref} />} size="lg">
                {ctaLabel}
                <ArrowRight data-icon="inline-end" />
              </Button>
              <span className="font-mono text-sm text-foreground-dim">
                {hero.reassurance}
              </span>
            </div>
          </ScrollReveal>
        </div>

        <div className="hidden lg:block">
          <PossiblesMap />
        </div>
      </div>
    </section>
  );
}

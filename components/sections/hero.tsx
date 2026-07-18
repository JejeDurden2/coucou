import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RoiTrace } from "@/components/roi-trace";
import { ScrollReveal } from "@/components/scroll-reveal";
import { cn } from "@/lib/utils";
import { hero } from "@/content/hero";
import { method } from "@/content/method";
import { bookingHref, ctaLabel } from "@/content/site";

// Hero « instrument » : the plotting grid, the drawn ROI trace and the method
// strip read as one measuring device. Corner ticks frame the viewport; the
// timeline reuses content/method.ts so the four steps live in one place.

const cornerTicks = [
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
      <div aria-hidden className="instrument-grid pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="trace-glow pointer-events-none absolute -top-16 right-[-12rem] h-[38rem] w-[46rem]"
      />
      {cornerTicks.map((position) => (
        <div
          key={position}
          aria-hidden
          className={cn(
            "pointer-events-none absolute hidden size-4 border-input sm:block",
            position
          )}
        />
      ))}

      <div className="relative mx-auto grid w-full max-w-[1200px] flex-1 grid-cols-1 items-center gap-14 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <ScrollReveal delay={0}>
            <h1 className="font-display text-[2.75rem] leading-[1.02] font-bold tracking-[-0.03em] sm:text-[3.5rem] lg:text-[4.5rem]">
              {hero.headlineSolid}
              <br />
              <span className="text-hollow">{hero.headlineHollow}</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.06}>
            <p className="mt-6 max-w-[46ch] text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
              {hero.lede}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button nativeButton={false} render={<a href={bookingHref} />} size="lg">
                {ctaLabel}
                <ArrowRight data-icon="inline-end" />
              </Button>
              <span className="font-mono text-sm text-muted-foreground">
                {hero.reassurance}
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.18}>
            <p className="mt-8 flex items-start gap-3 text-sm text-muted-foreground">
              <span aria-hidden className="mt-1.5 h-0.5 w-4 shrink-0 bg-primary" />
              <span className="max-w-[52ch]">{hero.note}</span>
            </p>
          </ScrollReveal>
        </div>

        <div className="hidden lg:block">
          <RoiTrace />
        </div>
      </div>

      <div className="relative border-t border-border">
        <div className="mx-auto w-full max-w-[1200px] px-6 pb-10">
          <div aria-hidden className="ruler-ticks h-2.5" />
          <ol
            aria-label="La méthode, en quatre étapes"
            className="grid grid-cols-2 gap-x-8 gap-y-6 pt-4 lg:grid-cols-4"
          >
            {method.steps.map((step, index) => (
              <li key={step.number} className="flex flex-col gap-1.5">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={cn(
                      "size-2 rounded-sm",
                      index === 0 ? "bg-primary" : "border border-foreground-dim"
                    )}
                  />
                  <span className="font-mono text-[0.6875rem] text-foreground-dim">
                    {step.number}
                  </span>
                </span>
                <span className="text-[0.9375rem] font-semibold">{step.title}</span>
                <span className="text-[0.8125rem] leading-normal text-muted-foreground">
                  {step.detail}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

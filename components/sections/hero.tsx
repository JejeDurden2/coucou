import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { hero } from "@/content/hero";
import { bookingHref, ctaLabel } from "@/content/site";

export function Hero() {
  return (
    <section
      id="top"
      className="relative -mt-16 flex min-h-svh items-center overflow-hidden pt-16"
    >
      {/* Le tracé: measurement grid + the single ambient lime glow (§5). */}
      <div aria-hidden className="trace-grid pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="trace-glow pointer-events-none absolute top-1/2 right-[-8rem] size-[38rem] -translate-y-1/2 blur-3xl lg:right-[2rem]"
      />

      {/* Plotted point: the signature mark, echoed by the wordmark and rail. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[38%] right-[15%] hidden lg:block"
      >
        <div className="relative">
          <span className="absolute top-1/2 left-1/2 h-px w-24 -translate-x-1/2 -translate-y-1/2 bg-primary/20" />
          <span className="absolute top-1/2 left-1/2 h-24 w-px -translate-x-1/2 -translate-y-1/2 bg-primary/20" />
          <span className="block size-2 rounded-sm bg-primary" />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1200px] px-6">
        <div className="max-w-[52rem]">
          <ScrollReveal delay={0}>
            <p className="flex items-center gap-2.5 font-mono text-sm text-muted-foreground">
              <span aria-hidden className="size-2 shrink-0 rounded-sm bg-primary" />
              {hero.accroche}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.06}>
            <h1 className="mt-6 text-balance font-display text-5xl leading-[1.02] font-bold tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              {hero.headline}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            <p className="mt-6 max-w-[46ch] text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
              {hero.lede}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.18}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button render={<a href={bookingHref} />} size="lg">
                {ctaLabel}
                <ArrowRight data-icon="inline-end" />
              </Button>
              <span className="font-mono text-sm text-muted-foreground">
                {hero.reassurance}
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.24}>
            <p className="mt-8 flex items-start gap-3 text-sm text-muted-foreground">
              <span aria-hidden className="mt-1.5 h-0.5 w-4 shrink-0 bg-primary" />
              <span className="max-w-[52ch]">{hero.diagnosticNote}</span>
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

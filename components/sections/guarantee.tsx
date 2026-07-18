import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { MetricBlock } from "@/components/metric-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { guarantee } from "@/content/guarantee";

export function Guarantee() {
  return (
    <section id="garantie" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <ScrollReveal className="max-w-[48rem]">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {guarantee.eyebrow}
          </p>
          <h2 className="mt-4 text-balance font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.02em] lg:text-[2.75rem]">
            {guarantee.title}
          </h2>
          <p className="mt-5 max-w-[58ch] text-pretty text-lg leading-relaxed text-muted-foreground">
            {guarantee.intro}
          </p>
        </ScrollReveal>

        {/* Principles: three cells sharing hairline dividers, no boxed cards. */}
        <ScrollReveal className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {guarantee.principles.map((principle) => (
            <div key={principle.title} className="bg-background p-6 lg:p-8">
              <h3 className="font-display text-lg leading-snug font-medium tracking-[-0.01em]">
                {principle.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {principle.description}
              </p>
            </div>
          ))}
        </ScrollReveal>

        {/* Metric trio on the second (and last) tracé grid field. */}
        <div className="relative mt-6 overflow-hidden rounded-lg border border-border">
          <div
            aria-hidden
            className="trace-grid pointer-events-none absolute inset-0 opacity-70"
          />
          <ScrollReveal className="relative grid grid-cols-1 gap-8 p-8 sm:grid-cols-3 lg:p-12">
            {guarantee.metrics.map((metric, index) => (
              <MetricBlock
                key={metric.label}
                value={metric.value}
                label={metric.label}
                marked={index === 0}
                className={cn(
                  index > 0 && "sm:border-l sm:border-border sm:pl-8"
                )}
              />
            ))}
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <p className="mt-6 max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
            {guarantee.metricsNote}
          </p>
        </ScrollReveal>

        {/* Trust: RGPD / AI Act, one sober lime mark. */}
        <ScrollReveal className="mt-12 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:gap-6">
          <ShieldCheck aria-hidden className="size-5 shrink-0 text-primary sm:mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {guarantee.trustTitle}
            </h3>
            <p className="mt-2 max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
              {guarantee.trust}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

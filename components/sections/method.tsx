import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/scroll-reveal";
import { hero } from "@/content/hero";
import { method } from "@/content/method";
import { bookingUrl, ctaLabel } from "@/content/site";

export function Method() {
  return (
    <section id="methode" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <ScrollReveal className="max-w-[46rem]">
          <h2 className="text-balance font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.02em] lg:text-[2.75rem]">
            {method.title}
          </h2>
          <p className="mt-5 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground">
            {method.sub}
          </p>
        </ScrollReveal>

        {/* Vertical measured rail: the numbers are the nodes, the hairline is
            the tracé, the last step turns blue as the ROI terminus. */}
        <ol className="mt-14 lg:mt-16">
          {method.steps.map((step, index) => {
            const last = index === method.steps.length - 1;
            return (
              // The reveal wrapper lives inside the li: an ol only accepts li children.
              <li key={step.number} className="relative pb-12 last:pb-0">
                <ScrollReveal
                  delay={index * 0.05}
                  className="grid grid-cols-[3.5rem_1fr] gap-x-6 lg:grid-cols-[5rem_1fr] lg:gap-x-10"
                >
                  {!last ? (
                    <span
                      aria-hidden
                      className="absolute top-7 bottom-0 left-[1.75rem] w-px -translate-x-1/2 bg-border lg:left-[2.5rem]"
                    />
                  ) : null}

                  <div className="flex justify-center">
                    <span
                      className={cn(
                        "relative z-10 bg-background pb-2 font-mono text-sm tabular-nums",
                        last ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {step.number}
                    </span>
                  </div>

                  <div className="pb-1">
                    <h3 className="font-display text-xl leading-snug font-medium tracking-[-0.01em]">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-[62ch] text-pretty leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    <p className="mt-3 font-mono text-xs text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </ScrollReveal>
              </li>
            );
          })}
        </ol>

        {/* L’étape 01 est le point de départ : c’est ici, après la méthode, le point
            de décision naturel. Même bouton que le hero, même micro-note. */}
        <ScrollReveal className="mt-14 flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:mt-16">
          <Button nativeButton={false} render={<a href={bookingUrl("methode")} />} size="lg">
            {ctaLabel}
            <ArrowRight data-icon="inline-end" />
          </Button>
          <span className="font-mono text-sm text-foreground-dim">
            {hero.reassurance}
          </span>
        </ScrollReveal>
      </div>
    </section>
  );
}

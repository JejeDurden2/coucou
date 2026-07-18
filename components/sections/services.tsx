import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { services } from "@/content/services";

export function Services() {
  return (
    <section id="services" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <ScrollReveal className="max-w-[46rem]">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {services.eyebrow}
          </p>
          <h2 className="mt-4 text-balance font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.02em] lg:text-[2.75rem]">
            {services.title}
          </h2>
          <p className="mt-5 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground">
            {services.sub}
          </p>
        </ScrollReveal>

        <div className="mt-14 flex flex-col gap-6">
          {services.offers.map((offer, index) => {
            const mirrored = index % 2 === 1;
            return (
              <ScrollReveal key={offer.id} delay={index * 0.05}>
                <Card className="[--card-spacing:--spacing(8)]">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                    <div className={cn("lg:col-span-5", mirrored && "lg:order-2")}>
                      <h3 className="font-display text-2xl leading-snug font-medium tracking-[-0.01em]">
                        {offer.title}
                      </h3>
                      <p className="mt-4 text-pretty text-lg leading-relaxed text-foreground">
                        {offer.hook}
                      </p>
                      <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                        {offer.description}
                      </p>

                      <div className="mt-6 flex items-start gap-3 border-t border-border pt-6">
                        <span
                          aria-hidden
                          className="mt-1 h-0.5 w-4 shrink-0 bg-primary"
                        />
                        <div>
                          <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                            {services.livrableLabel}
                          </span>
                          <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                            {offer.livrable}
                          </p>
                        </div>
                      </div>
                    </div>

                    <ul
                      className={cn(
                        "flex flex-col lg:col-span-7",
                        mirrored && "lg:order-1"
                      )}
                    >
                      {offer.deliverables.map((deliverable) => (
                        <li
                          key={deliverable}
                          className="flex items-start gap-3 border-b border-border py-3.5 text-sm leading-relaxed text-muted-foreground first:pt-0 last:border-b-0 last:pb-0"
                        >
                          <Check
                            aria-hidden
                            className="mt-0.5 size-4 shrink-0 text-primary"
                          />
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

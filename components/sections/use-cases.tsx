import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/scroll-reveal";
import { useCases } from "@/content/use-cases";

export function UseCases() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <ScrollReveal className="max-w-[46rem]">
          <h2 className="text-balance font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.02em] lg:text-[2.75rem]">
            {useCases.title}
          </h2>
          <p className="mt-5 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground">
            {useCases.sub}
          </p>
        </ScrollReveal>

        {/* Ledger: hairline-separated rows, case on the left, estimated gain on
            the right. Measurement, not a grid of identical cards. */}
        <div className="mt-12 border-t border-border">
          {useCases.cases.map((useCase, index) => (
            <ScrollReveal key={useCase.title} delay={index * 0.04}>
              <Link
                href={`/cas-usage/${useCase.slug}`}
                className="group/uc grid grid-cols-1 gap-4 rounded-lg border-b border-border py-7 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background md:grid-cols-12 md:gap-8"
              >
                <div className="md:col-span-7">
                  <h3 className="flex items-center gap-2 font-display text-xl leading-snug font-medium tracking-[-0.01em]">
                    <span className="underline-offset-4 group-hover/uc:underline">
                      {useCase.title}
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="size-4 shrink-0 text-muted-foreground transition-colors group-hover/uc:text-foreground"
                    />
                  </h3>
                  <p className="mt-2 max-w-[60ch] text-pretty leading-relaxed text-muted-foreground">
                    {useCase.description}
                  </p>
                </div>
                <div className="md:col-span-5 md:border-l md:border-border md:pl-8">
                  <Badge
                    variant="outline"
                    className="font-mono uppercase tracking-[0.1em] text-muted-foreground"
                  >
                    {useCase.gainLabel}
                  </Badge>
                  <p className="mt-2.5 text-pretty leading-relaxed tabular-nums text-foreground">
                    {useCase.gain}
                  </p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <p className="mt-8 flex items-start gap-3 text-sm text-muted-foreground">
            <span
              aria-hidden
              className="mt-1.5 h-0.5 w-4 shrink-0 bg-primary"
            />
            <span className="max-w-[82ch]">{useCases.disclaimer}</span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

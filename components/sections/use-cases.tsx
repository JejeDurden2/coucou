import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ScrollReveal } from "@/components/scroll-reveal";
import { useCases } from "@/content/use-cases";

export function UseCases() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <ScrollReveal className="max-w-[46rem]">
          <h2 className="type-h2">
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
                className="group/uc -mx-4 grid grid-cols-1 gap-4 rounded-lg border-b border-border px-4 py-7 outline-none transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:grid-cols-12 md:gap-8"
              >
                <div className="md:col-span-7">
                  <h3 className="flex items-center gap-2 type-h4">
                    <span className="underline-offset-4 group-hover/uc:underline">
                      {useCase.title}
                    </span>
                    <ArrowRight
                      aria-hidden
                      className="size-4 shrink-0 text-muted-foreground transition group-hover/uc:translate-x-0.5 group-hover/uc:text-foreground"
                    />
                  </h3>
                  <p className="mt-2 max-w-[60ch] text-pretty leading-relaxed text-muted-foreground">
                    {useCase.description}
                  </p>
                </div>
                <div className="md:col-span-5 md:border-l md:border-border md:pl-8">
                  <span className="type-label text-muted-foreground">
                    {useCase.gainLabel}
                  </span>
                  <p className="mt-2.5 text-pretty leading-relaxed tabular-nums text-foreground">
                    {useCase.gain}
                  </p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <p className="mt-8 max-w-[82ch] text-sm text-muted-foreground">
            {useCases.disclaimer}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

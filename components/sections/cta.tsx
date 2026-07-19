import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { finalCta } from "@/content/cta";
import { bookingUrl, ctaLabel } from "@/content/site";

export function Cta() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-24 lg:py-32">
        <ScrollReveal className="mx-auto flex max-w-[46rem] flex-col items-center text-center">
          <h2 className="text-balance font-display text-[2.5rem] leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            {finalCta.title}
          </h2>
          <p className="mt-6 max-w-[52ch] text-pretty text-lg leading-relaxed text-muted-foreground">
            {finalCta.sub}
          </p>
          <div className="mt-10">
            <Button nativeButton={false} render={<a href={bookingUrl("cta-final")} />} size="lg">
              {ctaLabel}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

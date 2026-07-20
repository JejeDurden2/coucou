import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { finalCta } from "@/content/cta";
import { ressources } from "@/content/ressources";
import { bookingUrl, ctaLabel } from "@/content/site";

const carteLinkClasses =
  "rounded-sm text-muted-foreground underline underline-offset-4 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background";

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
          <p className="mt-8 font-mono text-sm text-foreground-dim">
            {finalCta.softExitIntro}{" "}
            {ressources.map((ressource, index) => (
              <span key={ressource.slug}>
                {index > 0 && <span aria-hidden> · </span>}
                <a href={`/ressources/${ressource.slug}`} className={carteLinkClasses}>
                  {ressource.name}
                </a>
              </span>
            ))}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

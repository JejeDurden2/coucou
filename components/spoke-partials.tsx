import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";
import { MetricBlock } from "@/components/metric-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { bookingHref, ctaLabel } from "@/content/site";

// Blocks shared by both spoke templates (secteur + cas d'usage). Composed from
// the existing primitives; tokens only. Kept partial (not full sections) so the
// two page templates stay readable.

// Hero: breadcrumb, H1, douleur intro, the single booking CTA.
export function SpokeHero({
  breadcrumb,
  h1,
  intro,
}: {
  breadcrumb: { label: string; href?: string }[];
  h1: string;
  intro: string;
}) {
  return (
    <section>
      <div className="mx-auto max-w-[1200px] px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <Breadcrumb items={breadcrumb} />
        <ScrollReveal className="mt-8 max-w-[52rem]">
          <h1 className="text-balance font-display text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl">
            {h1}
          </h1>
          <p className="mt-6 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
            {intro}
          </p>
          <div className="mt-9">
            <Button
              nativeButton={false}
              render={<a href={bookingHref} />}
              size="lg"
            >
              {ctaLabel}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// Business case: the one lime-marked metric on the page, "Exemple" label kept
// visible above the figure. The single trace-grid field allowed per spoke.
export function BusinessCaseBlock({
  context,
  metric,
  result,
  label,
}: {
  context: string;
  metric: string;
  result: string;
  label: string;
}) {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
        <div className="relative overflow-hidden rounded-lg border border-border">
          <div
            aria-hidden
            className="trace-grid pointer-events-none absolute inset-0 opacity-70"
          />
          <ScrollReveal className="relative grid grid-cols-1 gap-8 p-8 lg:grid-cols-2 lg:gap-12 lg:p-12">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Business case
              </span>
              <p className="mt-4 max-w-[52ch] text-pretty text-lg leading-relaxed text-foreground">
                {context}
              </p>
            </div>
            <div className="lg:border-l lg:border-border lg:pl-12">
              <MetricBlock value={metric} label={label} marked />
              <p className="mt-4 max-w-[44ch] text-pretty text-sm leading-relaxed text-muted-foreground">
                {result}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

// Recap linking back to the home method + garantie sections (internal nav,
// secondary buttons, never the booking CTA).
export function MethodRecap() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
        <ScrollReveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-[46rem]">
            <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
              Notre méthode, du diagnostic à la production
            </h2>
            <p className="mt-4 max-w-[60ch] text-pretty leading-relaxed text-muted-foreground">
              On part de votre activité, on chiffre le retour attendu, puis on
              livre un système en production, mesuré sur ses résultats. Le ROI
              est garanti, pas seulement promis.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              nativeButton={false}
              render={<Link href="/#methode" />}
              variant="secondary"
              size="default"
            >
              La méthode en détail
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/#garantie" />}
              variant="secondary"
              size="default"
            >
              La garantie ROI
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// Cross-links to the other collection. Renders nothing when empty, so unmatched
// slugs (content arriving in parallel) never produce a dead link.
export function RelatedLinks({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; name: string }[];
}) {
  if (links.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
        <ScrollReveal>
          <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
            {heading}
          </h2>
        </ScrollReveal>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link, index) => (
            <ScrollReveal key={link.href} delay={index * 0.04}>
              <Link
                href={link.href}
                className="group/rel flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-5 outline-none transition-colors hover:border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="font-display text-base leading-snug font-medium tracking-[-0.01em] text-foreground">
                  {link.name}
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground transition-colors group-hover/rel:text-foreground"
                />
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

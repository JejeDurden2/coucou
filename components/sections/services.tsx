import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FoldMark, FoldPanel } from "@/components/fold-reveal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { hero } from "@/content/hero";
import { services, type Service } from "@/content/services";
import { bookingUrl, ctaLabel } from "@/content/site";

// « Le pli » : les deux métiers sont les deux volets d’une même feuille.
// Diptyque symétrique, charnière centrale où la marque origami se plie,
// puis un seul CTA qui résout le choix entre les deux volets.

function OfferPanel({ offer }: { offer: Service }) {
  return (
    <div className="flex h-full flex-col p-8">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {offer.step} · {offer.title}
      </p>
      <h3 className="mt-4 font-display text-[1.75rem] leading-none font-bold tracking-[-0.02em] lg:text-[2.5rem]">
        {offer.verb}
      </h3>
      <p className="mt-5 max-w-[44ch] text-pretty text-lg leading-relaxed text-foreground">
        {offer.hook}
      </p>

      <ul className="mt-7 mb-8 flex flex-col gap-3">
        {offer.deliverables.map((deliverable) => (
          <li
            key={deliverable}
            className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
          >
            <span aria-hidden className="font-mono text-foreground-dim">
              +
            </span>
            <span>{deliverable}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-start gap-3 border-t border-border pt-6">
        <span aria-hidden className="mt-1 h-0.5 w-4 shrink-0 bg-primary" />
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {services.livrableLabel}
          </span>
          <p className="mt-1.5 text-pretty leading-relaxed text-foreground">
            {offer.livrable}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Services() {
  const [audit, developpement] = services.offers;

  return (
    <section id="services" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <ScrollReveal className="mx-auto max-w-[46rem] text-center">
          <h2 className="text-balance font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.02em] lg:text-[2.75rem]">
            {services.title}
          </h2>
          <p className="mx-auto mt-5 max-w-[58ch] text-pretty text-lg leading-relaxed text-muted-foreground">
            {services.sub}
          </p>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:mt-16 lg:grid-cols-[1fr_4.5rem_1fr] lg:gap-0">
          <FoldPanel
            side="left"
            className="rounded-lg border border-border bg-card lg:rounded-r-none"
          >
            <OfferPanel offer={audit} />
          </FoldPanel>

          {/* Charnière mobile : la feuille est pliée en pile, le pli passe entre
              les deux volets. */}
          <div className="flex flex-col items-center gap-3 py-2 lg:hidden">
            <div className="flex w-full items-center gap-4">
              <span aria-hidden className="h-px flex-1 bg-border" />
              <FoldMark className="rounded-md border border-border p-2.5" />
              <span aria-hidden className="h-px flex-1 bg-border" />
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {services.spineLabel}
            </span>
          </div>

          {/* Charnière desktop : la ligne du pli, l’oiseau qui se plie, le
              libellé le long de la charnière. */}
          <div className="relative isolate hidden flex-col items-center gap-4 overflow-hidden lg:flex">
            {/* Le pli concentre la lumière : lueur violette fine, clippée au
                canal de la charnière (72px), derrière le FoldMark. */}
            <div
              aria-hidden
              className="trace-glow pointer-events-none absolute top-1/2 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 opacity-40"
            />
            <span aria-hidden className="w-px flex-1 bg-border" />
            <FoldMark className="rounded-md border border-border p-2.5" />
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground [writing-mode:vertical-rl]">
              {services.spineLabel}
            </span>
            <span aria-hidden className="w-px flex-1 bg-border" />
          </div>

          <FoldPanel
            side="right"
            className="rounded-lg border border-border bg-card lg:rounded-l-none"
          >
            <OfferPanel offer={developpement} />
          </FoldPanel>
        </div>

        <ScrollReveal className="mt-14 flex flex-col items-center gap-6 text-center lg:mt-16">
          <p className="max-w-[46ch] text-pretty text-lg leading-relaxed text-foreground">
            {services.ctaHook}
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button
              nativeButton={false}
              render={<a href={bookingUrl("services")} />}
              size="lg"
            >
              {ctaLabel}
              <ArrowRight data-icon="inline-end" />
            </Button>
            <span className="font-mono text-sm text-foreground-dim">
              {hero.reassurance}
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

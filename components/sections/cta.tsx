import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { finalCta } from "@/content/cta";
import { ressources } from "@/content/ressources";
import { bookingUrl, ctaLabel } from "@/content/site";

const carteLinkClasses =
  "rounded-sm text-muted-foreground underline underline-offset-4 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// `placement` : attribution UTM par page (utm_content côté Cal.com).
// `secteurSlug` : sur une page secteur, la sortie douce propose la carte de ce
// secteur ; sans carte pour ce secteur, elle propose le kit de démarrage.
// Sans secteur (page d'accueil), un seul lien vers le hub /ressources.
export function Cta({
  placement = "cta-final",
  secteurSlug,
}: { placement?: string; secteurSlug?: string } = {}) {
  const carte = secteurSlug
    ? ressources.find((ressource) => ressource.secteurSlug === secteurSlug)
    : undefined;

  return (
    <section className="relative overflow-hidden border-t border-border">
      {/* Bookend : la page s'ouvre sur la lumière bleue du hero et se ferme
          sur la chaleur du coral. Décentré en bas à gauche, cœur hors
          viewport, opacité sous le hero. */}
      <div
        aria-hidden
        className="trace-glow-warm pointer-events-none absolute -bottom-32 -left-32 h-100 w-120 opacity-40 lg:-bottom-40 lg:-left-40 lg:h-140 lg:w-160 lg:opacity-50"
      />
      <div className="relative mx-auto max-w-[1200px] px-6 py-24 lg:py-32">
        <ScrollReveal className="mx-auto flex max-w-[46rem] flex-col items-center text-center">
          <h2 className="type-h1">
            {finalCta.title}
          </h2>
          <p className="mt-6 max-w-[52ch] text-pretty text-lg leading-relaxed text-muted-foreground">
            {finalCta.sub}
          </p>
          <div className="mt-10">
            <Button nativeButton={false} render={<a href={bookingUrl(placement)} />} size="lg">
              {ctaLabel}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
          <p className="mt-8 font-mono text-sm text-foreground-dim">
            {carte ? (
              <>
                {finalCta.softExitIntro}{" "}
                <a href={`/ressources/${carte.slug}`} className={carteLinkClasses}>
                  {carte.name}
                </a>
              </>
            ) : secteurSlug ? (
              <>
                {finalCta.softExitKitIntro}{" "}
                <a href="/outils/kit-de-demarrage" className={carteLinkClasses}>
                  {finalCta.softExitKitLabel}
                </a>
              </>
            ) : (
              <>
                {finalCta.softExitHubIntro}{" "}
                <Link href="/ressources" className={carteLinkClasses}>
                  {finalCta.softExitHubLabel}
                </Link>
              </>
            )}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

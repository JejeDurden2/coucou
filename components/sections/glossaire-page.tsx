import { ArrowRight } from "lucide-react";

import { Breadcrumb, type Crumb } from "@/components/breadcrumb";
import { RelatedLinks } from "@/components/spoke-partials";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { bookingUrl, ctaLabel } from "@/content/site";
import { glossaireShared, type GlossaireTerm } from "@/content/glossaire";

// Gabarit d’une page terme. Ordre : définition citable (lede mis en avant),
// l’image pour un dirigeant, ce que ça change, un exemple, le maillage, un CTA
// sobre. Composé des primitives existantes ; tokens uniquement, zéro "use client".
export function GlossairePageTemplate({
  term,
  breadcrumb,
  relatedTerms,
  relatedPages,
}: {
  term: GlossaireTerm;
  breadcrumb: Crumb[];
  relatedTerms: { href: string; name: string }[];
  relatedPages: { href: string; name: string }[];
}) {
  return (
    <>
      {/* Hero : la définition citable est le centre visuel de la page. */}
      <section>
        <div className="mx-auto max-w-[1200px] px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
          <Breadcrumb items={breadcrumb} />
          <ScrollReveal className="mt-8 max-w-[52rem]">
            <h1 className="type-h1">
              {term.h1}
            </h1>
            <div className="mt-8 border-l-2 border-primary/60 pl-6">
              <p className="type-label text-muted-foreground">
                {glossaireShared.definitionLabel}
              </p>
              <p className="mt-3 max-w-[60ch] text-pretty text-xl leading-relaxed text-foreground lg:text-2xl">
                {term.definition}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* L’image pour un dirigeant, puis ce que ça change : un article lisible. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <div className="flex max-w-[46rem] flex-col gap-12">
            <ScrollReveal className="flex flex-col gap-4">
              <h2 className="type-h3">
                {glossaireShared.explanationTitle}
              </h2>
              <p className="max-w-[65ch] text-pretty text-lg leading-relaxed text-muted-foreground">
                {term.explanation}
              </p>
            </ScrollReveal>
            <ScrollReveal className="flex flex-col gap-4">
              <h2 className="type-h3">
                {glossaireShared.whatItChangesTitle}
              </h2>
              <p className="max-w-[65ch] text-pretty text-lg leading-relaxed text-muted-foreground">
                {term.whatItChanges}
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* L’exemple concret, chiffres toujours étiquetés « Exemple ». */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="max-w-[52rem]">
            <div className="rounded-lg border border-border bg-card p-8 lg:p-10">
              <span className="type-label text-muted-foreground">
                {glossaireShared.exampleTitle}
              </span>
              <p className="mt-4 max-w-[64ch] text-pretty text-lg leading-relaxed text-foreground">
                {term.example}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <RelatedLinks heading={glossaireShared.relatedTermsHeading} links={relatedTerms} />

      <RelatedLinks heading={glossaireShared.relatedPagesHeading} links={relatedPages} />

      {/* CTA sobre : attribution propre au terme via bookingUrl. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="flex max-w-[46rem] flex-col gap-6">
            <h2 className="type-h3">
              {glossaireShared.cta.title}
            </h2>
            <p className="max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground">
              {glossaireShared.cta.sub}
            </p>
            <div>
              <Button
                nativeButton={false}
                render={<a href={bookingUrl(`glossaire-${term.slug}`)} />}
                size="lg"
              >
                {ctaLabel}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

import { ArrowRight, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CarteMatrix } from "@/components/carte-matrix";
import { ComplianceBlock } from "@/components/spoke-partials";
import { ScrollReveal } from "@/components/scroll-reveal";
import { bookingUrl, ctaLabel } from "@/content/site";
import { ressourcesShared, type RessourcePage } from "@/content/ressources";

// Template de la carte (/ressources/[slug]/carte, noindex). Ordre : titre +
// lede, methode, cas d'usage, matrice de synthese, conformite, closing avec
// UN SEUL bouton (le CTA point de départ). Aucun autre lien sortant sur la page.
export function CartePageTemplate({ page }: { page: RessourcePage }) {
  const { carte } = page;

  return (
    <>
      <section>
        <div className="mx-auto max-w-[1200px] px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
          <ScrollReveal className="max-w-[52rem]">
            <h1 className="text-balance font-display text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl">
              {carte.title}
            </h1>
            <p className="mt-6 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
              {carte.lede}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Methode de lecture : encadre sobre, pas de titre supplementaire. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="max-w-[62ch] rounded-lg border border-border bg-card p-6">
            <p className="text-pretty leading-relaxed text-foreground">{carte.method}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Cas d'usage : une carte par cas, l'ordre de grandeur mis en valeur
          facon metric, la mini-grille d'auto-evaluation en dessous. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {carte.useCases.map((useCase, index) => (
              <ScrollReveal key={useCase.title} delay={index * 0.04}>
                <div className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-6">
                  <h3 className="font-display text-lg leading-snug font-medium tracking-[-0.01em]">
                    {useCase.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {useCase.problem}
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">{useCase.solution}</p>

                  <div className="flex flex-col gap-1">
                    <span className="font-display text-2xl leading-none font-bold tracking-[-0.02em] tabular-nums text-primary">
                      {useCase.order}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                      {ressourcesShared.illustrationLabel}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-border pt-4">
                    <span className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
                      {ressourcesShared.questionsTitle}
                    </span>
                    <ul className="flex flex-col gap-2">
                      {useCase.questions.map((question) => (
                        <li
                          key={question}
                          className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground"
                        >
                          <Square aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Matrice de synthese : le visuel signature de la carte. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="max-w-[46rem]">
            <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
              {ressourcesShared.matrixTitle}
            </h2>
          </ScrollReveal>
          <div className="mt-10">
            <CarteMatrix useCases={carte.useCases} />
          </div>
        </div>
      </section>

      {/* Conformite : meme motif ShieldCheck que les pages secteurs. */}
      <ComplianceBlock title={carte.compliance.title} body={carte.compliance.body} />

      {/* Closing : le seul bouton de la page, le CTA point de départ. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-24 lg:py-32">
          <ScrollReveal className="mx-auto flex max-w-[46rem] flex-col items-center text-center">
            <h2 className="text-balance font-display text-[2.5rem] leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              {carte.closing.title}
            </h2>
            <p className="mt-6 max-w-[52ch] text-pretty text-lg leading-relaxed text-muted-foreground">
              {carte.closing.body}
            </p>
            <div className="mt-10">
              <Button nativeButton={false} render={<a href={bookingUrl("carte-closing")} />} size="lg">
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

import { ArrowRight, Square } from "lucide-react";

import { Breadcrumb, type Crumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { CarteMatrix } from "@/components/carte-matrix";
import { ComplianceBlock } from "@/components/spoke-partials";
import { RessourceForm } from "@/components/ressource-form";
import { ScrollReveal } from "@/components/scroll-reveal";
import { bookingUrl, ctaLabel } from "@/content/site";
import { ressourcesShared, type RessourcePage } from "@/content/ressources";

// La carte des possibles (/ressources/[slug]) : page publique, indexée, la
// carte EST la page. Ordre : hero avec la matrice en visuel signature (table
// des matières cliquable), méthode de lecture, un chapitre par cas, verdict
// « par où commencer », conformité, opt-in email (jamais une barrière),
// closing avec le CTA point de départ.
export function CartePageTemplate({
  page,
  breadcrumb,
}: {
  page: RessourcePage;
  breadcrumb: Crumb[];
}) {
  return (
    <>
      {/* Hero : texte à gauche, matrice signature à droite sur le tracé. */}
      <section>
        <div className="mx-auto max-w-[1200px] px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
          <Breadcrumb items={breadcrumb} />

          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <ScrollReveal className="lg:col-span-7">
              <span className="font-mono text-xs tracking-[0.12em] text-accent-2 uppercase">
                {ressourcesShared.eyebrow}
              </span>
              <h1 className="mt-4 text-balance font-display text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl">
                {page.h1}
              </h1>
              <p className="mt-6 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
                {page.lede}
              </p>
              <p className="mt-6 font-mono text-xs tracking-[0.08em] text-foreground-dim uppercase">
                {page.useCases.length} cas d’usage
                <span aria-hidden> · </span>
                {ressourcesShared.heroMetaClassement}
                <span aria-hidden> · </span>
                {ressourcesShared.heroMetaAccess}
              </p>
              <div className="mt-9">
                <Button nativeButton={false} render={<a href={bookingUrl("carte-hero")} />} size="lg">
                  {ctaLabel}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.05} className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-lg border border-border bg-card">
                <div
                  aria-hidden
                  className="trace-grid pointer-events-none absolute inset-0 opacity-70"
                />
                <div className="relative p-6">
                  <CarteMatrix useCases={page.useCases} linked />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Méthode de lecture : les deux axes dans le vocabulaire du secteur,
          plus ce que « en production » veut dire. Trois définitions, pas de prose. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:py-16">
          <ScrollReveal>
            <h2 className="sr-only">{ressourcesShared.axesTitle}</h2>
            <dl className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
              {[
                { term: ressourcesShared.axisImpact, def: page.axes.impact },
                { term: ressourcesShared.axisFaisabilite, def: page.axes.faisabilite },
                {
                  term: ressourcesShared.enProductionTitle,
                  def: ressourcesShared.enProductionBody,
                },
              ].map((item) => (
                <div key={item.term} className="flex flex-col gap-3 border-l-2 border-primary/60 pl-5">
                  <dt className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
                    {item.term}
                  </dt>
                  <dd className="text-pretty text-sm leading-relaxed text-foreground">
                    {item.def}
                  </dd>
                </div>
              ))}
            </dl>
          </ScrollReveal>
        </div>
      </section>

      {/* Un chapitre par cas : problème, solution, branchement à gauche ;
          ordre de grandeur et auto-évaluation à droite. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6">
          {page.useCases.map((useCase, index) => (
            <article
              key={useCase.title}
              id={`cas-${index + 1}`}
              className="scroll-mt-24 border-t border-border first:border-t-0"
            >
              <div className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-12 lg:gap-16 lg:py-16">
                <ScrollReveal className="lg:col-span-7">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="font-display text-xl leading-none font-bold tabular-nums text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.12em] text-foreground-dim uppercase">
                      {ressourcesShared.axisImpact} {useCase.impact}/3
                      <span aria-hidden> · </span>
                      {ressourcesShared.axisFaisabilite} {useCase.faisabilite}/3
                    </span>
                  </div>
                  <h2 className="mt-4 text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
                    {useCase.title}
                  </h2>
                  <p className="mt-5 max-w-[62ch] text-pretty leading-relaxed text-muted-foreground">
                    {useCase.problem}
                  </p>
                  <p className="mt-4 max-w-[62ch] text-pretty leading-relaxed text-foreground">
                    {useCase.solution}
                  </p>
                  <p className="mt-6 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
                    <span className="font-mono text-xs tracking-[0.12em] text-foreground-dim uppercase">
                      {ressourcesShared.branchementLabel}
                    </span>{" "}
                    {useCase.branchement}
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={0.05} className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9">
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[10px] tracking-[0.12em] text-foreground-dim uppercase">
                      {ressourcesShared.illustrationLabel}
                    </span>
                    <span className="font-display text-4xl leading-none font-bold tracking-[-0.02em] tabular-nums text-primary">
                      {useCase.metric}
                    </span>
                    <span className="text-pretty text-sm leading-relaxed text-muted-foreground">
                      {useCase.metricLabel}
                    </span>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-5">
                    <span className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
                      {ressourcesShared.questionsTitle}
                    </span>
                    <ul className="mt-4 flex flex-col gap-3">
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
                </ScrollReveal>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Verdict : le chemin recommandé, en toutes lettres. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:col-span-4 lg:text-[1.75rem]">
              {ressourcesShared.verdictTitle}
            </h2>
            <p className="max-w-[62ch] text-pretty text-lg leading-relaxed text-foreground lg:col-span-8">
              {page.verdict}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <ComplianceBlock title={page.compliance.title} body={page.compliance.body} />

      {/* Opt-in email : un service, pas une barrière. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="grid grid-cols-1 gap-10 rounded-lg border border-border bg-card p-8 lg:grid-cols-2 lg:gap-16 lg:p-12">
            <div>
              <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em]">
                {ressourcesShared.emailTitle}
              </h2>
              <p className="mt-3 max-w-[52ch] text-pretty leading-relaxed text-muted-foreground">
                {ressourcesShared.emailBody}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-foreground-dim">
                {ressourcesShared.formPrivacyNote}
              </p>
            </div>
            <div className="max-w-md lg:justify-self-end lg:self-center lg:w-full">
              <RessourceForm slug={page.slug} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Closing : le CTA point de départ, seul. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-24 lg:py-32">
          <ScrollReveal className="mx-auto flex max-w-[46rem] flex-col items-center text-center">
            <h2 className="text-balance font-display text-[2.5rem] leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              {ressourcesShared.closingTitle}
            </h2>
            <p className="mt-6 max-w-[52ch] text-pretty text-lg leading-relaxed text-muted-foreground">
              {page.closing}
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

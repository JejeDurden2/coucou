import { ShieldCheck } from "lucide-react";

import { ScrollReveal } from "@/components/scroll-reveal";
import {
  BusinessCaseBlock,
  MethodRecap,
  RelatedLinks,
  SpokeHero,
} from "@/components/spoke-partials";
import { Cta } from "@/components/sections/cta";
import { FaqList } from "@/components/sections/faq";
import type { Crumb } from "@/components/breadcrumb";
import type { SecteurPage } from "@/content/secteurs";

// Secteur spoke template. Order follows docs/programmatic-seo.md §4: hero,
// douleurs, cas d'usage sectoriels, business case, conformité, méthode, FAQ, CTA.
export function SecteurPageTemplate({
  page,
  breadcrumb,
  relatedCasUsage,
}: {
  page: SecteurPage;
  breadcrumb: Crumb[];
  relatedCasUsage: { href: string; name: string }[];
}) {
  return (
    <>
      <SpokeHero breadcrumb={breadcrumb} h1={page.h1} intro={page.intro} />

      {/* Le problème, dans les mots du secteur. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
              {"Ce qui vous coûte du temps aujourd'hui"}
            </h2>
            <ul className="flex flex-col gap-6">
              {page.painPoints.map((pain) => (
                <li
                  key={pain}
                  className="border-l-2 border-primary/60 pl-5 text-lg leading-relaxed text-balance text-foreground"
                >
                  {pain}
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* Cas d'usage sectoriels. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="max-w-[46rem]">
            <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
              {"Où l'IA crée de la valeur chez vous"}
            </h2>
          </ScrollReveal>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {page.useCases.map((useCase, index) => (
              <ScrollReveal key={useCase.title} delay={index * 0.04}>
                <div className="flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-6">
                  <h3 className="font-display text-lg leading-snug font-medium tracking-[-0.01em]">
                    {useCase.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {useCase.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <BusinessCaseBlock
        context={page.businessCase.context}
        metric={page.businessCase.metric}
        result={page.businessCase.result}
        label={page.businessCase.label}
      />

      {/* Conformité et données, spécificité du secteur. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="flex max-w-[56rem] flex-col gap-4 sm:flex-row sm:gap-6">
            <ShieldCheck
              aria-hidden
              className="size-5 shrink-0 text-primary sm:mt-1"
            />
            <div>
              <h2 className="font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
                {page.compliance.title}
              </h2>
              <p className="mt-3 max-w-[72ch] text-pretty leading-relaxed text-muted-foreground">
                {page.compliance.body}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <MethodRecap />

      <RelatedLinks heading="Cas d'usage associés" links={relatedCasUsage} />

      <FaqList title="Questions fréquentes" items={page.faq} />

      <Cta />
    </>
  );
}

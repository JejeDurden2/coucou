import { Check } from "lucide-react";

import { ScrollReveal } from "@/components/scroll-reveal";
import {
  BusinessCaseBlock,
  MethodRecap,
  RelatedLinks,
  SpokeHero,
} from "@/components/spoke-partials";
import { Cta } from "@/components/sections/cta";
import { FaqList } from "@/components/sections/faq";
import type { CasUsagePage } from "@/content/cas-usage-pages";

// Cas d'usage spoke template. The hero intro carries the douleur (per the type)
// and whyNotSaas + prerequisites are the unique content this playbook requires.
export function CasUsagePageTemplate({
  page,
  relatedSecteurs,
}: {
  page: CasUsagePage;
  relatedSecteurs: { href: string; name: string }[];
}) {
  return (
    <>
      <SpokeHero
        breadcrumb={[
          { label: "Accueil", href: "/" },
          { label: "Cas d'usage", href: "/cas-usage" },
          { label: page.name },
        ]}
        h1={page.h1}
        intro={page.intro}
      />

      {/* Avant / après, étape par étape. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="max-w-[46rem]">
            <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
              Avant, après
            </h2>
          </ScrollReveal>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {"Aujourd'hui"}
              </span>
              <ul className="mt-5 flex flex-col gap-4">
                {page.before.map((step) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 text-pretty leading-relaxed text-muted-foreground"
                  >
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground-dim"
                    />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:border-l md:border-border md:pl-12">
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-primary">
                Avec le système en production
              </span>
              <ul className="mt-5 flex flex-col gap-4">
                {page.after.map((step) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 text-pretty leading-relaxed text-foreground"
                  >
                    <Check
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-primary"
                    />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi un outil générique ne suffit pas (notre angle). */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:col-span-5 lg:text-[1.75rem]">
              Pourquoi un outil générique ne suffit pas
            </h2>
            <p className="max-w-[62ch] text-pretty text-lg leading-relaxed text-muted-foreground lg:col-span-7">
              {page.whyNotSaas}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Prérequis côté client. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="max-w-[46rem]">
            <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
              Ce dont nous avons besoin de votre côté
            </h2>
          </ScrollReveal>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {page.prerequisites.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground"
              >
                <span
                  aria-hidden
                  className="mt-1 h-0.5 w-4 shrink-0 bg-primary"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BusinessCaseBlock
        context={page.businessCase.context}
        metric={page.businessCase.metric}
        result={page.businessCase.result}
        label={page.businessCase.label}
      />

      <MethodRecap />

      <RelatedLinks heading="Secteurs concernés" links={relatedSecteurs} />

      <FaqList title="Questions fréquentes" items={page.faq} />

      <Cta />
    </>
  );
}

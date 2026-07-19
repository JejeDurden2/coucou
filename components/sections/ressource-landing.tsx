import { Check } from "lucide-react";

import { Breadcrumb, type Crumb } from "@/components/breadcrumb";
import { CarteMatrix } from "@/components/carte-matrix";
import { RessourceForm } from "@/components/ressource-form";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ressourcesShared, type RessourcePage } from "@/content/ressources";

// Landing de capture /ressources/[slug]. Le SEUL call to action de la page
// est le formulaire : pas de <Cta />, pas de lien sortant superflu.
export function RessourceLandingTemplate({
  page,
  breadcrumb,
}: {
  page: RessourcePage;
  breadcrumb: Crumb[];
}) {
  return (
    <section>
      <div className="mx-auto max-w-[1200px] px-6 pt-12 pb-20 lg:pt-16 lg:pb-28">
        <Breadcrumb items={breadcrumb} />

        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <ScrollReveal className="lg:col-span-7">
            <h1 className="text-balance font-display text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-6 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
              {page.intro}
            </p>

            <ul className="mt-8 flex flex-col gap-3">
              {page.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-3 text-pretty leading-relaxed text-foreground"
                >
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 max-w-md">
              <RessourceForm slug={page.slug} />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {ressourcesShared.formPrivacyNote}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.05} className="lg:col-span-5">
            <div className="rounded-lg border border-border bg-card p-6">
              <CarteMatrix useCases={page.carte.useCases} />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

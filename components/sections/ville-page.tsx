import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Cta } from "@/components/sections/cta";
import { FaqList } from "@/components/sections/faq";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  BusinessCaseBlock,
  RelatedLinks,
  SpokeHero,
} from "@/components/spoke-partials";
import { spokes } from "@/content/spokes";
import { villeCommon, type Ville } from "@/content/villes";
import { villeJsonLd } from "@/lib/seo";

// Gabarit des pages locales (/consultant-ia-<ville>). Hero, FAQ et CTA sont
// les blocs spoke existants ; contexte, métiers et méthode sont propres ici.
// Le JSON-LD et le <main> vivent ici pour garder les cinq page.tsx minces.
export function VillePageTemplate({ ville }: { ville: Ville }) {
  const breadcrumb = [
    { label: "Accueil", href: "/" },
    { label: `Consultant IA ${ville.inName}` },
  ];

  const jsonLd = villeJsonLd({
    description: ville.metaDescription,
    path: `/${ville.slug}`,
    breadcrumb,
    faq: ville.faq,
    ville: ville.name,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main id="contenu">
        <SpokeHero breadcrumb={breadcrumb} h1={ville.h1} intro={ville.intro} />

        {/* Ancrage local : ce que la ville change, ce que la visio couvre. */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
            <ScrollReveal className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
              <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
                {ville.contexte.title}
              </h2>
              <div className="flex flex-col gap-6">
                {ville.contexte.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="max-w-[62ch] text-pretty leading-relaxed text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Carte des possibles locale : déclinaison statique du motif du hero
            de la home (catégorie mono + bénéfice), sans canvas ni animation. */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
            <ScrollReveal className="max-w-[46rem]">
              <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
                {villeCommon.carteTitle} {ville.inName}
              </h2>
            </ScrollReveal>
            <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ville.carte.map((item, index) => (
                <li key={item.category}>
                  <ScrollReveal
                    delay={index * 0.04}
                    className="flex h-full flex-col gap-2 rounded-lg border border-border bg-card p-5"
                  >
                    <span className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
                      {item.category}
                    </span>
                    <span className="text-sm leading-relaxed text-foreground">
                      {item.line}
                    </span>
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Métiers locaux : cartes liées vers les pages secteurs. */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
            <ScrollReveal className="max-w-[46rem]">
              <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
                {villeCommon.metiersTitle}
              </h2>
            </ScrollReveal>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {ville.metiers.map((metier, index) => (
                <ScrollReveal key={metier.name} delay={index * 0.04}>
                  <Link
                    href={metier.href}
                    className="group/metier flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-6 outline-none transition-colors hover:border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span className="flex items-center justify-between gap-4">
                      <span className="font-display text-lg leading-snug font-medium tracking-[-0.01em] text-foreground">
                        {metier.name}
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 shrink-0 text-muted-foreground transition-colors group-hover/metier:text-foreground"
                      />
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {metier.description}
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Un scénario chiffré, le métier phare local. Même bloc que les pages
            secteurs, mêmes métriques, toujours étiqueté "Exemple". */}
        <BusinessCaseBlock
          context={ville.businessCase.context}
          metric={ville.businessCase.metric}
          result={ville.businessCase.result}
          label={ville.businessCase.label}
        />

        {/* Méthode : les quatre étapes, partagées entre les villes (villeCommon). */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
            <ScrollReveal className="max-w-[46rem]">
              <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
                {villeCommon.methode.title}
              </h2>
            </ScrollReveal>
            <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {villeCommon.methode.steps.map((step, index) => (
                <li key={step.title}>
                  <ScrollReveal delay={index * 0.04} className="flex h-full flex-col gap-3">
                    <span className="font-mono text-sm tabular-nums text-muted-foreground">
                      0{index + 1}
                    </span>
                    <h3 className="font-display text-lg leading-snug font-medium tracking-[-0.01em]">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </ScrollReveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <FaqList title={spokes.faqTitle} items={ville.faq} />

        {/* Maillage sortant hors secteurs déjà liés : blog, outils, fondateur. */}
        <RelatedLinks heading={villeCommon.liensTitle} links={ville.liens} />

        <Cta placement={ville.slug} />
      </main>
    </>
  );
}

import type { Metadata } from "next";

import { Breadcrumb } from "@/components/breadcrumb";
import { GrilleInteractive, type GrilleSector } from "@/components/grille-interactive";
import { pageMetadata } from "@/lib/seo";
import { grille } from "@/content/grille";
import { ressources } from "@/content/ressources";
import { siteUrl } from "@/content/site";

// Grille d'auto-évaluation interactive : la version jouable des cartes des
// possibles. Server Component ; toute l'interactivité vit dans le leaf client
// <GrilleInteractive>. Les secteurs viennent de content/ressources.ts (aucune
// duplication de données), la copie de content/grille.ts.

const path = "/outils/par-ou-commencer";

export const metadata: Metadata = pageMetadata({
  title: grille.metaTitle,
  description: grille.metaDescription,
  path,
});

const breadcrumb = [{ label: "Accueil", href: "/" }, { label: "Par où commencer" }];

// On ne passe au client que ce dont la grille se sert : ni campagne Lemlist,
// ni copie de la carte n'atteignent le bundle client.
const sectors: GrilleSector[] = ressources.map((ressource) => ({
  slug: ressource.slug,
  name: ressource.name,
  useCases: ressource.carte.useCases.map((useCase) => ({
    title: useCase.title,
    problem: useCase.problem,
    order: useCase.order,
    questions: useCase.questions,
  })),
}));

// JSON-LD Service + BreadcrumbList (modèle spokeJsonLd, sans FAQPage).
const url = `${siteUrl}${path}`;
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: grille.serviceName,
      description: grille.metaDescription,
      url,
      provider: {
        "@type": "ProfessionalService",
        name: "COUCOU IA",
        url: siteUrl,
      },
      areaServed: {
        "@type": "Country",
        name: "France",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: breadcrumb.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        ...(crumb.href ? { item: `${siteUrl}${crumb.href}` } : {}),
      })),
    },
  ],
};

export default function ParOuCommencerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main id="contenu">
        <section>
          <div className="mx-auto max-w-[1200px] px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
            <Breadcrumb items={breadcrumb} className="mb-8" />
            <div className="max-w-[52rem]">
              <h1 className="text-balance font-display text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl">
                {grille.h1}
              </h1>
              <p className="mt-6 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
                {grille.intro}
              </p>
            </div>
            <div className="mt-10 max-w-[46rem]">
              <GrilleInteractive sectors={sectors} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

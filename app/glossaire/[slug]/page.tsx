import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GlossairePageTemplate } from "@/components/sections/glossaire-page";
import { pageMetadata, resolveRelated } from "@/lib/seo";
import { glossaire } from "@/content/glossaire";
import { casUsagePages } from "@/content/cas-usage-pages";
import { secteurs } from "@/content/secteurs";
import { siteUrl } from "@/content/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return glossaire.map((term) => ({ slug: term.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const term = glossaire.find((entry) => entry.slug === slug);
  if (!term) {
    return {};
  }
  return pageMetadata({
    title: term.metaTitle,
    description: term.metaDescription,
    path: `/glossaire/${slug}`,
  });
}

export default async function GlossaireTermPage({ params }: Params) {
  const { slug } = await params;
  const term = glossaire.find((entry) => entry.slug === slug);
  if (!term) {
    notFound();
  }

  // Maillage : termes du glossaire, puis pages secteurs / cas d’usage. resolveRelated
  // fait disparaître silencieusement tout slug sans correspondance : jamais de lien mort.
  const relatedTerms = resolveRelated(term.relatedTerms, glossaire, "/glossaire");
  const relatedPages = [
    ...resolveRelated(term.relatedCasUsage, casUsagePages, "/cas-usage"),
    ...resolveRelated(term.relatedSecteurs, secteurs, "/secteurs"),
  ];

  // Un seul fil d’ariane : le <Breadcrumb> visible et le JSON-LD BreadcrumbList
  // partagent ce tableau. Dernier maillon sans href : c’est la page courante.
  const breadcrumb = [
    { label: "Accueil", href: "/" },
    { label: "Glossaire", href: "/glossaire" },
    { label: term.name },
  ];

  // DefinedTerm + BreadcrumbList, écrits à la main sur le modèle de spokeJsonLd
  // (lib/seo). La définition citable devient la description du terme défini.
  const url = `${siteUrl}/glossaire/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        "@id": `${url}#term`,
        name: term.name,
        description: term.definition,
        url,
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          "@id": `${siteUrl}/glossaire#set`,
          name: "L’IA sans jargon",
          url: `${siteUrl}/glossaire`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: breadcrumb.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.label,
          // item est optionnel pour la page courante (dernier maillon sans href).
          ...(crumb.href ? { item: `${siteUrl}${crumb.href}` } : {}),
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main id="contenu">
        <GlossairePageTemplate
          term={term}
          breadcrumb={breadcrumb}
          relatedTerms={relatedTerms}
          relatedPages={relatedPages}
        />
      </main>
    </>
  );
}

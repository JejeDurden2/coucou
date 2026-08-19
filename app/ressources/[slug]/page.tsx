import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CartePageTemplate } from "@/components/sections/carte-page";
import { breadcrumbGraph, pageMetadata } from "@/lib/seo";
import { ressources } from "@/content/ressources";
import { siteUrl } from "@/content/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ressources.map((ressource) => ({ slug: ressource.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = ressources.find((ressource) => ressource.slug === slug);
  if (!page) {
    return {};
  }
  return pageMetadata({
    ownOgImage: true,
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/ressources/${slug}`,
  });
}

export default async function RessourceCartePage({ params }: Params) {
  const { slug } = await params;
  const page = ressources.find((ressource) => ressource.slug === slug);
  if (!page) {
    notFound();
  }

  const breadcrumb = [
    { label: "Accueil", href: "/" },
    { label: "Ressources", href: "/ressources" },
    { label: page.name },
  ];

  // Article (la carte est un contenu éditorial signé Coucou IA) + fil d'ariane
  // + la liste des cas d'usage : la structure de la carte, lisible par les
  // moteurs et les assistants IA.
  const url = `${siteUrl}/ressources/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: page.h1,
        description: page.metaDescription,
        url,
        inLanguage: "fr-FR",
        author: {
          "@type": "Organization",
          name: "COUCOU IA",
          url: siteUrl,
        },
        publisher: {
          "@type": "Organization",
          name: "COUCOU IA",
          url: siteUrl,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#cas`,
        name: page.h1,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: page.useCases.map((useCase, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: useCase.title,
          url: `${url}#cas-${index + 1}`,
        })),
      },
      breadcrumbGraph(url, breadcrumb),
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
        <CartePageTemplate page={page} breadcrumb={breadcrumb} />
      </main>
    </>
  );
}

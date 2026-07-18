import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SecteurPageTemplate } from "@/components/sections/secteur-page";
import { pageMetadata, spokeJsonLd } from "@/lib/seo";
import { secteurs } from "@/content/secteurs";
import { casUsagePages } from "@/content/cas-usage-pages";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return secteurs.map((secteur) => ({ slug: secteur.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = secteurs.find((secteur) => secteur.slug === slug);
  if (!page) {
    return {};
  }
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/secteurs/${slug}`,
  });
}

export default async function SecteurSpokePage({ params }: Params) {
  const { slug } = await params;
  const page = secteurs.find((secteur) => secteur.slug === slug);
  if (!page) {
    notFound();
  }

  // Resolve cross-links to real cas d'usage pages; unmatched slugs drop out
  // silently (the other collection is filled in parallel).
  const relatedCasUsage = page.relatedCasUsage.flatMap((relatedSlug) => {
    const target = casUsagePages.find(
      (casUsage) => casUsage.slug === relatedSlug
    );
    return target
      ? [{ href: `/cas-usage/${target.slug}`, name: target.name }]
      : [];
  });

  const jsonLd = spokeJsonLd({
    name: page.h1,
    description: page.metaDescription,
    path: `/secteurs/${slug}`,
    breadcrumb: [
      { name: "Accueil", path: "/" },
      { name: "Secteurs", path: "/secteurs" },
      { name: page.name, path: `/secteurs/${slug}` },
    ],
    faq: page.faq,
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
        <SecteurPageTemplate page={page} relatedCasUsage={relatedCasUsage} />
      </main>
    </>
  );
}

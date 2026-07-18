import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CasUsagePageTemplate } from "@/components/sections/cas-usage-page";
import { pageMetadata, spokeJsonLd } from "@/lib/seo";
import { casUsagePages } from "@/content/cas-usage-pages";
import { secteurs } from "@/content/secteurs";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return casUsagePages.map((casUsage) => ({ slug: casUsage.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = casUsagePages.find((casUsage) => casUsage.slug === slug);
  if (!page) {
    return {};
  }
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/cas-usage/${slug}`,
  });
}

export default async function CasUsageSpokePage({ params }: Params) {
  const { slug } = await params;
  const page = casUsagePages.find((casUsage) => casUsage.slug === slug);
  if (!page) {
    notFound();
  }

  // Resolve cross-links to real secteur pages; unmatched slugs drop out
  // silently (the other collection is filled in parallel).
  const relatedSecteurs = page.relatedSecteurs.flatMap((relatedSlug) => {
    const target = secteurs.find((secteur) => secteur.slug === relatedSlug);
    return target
      ? [{ href: `/secteurs/${target.slug}`, name: target.name }]
      : [];
  });

  const jsonLd = spokeJsonLd({
    name: page.h1,
    description: page.metaDescription,
    path: `/cas-usage/${slug}`,
    breadcrumb: [
      { name: "Accueil", path: "/" },
      { name: "Cas d'usage", path: "/cas-usage" },
      { name: page.name, path: `/cas-usage/${slug}` },
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
        <CasUsagePageTemplate page={page} relatedSecteurs={relatedSecteurs} />
      </main>
    </>
  );
}

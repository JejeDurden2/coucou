import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SecteurPageTemplate } from "@/components/sections/secteur-page";
import { pageMetadata, resolveRelated, spokeJsonLd } from "@/lib/seo";
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

  const relatedCasUsage = resolveRelated(
    page.relatedCasUsage,
    casUsagePages,
    "/cas-usage"
  );

  // Un seul fil d’ariane : le <Breadcrumb> visible et le JSON-LD BreadcrumbList
  // partagent ce tableau. Dernier maillon sans href : c’est la page courante.
  const breadcrumb = [
    { label: "Accueil", href: "/" },
    { label: "Secteurs", href: "/secteurs" },
    { label: page.name },
  ];

  const jsonLd = spokeJsonLd({
    name: page.h1,
    description: page.metaDescription,
    path: `/secteurs/${slug}`,
    breadcrumb,
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
        <SecteurPageTemplate
          page={page}
          breadcrumb={breadcrumb}
          relatedCasUsage={relatedCasUsage}
        />
      </main>
    </>
  );
}

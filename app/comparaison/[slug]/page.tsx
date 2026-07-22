import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComparaisonPageTemplate } from "@/components/sections/comparaison-page";
import { pageMetadata, spokeJsonLd } from "@/lib/seo";
import { comparaisons } from "@/content/comparaisons";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return comparaisons.map((comparaison) => ({ slug: comparaison.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = comparaisons.find((comparaison) => comparaison.slug === slug);
  if (!page) {
    return {};
  }
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/comparaison/${slug}`,
  });
}

export default async function ComparaisonSpokePage({ params }: Params) {
  const { slug } = await params;
  const page = comparaisons.find((comparaison) => comparaison.slug === slug);
  if (!page) {
    notFound();
  }

  // Un seul fil d’ariane : le <Breadcrumb> visible et le JSON-LD BreadcrumbList
  // partagent ce tableau. Dernier maillon sans href : c’est la page courante.
  const breadcrumb = [
    { label: "Accueil", href: "/" },
    { label: "Comparer", href: "/comparaison" },
    { label: page.name },
  ];

  const jsonLd = spokeJsonLd({
    name: page.h1,
    description: page.metaDescription,
    path: `/comparaison/${slug}`,
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
        <ComparaisonPageTemplate page={page} breadcrumb={breadcrumb} />
      </main>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CasUsagePageTemplate } from "@/components/sections/cas-usage-page";
import { pageMetadata, resolveRelated, spokeJsonLd } from "@/lib/seo";
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

  const relatedSecteurs = resolveRelated(
    page.relatedSecteurs,
    secteurs,
    "/secteurs"
  );

  // Un seul fil d’ariane : le <Breadcrumb> visible et le JSON-LD BreadcrumbList
  // partagent ce tableau. Dernier maillon sans href : c’est la page courante.
  const breadcrumb = [
    { label: "Accueil", href: "/" },
    { label: "Cas d’usage", href: "/cas-usage" },
    { label: page.name },
  ];

  const jsonLd = spokeJsonLd({
    name: page.h1,
    description: page.metaDescription,
    path: `/cas-usage/${slug}`,
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
        <CasUsagePageTemplate
          page={page}
          breadcrumb={breadcrumb}
          relatedSecteurs={relatedSecteurs}
        />
      </main>
    </>
  );
}

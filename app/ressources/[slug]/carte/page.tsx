import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CartePageTemplate } from "@/components/sections/carte-page";
import { pageMetadata } from "@/lib/seo";
import { ressources } from "@/content/ressources";

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
  return {
    // Reutilise le meme titre/description/OG que la landing, mais cette page
    // est noindex et hors sitemap : pas de canonical vers elle-meme.
    ...pageMetadata({
      title: page.metaTitle,
      description: page.metaDescription,
      path: `/ressources/${slug}/carte`,
    }),
    alternates: undefined,
    robots: { index: false, follow: false },
  };
}

export default async function RessourceCartePage({ params }: Params) {
  const { slug } = await params;
  const page = ressources.find((ressource) => ressource.slug === slug);
  if (!page) {
    notFound();
  }

  return (
    <main id="contenu">
      <CartePageTemplate page={page} />
    </main>
  );
}

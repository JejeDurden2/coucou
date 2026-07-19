import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RessourceLandingTemplate } from "@/components/sections/ressource-landing";
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
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/ressources/${slug}`,
  });
}

export default async function RessourceSpokePage({ params }: Params) {
  const { slug } = await params;
  const page = ressources.find((ressource) => ressource.slug === slug);
  if (!page) {
    notFound();
  }

  // Landing de capture : pas de hub /ressources, le fil d'ariane reste court.
  const breadcrumb = [{ label: "Accueil", href: "/" }, { label: page.name }];

  return (
    <main id="contenu">
      <RessourceLandingTemplate page={page} breadcrumb={breadcrumb} />
    </main>
  );
}

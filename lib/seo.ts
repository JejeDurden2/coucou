import type { Metadata } from "next";

import type { Crumb } from "@/components/breadcrumb";
import { siteName, siteUrl } from "@/content/site";
import type { FaqItem } from "@/content/secteurs";

// Shared SEO helpers for the programmatic pages (hubs + spokes).
// metadataBase (app/layout.tsx) resolves the relative paths to absolute URLs.

// The metaTitle fields already carry the "| Coucou IA" brand suffix, so we set
// `title.absolute` to bypass the layout template and avoid a doubled suffix.
// `article` bascule l'openGraph en type "article" (pages /blog) : mêmes champs,
// plus les dates et l'auteur. Absent, la page reste un "website".
export function pageMetadata({
  title,
  description,
  path,
  article,
}: {
  title: string;
  description: string;
  path: string;
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    authors: string[];
  };
}): Metadata {
  const openGraph = { locale: "fr_FR", siteName, url: path, title, description };
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: article
      ? { ...openGraph, type: "article", ...article }
      : { ...openGraph, type: "website" },
  };
}

// Résout des slugs croisés vers l’autre collection (secteur <-> cas d’usage).
// Un slug sans correspondance disparaît silencieusement : jamais de lien mort.
export function resolveRelated(
  slugs: string[],
  collection: { slug: string; name: string }[],
  basePath: string
): { href: string; name: string }[] {
  return slugs.flatMap((slug) => {
    const target = collection.find((entry) => entry.slug === slug);
    return target
      ? [{ href: `${basePath}/${target.slug}`, name: target.name }]
      : [];
  });
}

// Service (provider Coucou IA) + BreadcrumbList + FAQPage, same @graph pattern
// as app/page.tsx. Stringify + escape "<" at the call site, like the home page.
// `breadcrumb` is the same array fed to the visible <Breadcrumb>.
export function spokeJsonLd({
  name,
  description,
  path,
  breadcrumb,
  faq,
}: {
  name: string;
  description: string;
  path: string;
  breadcrumb: Crumb[];
  faq: FaqItem[];
}) {
  const url = `${siteUrl}${path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name,
        description,
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
          // item est optionnel pour la page courante (dernier maillon sans href).
          ...(crumb.href ? { item: `${siteUrl}${crumb.href}` } : {}),
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

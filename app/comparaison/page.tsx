import type { Metadata } from "next";

import { Cta } from "@/components/sections/cta";
import { HubSection } from "@/components/sections/hub";
import { pageMetadata } from "@/lib/seo";
import { comparaisons, comparaisonsHub } from "@/content/comparaisons";

export const metadata: Metadata = pageMetadata({
  title: comparaisonsHub.metaTitle,
  description: comparaisonsHub.metaDescription,
  path: "/comparaison",
});

export default function ComparaisonHubPage() {
  const items = comparaisons.map((comparaison) => ({
    name: comparaison.hubTitle,
    description: comparaison.hubDescription,
    href: `/comparaison/${comparaison.slug}`,
  }));

  return (
    <main id="contenu">
      <HubSection
        breadcrumbLabel="Comparer"
        h1={comparaisonsHub.h1}
        intro={comparaisonsHub.intro}
        items={items}
      />
      <Cta placement="comparaison-hub" />
    </main>
  );
}

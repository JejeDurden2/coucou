import type { Metadata } from "next";

import { Cta } from "@/components/sections/cta";
import { HubSection } from "@/components/sections/hub";
import { pageMetadata } from "@/lib/seo";
import { glossaire, glossaireHub } from "@/content/glossaire";

export const metadata: Metadata = pageMetadata({
  title: glossaireHub.metaTitle,
  description: glossaireHub.metaDescription,
  path: "/glossaire",
});

export default function GlossaireHubPage() {
  // Chaque carte porte le terme et sa définition citable d’une ligne.
  const items = glossaire.map((term) => ({
    name: term.name,
    description: term.definition,
    href: `/glossaire/${term.slug}`,
  }));

  return (
    <main id="contenu">
      <HubSection
        breadcrumbLabel="Glossaire"
        h1={glossaireHub.h1}
        intro={glossaireHub.intro}
        items={items}
      />
      <Cta placement="glossaire-hub" />
    </main>
  );
}

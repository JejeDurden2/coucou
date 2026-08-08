import type { Metadata } from "next";

import { Cta } from "@/components/sections/cta";
import { HubSection } from "@/components/sections/hub";
import { pageMetadata } from "@/lib/seo";
import { ressources, ressourcesHub } from "@/content/ressources";

export const metadata: Metadata = pageMetadata({
  title: ressourcesHub.metaTitle,
  description: ressourcesHub.metaDescription,
  path: "/ressources",
});

export default function RessourcesHubPage() {
  const items = ressources.map((ressource) => ({
    name: ressource.name,
    description: ressource.intro,
    href: `/ressources/${ressource.slug}`,
  }));

  return (
    <main id="contenu">
      <HubSection
        breadcrumbLabel="Ressources"
        h1={ressourcesHub.h1}
        intro={ressourcesHub.intro}
        items={items}
      />
      <Cta placement="ressources-hub" />
    </main>
  );
}

import type { Metadata } from "next";

import { Cta } from "@/components/sections/cta";
import { HubSection } from "@/components/sections/hub";
import { pageMetadata } from "@/lib/seo";
import { secteurs, secteursHub } from "@/content/secteurs";

export const metadata: Metadata = pageMetadata({
  title: secteursHub.metaTitle,
  description: secteursHub.metaDescription,
  path: "/secteurs",
});

export default function SecteursHubPage() {
  const items = secteurs.map((secteur) => ({
    name: secteur.name,
    description: secteur.intro,
    href: `/secteurs/${secteur.slug}`,
  }));

  return (
    <main id="contenu">
      <HubSection
        breadcrumbLabel="Secteurs"
        h1={secteursHub.h1}
        intro={secteursHub.intro}
        items={items}
      />
      <Cta />
    </main>
  );
}

import type { Metadata } from "next";

import { Cta } from "@/components/sections/cta";
import { HubSection } from "@/components/sections/hub";
import { pageMetadata } from "@/lib/seo";
import { outilsHub } from "@/content/outils";

export const metadata: Metadata = pageMetadata({
  title: outilsHub.metaTitle,
  description: outilsHub.metaDescription,
  path: "/outils",
});

export default function OutilsHubPage() {
  return (
    <main id="contenu">
      <HubSection
        breadcrumbLabel="Outils"
        h1={outilsHub.h1}
        intro={outilsHub.intro}
        items={outilsHub.items}
      />
      <Cta placement="outils-hub" />
    </main>
  );
}

import type { Metadata } from "next";

import { Cta } from "@/components/sections/cta";
import { HubSection } from "@/components/sections/hub";
import { pageMetadata } from "@/lib/seo";
import { casUsageHub, casUsagePages } from "@/content/cas-usage-pages";

export const metadata: Metadata = pageMetadata({
  title: casUsageHub.metaTitle,
  description: casUsageHub.metaDescription,
  path: "/cas-usage",
});

export default function CasUsageHubPage() {
  const items = casUsagePages.map((casUsage) => ({
    name: casUsage.name,
    description: casUsage.intro,
    href: `/cas-usage/${casUsage.slug}`,
  }));

  return (
    <main id="contenu">
      <HubSection
        breadcrumbLabel="Cas d'usage"
        h1={casUsageHub.h1}
        intro={casUsageHub.intro}
        items={items}
      />
      <Cta />
    </main>
  );
}

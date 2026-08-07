import type { Metadata } from "next";

import { Cta } from "@/components/sections/cta";
import { HubSection } from "@/components/sections/hub";
import { pageMetadata } from "@/lib/seo";
import { agents, agentsHub } from "@/content/agents";

export const metadata: Metadata = pageMetadata({
  title: agentsHub.metaTitle,
  description: agentsHub.metaDescription,
  path: "/agents-ia",
});

export default function AgentsIaHubPage() {
  const items = agents.map((agent) => ({
    name: agent.hubTitle,
    description: agent.hubDescription,
    href: `/agents-ia/${agent.slug}`,
  }));

  return (
    <main id="contenu">
      <HubSection
        breadcrumbLabel="Agents IA"
        h1={agentsHub.h1}
        intro={agentsHub.intro}
        items={items}
      />
      <Cta placement="agents-ia-hub" />
    </main>
  );
}

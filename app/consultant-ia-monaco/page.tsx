import type { Metadata } from "next";

import { VillePageTemplate } from "@/components/sections/ville-page";
import { getVille } from "@/content/villes";
import { pageMetadata } from "@/lib/seo";

const ville = getVille("consultant-ia-monaco");

export const metadata: Metadata = pageMetadata({
  title: ville.metaTitle,
  description: ville.metaDescription,
  path: `/${ville.slug}`,
});

export default function ConsultantIaMonacoPage() {
  return <VillePageTemplate ville={ville} />;
}

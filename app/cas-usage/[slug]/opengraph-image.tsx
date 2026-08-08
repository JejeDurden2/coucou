import { casUsagePages } from "@/content/cas-usage-pages";
import { tagline } from "@/content/site";
import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Coucou IA";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = casUsagePages.find((entry) => entry.slug === slug);
  return ogImage(page?.h1 ?? tagline);
}

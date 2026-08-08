import { secteurs } from "@/content/secteurs";
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
  const page = secteurs.find((entry) => entry.slug === slug);
  return ogImage(page?.h1 ?? tagline);
}

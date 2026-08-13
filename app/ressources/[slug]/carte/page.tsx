import { permanentRedirect } from "next/navigation";

// L'ancienne URL gated (/ressources/[slug]/carte) redirige vers la carte,
// devenue la page publique /ressources/[slug]. Conservée pour les liens déjà
// envoyés par email.
export default async function LegacyCarteRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/ressources/${slug}`);
}

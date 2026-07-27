"use server";

// Server action de capture email pour les landings /ressources/[slug].
// Signature imposee par useActionState : (prevState, formData). Le slug
// voyage dans un champ cache du formulaire (voir components/ressource-form.tsx).

// Le lead entre dans la campagne nurture Lemlist du secteur : l'etape 1
// (delai 0) livre la carte par email, les relances J+3 / J+10 / J+21 suivent.
// L'envoi respecte le planning de la campagne (heures ouvrees) : la page de
// succes donne de toute facon l'acces direct a la carte.

import { captureLead, type SubscribeState } from "@/lib/lemlist";
import { ressources } from "@/content/ressources";

export type { SubscribeState } from "@/lib/lemlist";

export async function subscribeRessource(
  _prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const slug = formData.get("slug");
  const ressource = typeof slug === "string" ? ressources.find((entry) => entry.slug === slug) : undefined;
  if (!ressource) {
    return { status: "error", error: "server" };
  }

  return captureLead(formData, ressource.lemlistCampaignId, ressource.slug);
}

"use server";

// Server action de l'opt-in email en fin de carte (/ressources/[slug]).
// Signature imposee par useActionState : (prevState, formData). Le slug
// voyage dans un champ cache du formulaire (voir components/ressource-form.tsx).

// Le lead entre dans la liste nurture Brevo du secteur : l'automation envoie
// le lien de la carte par email (etape 0), puis les trois conseils
// d'application (.agents/nurture.md). La carte reste en acces libre : l'email
// n'est jamais une barriere.

import { captureLead, type SubscribeState } from "@/lib/brevo";
import { ressources } from "@/content/ressources";

export type { SubscribeState } from "@/lib/brevo";

export async function subscribeRessource(
  _prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const slug = formData.get("slug");
  const ressource = typeof slug === "string" ? ressources.find((entry) => entry.slug === slug) : undefined;
  if (!ressource) {
    return { status: "error", error: "server" };
  }

  return captureLead(formData, ressource.brevoListId, ressource.slug);
}

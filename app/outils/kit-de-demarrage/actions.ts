"use server";

// Server action de capture email du kit de démarrage (/outils/kit-de-demarrage).
// Signature imposee par useActionState : (prevState, formData). Les reponses du
// visiteur voyagent dans des champs caches (voir components/kit-form.tsx) et
// partent en variables Lemlist : le lead arrive deja qualifie.

import { captureLead, type SubscribeState } from "@/lib/lemlist";
import { kitLemlistCampaignId, kitQuestions } from "@/content/kit";

// Les libelles de reponse viennent du formulaire : on les borne avant de les
// pousser chez Lemlist.
const MAX_VARIABLE = 120;

export async function subscribeKit(
  _prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const variables: Record<string, string> = {};
  for (const question of kitQuestions) {
    const value = formData.get(question.id);
    if (typeof value === "string" && value && value.length <= MAX_VARIABLE) {
      variables[question.id] = value;
    }
  }

  const rawFirstName = formData.get("firstName");
  const firstName =
    typeof rawFirstName === "string" && rawFirstName.trim().length > 0
      ? rawFirstName.trim().slice(0, 80)
      : undefined;

  return captureLead(formData, kitLemlistCampaignId, "kit-de-demarrage", { firstName, variables });
}

"use server";

// Server action de capture email du kit de démarrage (/outils/kit-de-demarrage).
// Signature imposee par useActionState : (prevState, formData). Les reponses du
// visiteur voyagent dans des champs caches (voir components/kit-form.tsx) et
// partent regroupees dans l'attribut NOTES du contact Brevo : le lead arrive
// deja qualifie, sans creer un attribut par question (voir lib/brevo.ts).

import { captureLead, type SubscribeState } from "@/lib/brevo";
import { kitBrevoListId, kitQuestions } from "@/content/kit";

// Les libelles de reponse viennent du formulaire : on les borne avant de les
// pousser chez Brevo.
const MAX_VARIABLE = 120;
const MAX_NOTES = 2000;

export async function subscribeKit(
  _prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const lines: string[] = [];
  for (const question of kitQuestions) {
    const value = formData.get(question.id);
    if (typeof value === "string" && value && value.length <= MAX_VARIABLE) {
      lines.push(`${question.label} ${value}`);
    }
  }
  const notes = lines.join("\n").slice(0, MAX_NOTES) || undefined;

  const rawFirstName = formData.get("firstName");
  const firstName =
    typeof rawFirstName === "string" && rawFirstName.trim().length > 0
      ? rawFirstName.trim().slice(0, 80)
      : undefined;

  return captureLead(formData, kitBrevoListId, "kit-de-demarrage", { firstName, notes });
}

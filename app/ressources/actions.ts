"use server";

// Server action de capture email pour les landings /ressources/[slug].
// Signature imposee par useActionState : (prevState, formData). Le slug
// voyage dans un champ cache du formulaire (voir components/ressource-form.tsx).

import { ressources } from "@/content/ressources";

export type SubscribeState = {
  status: "idle" | "success" | "error";
  error?: "invalid" | "server";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Le lead entre dans la campagne nurture Lemlist du secteur : l'etape 1
// (delai 0) livre la carte par email, les relances J+3 / J+10 / J+21 suivent.
// L'envoi respecte le planning de la campagne (heures ouvrees) : la page de
// succes donne de toute facon l'acces direct a la carte.
async function addToLemlist(apiKey: string, campaignId: string, email: string): Promise<void> {
  const res = await fetch(
    `https://api.lemlist.com/api/campaigns/${campaignId}/leads/${encodeURIComponent(email)}?deduplicate=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    }
  );
  // Re-soumission du meme email : Lemlist repond 400 "Lead already in the
  // campaign", le prospect a deja sa sequence, c'est un succes.
  if (!res.ok && res.status !== 400) {
    throw new Error(`Lemlist a repondu ${res.status}`);
  }
}

export async function subscribeRessource(
  _prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  // Honeypot rempli : silence complet, succes simule, on ne repond jamais au bot.
  if (formData.get("website")) {
    return { status: "success" };
  }

  const email = formData.get("email");
  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email)) {
    return { status: "error", error: "invalid" };
  }

  const slug = formData.get("slug");
  const ressource = typeof slug === "string" ? ressources.find((entry) => entry.slug === slug) : undefined;
  if (!ressource) {
    return { status: "error", error: "server" };
  }

  const apiKey = process.env.LEMLIST_API_KEY;

  if (apiKey) {
    try {
      await addToLemlist(apiKey, ressource.lemlistCampaignId, email);
      return { status: "success" };
    } catch (error) {
      // ponytail: Lemlist en panne ne doit jamais bloquer le prospect, la carte
      // reste accessible depuis la page de succes. Le lead reste visible dans
      // les logs Vercel : chercher "lead-alerte".
      console.error(`[lead-alerte] ${email} -> ${ressource.slug}`, error);
      return { status: "success" };
    }
  }

  // ponytail: pas de cle Lemlist configuree (dev local ou prod pas encore branchee) :
  // le lead part quand meme dans les logs Vercel plutot que de rester perdu.
  console.error(`[lead-alerte] LEMLIST_API_KEY absente, lead non traite : ${email} -> ${ressource.slug}`);
  return { status: "success" };
}

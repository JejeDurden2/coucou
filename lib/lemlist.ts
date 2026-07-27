// Capture de lead vers une campagne Lemlist. Partagé par les server actions
// (/ressources/[slug] et /outils/kit-de-demarrage) : une seule copie du
// honeypot, de la validation email, de l'appel HTTP et du repli en cas de panne.
// Serveur uniquement : ce module lit la clé d'API et n'est jamais importé côté
// client (les imports de type seuls sont effacés à la compilation).

export type SubscribeState = {
  status: "idle" | "success" | "error";
  error?: "invalid" | "server";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Champs optionnels du lead. `variables` alimente les variables personnalisées
// de la campagne (Lemlist les attend à la racine du corps de la requête).
export type LemlistLead = {
  firstName?: string;
  variables?: Record<string, string>;
};

async function addToLemlist(
  apiKey: string,
  campaignId: string,
  email: string,
  lead: LemlistLead
): Promise<void> {
  const body: Record<string, string> = { ...lead.variables };
  if (lead.firstName) {
    body.firstName = lead.firstName;
  }

  const res = await fetch(
    `https://api.lemlist.com/api/campaigns/${campaignId}/leads/${encodeURIComponent(email)}?deduplicate=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  // Re-soumission du meme email : Lemlist repond 400 "Lead already in the
  // campaign", le prospect a deja sa sequence, c'est un succes.
  if (!res.ok && res.status !== 400) {
    throw new Error(`Lemlist a repondu ${res.status}`);
  }
}

export async function captureLead(
  formData: FormData,
  campaignId: string,
  logTag: string,
  lead: LemlistLead = {}
): Promise<SubscribeState> {
  // Honeypot rempli : silence complet, succes simule, on ne repond jamais au bot.
  if (formData.get("website")) {
    return { status: "success" };
  }

  const email = formData.get("email");
  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email)) {
    return { status: "error", error: "invalid" };
  }

  const apiKey = process.env.LEMLIST_API_KEY;

  // ponytail: pas de cle Lemlist configuree (dev local ou prod pas encore
  // branchee) : le lead part quand meme dans les logs Vercel plutot que de
  // rester perdu.
  if (!apiKey) {
    console.error(`[lead-alerte] LEMLIST_API_KEY absente, lead non traite : ${email} -> ${logTag}`, lead);
    return { status: "success" };
  }

  try {
    await addToLemlist(apiKey, campaignId, email, lead);
  } catch (error) {
    // ponytail: Lemlist en panne ne doit jamais bloquer le prospect, le contenu
    // reste accessible. Le lead reste visible dans les logs Vercel : chercher
    // "lead-alerte".
    console.error(`[lead-alerte] ${email} -> ${logTag}`, lead, error);
  }
  return { status: "success" };
}

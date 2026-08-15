// Capture de lead vers une liste Brevo. Partagé par les server actions
// (/ressources/[slug] et /outils/kit-de-demarrage) : une seule copie du
// honeypot, de la validation email, de l'appel HTTP et du repli en cas de panne.
// Serveur uniquement : ce module lit la clé d'API et n'est jamais importé côté
// client (les imports de type seuls sont effacés à la compilation).

export type SubscribeState = {
  status: "idle" | "success" | "error";
  error?: "invalid" | "server";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Frontière d'entrée des server actions : un champ de formulaire vaut un texte,
// un fichier ou rien. Seul le texte a un sens ici, le reste devient `undefined`.
export function champTexte(formData: FormData, nom: string): string | undefined {
  const valeur = formData.get(nom);
  return valeur === null || valeur instanceof File ? undefined : valeur;
}

// Champs optionnels du lead. Brevo n'accepte que des attributs déclarés à
// l'avance dans le compte (contrairement à Lemlist) : `notes` regroupe donc
// toutes les réponses du visiteur dans un seul attribut texte libre (NOTES),
// plutôt qu'un attribut par question. Une nouvelle question du kit part
// d'elle-même dans ce texte, sans jamais toucher au schéma Brevo.
export type BrevoLead = {
  firstName?: string;
  notes?: string;
};

async function addToBrevo(
  apiKey: string,
  listId: number,
  email: string,
  lead: BrevoLead
): Promise<void> {
  const attributes: Record<string, string> = {};
  if (lead.firstName) {
    attributes.PRENOM = lead.firstName;
  }
  if (lead.notes) {
    attributes.NOTES = lead.notes;
  }

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      attributes,
      listIds: [listId],
      // Upsert : un lead déjà connu rejoint simplement la nouvelle liste
      // (Brevo répond alors 204 au lieu de 201, les deux sont un succès).
      updateEnabled: true,
    }),
  });
  if (!res.ok) {
    throw new Error(`Brevo a repondu ${res.status}`);
  }
}

export async function captureLead(
  formData: FormData,
  listId: number,
  logTag: string,
  lead: BrevoLead = {}
): Promise<SubscribeState> {
  // Honeypot rempli : silence complet, succes simule, on ne repond jamais au bot.
  if (formData.get("website")) {
    return { status: "success" };
  }

  const email = champTexte(formData, "email");
  if (email === undefined || email.length > 254 || !EMAIL_RE.test(email)) {
    return { status: "error", error: "invalid" };
  }

  const apiKey = process.env.BREVO_API_KEY;

  // ponytail: pas de cle Brevo configuree (dev local ou prod pas encore
  // branchee) : le lead part quand meme dans les logs Vercel plutot que de
  // rester perdu.
  if (!apiKey) {
    console.error(`[lead-alerte] BREVO_API_KEY absente, lead non traite : ${email} -> ${logTag}`, lead);
    return { status: "success" };
  }

  try {
    await addToBrevo(apiKey, listId, email, lead);
  } catch (error) {
    // ponytail: Brevo en panne ne doit jamais bloquer le prospect, le contenu
    // reste accessible. Le lead reste visible dans les logs Vercel : chercher
    // "lead-alerte".
    console.error(`[lead-alerte] ${email} -> ${logTag}`, lead, error);
  }
  return { status: "success" };
}

// Webhook Cal.com : rend chaque reservation visible cote Coucou IA
// (marqueur [rdv] dans les logs Vercel) et stoppe les automations Brevo du
// prospect qui reserve (l'arret automatique promis par .agents/nurture.md ;
// Cal.com notifie deja le fondateur par email, pas besoin de doublon).
// Configuration cote Cal.com : Settings > Developer > Webhooks, URL
// https://coucou-ia.com/api/cal-webhook, evenement BOOKING_CREATED, secret
// identique a la variable d'environnement CAL_WEBHOOK_SECRET (Vercel).

import { createHmac, timingSafeEqual } from "node:crypto";
import { ressources } from "@/content/ressources";
import { kitBrevoListId } from "@/content/kit";

// Listes Brevo "Outbound" (prospection email, montees a la main dans Brevo,
// hors code du site).
const OUTBOUND_LIST_IDS = [6, 7]; // expertise comptable, industrie

// Toutes les listes dont un lead qui reserve doit sortir : chaque automation
// Brevo doit avoir sa condition de sortie reglee sur "retire de la liste"
// (checklist-semaine-1.md) pour que ce retrait stoppe vraiment ses relances.
const ALL_LIST_IDS = [...ressources.map((r) => r.brevoListId), kitBrevoListId, ...OUTBOUND_LIST_IDS];

type CalPayload = {
  triggerEvent?: string;
  payload?: {
    title?: string;
    startTime?: string;
    attendees?: { name?: string; email?: string }[];
    responses?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };
};

function signatureValide(body: string, signature: string, secret: string): boolean {
  const attendu = createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(attendu);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();

  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (secret) {
    const signature = request.headers.get("x-cal-signature-256") ?? "";
    if (!signatureValide(body, signature, secret)) {
      return new Response("signature invalide", { status: 401 });
    }
  }

  let data: CalPayload;
  try {
    data = JSON.parse(body) as CalPayload;
  } catch {
    return new Response("corps illisible", { status: 400 });
  }

  const evenement = data.triggerEvent ?? "inconnu";
  const rdv = data.payload ?? {};
  const invite = rdv.attendees?.[0];
  const resume = {
    evenement,
    invite: invite ? `${invite.name ?? "?"} <${invite.email ?? "?"}>` : "?",
    debut: rdv.startTime ?? "?",
    titre: rdv.title ?? "?",
    reponses: rdv.responses ?? {},
    metadata: rdv.metadata ?? {},
  };

  // ponytail: le log est la source de verite (grep "[rdv]" dans Vercel),
  // l'arret Brevo est un best-effort par-dessus.
  console.log(`[rdv] ${JSON.stringify(resume)}`);

  const apiKey = process.env.BREVO_API_KEY;
  const emailInvite = invite?.email;
  if (apiKey && emailInvite && evenement === "BOOKING_CREATED") {
    try {
      // Retire le lead de toutes les listes Brevo : ses automations
      // (outbound comme nurture) s'arretent des que chacune sort le contact
      // qui quitte sa liste declencheuse.
      const res = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(emailInvite)}`, {
        method: "PUT",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ unlinkListIds: ALL_LIST_IDS }),
      });
      // 404 = le prospect n'etait dans aucune liste (venu directement par Cal.com) : normal.
      if (!res.ok && res.status !== 404) {
        throw new Error(`Brevo a repondu ${res.status}`);
      }
    } catch (error) {
      console.error("[rdv] arret des automations Brevo en echec", error);
    }
  }

  return new Response("ok");
}

// Webhook Cal.com : rend chaque reservation visible cote Coucou IA
// (marqueur [rdv] dans les logs Vercel) et stoppe les sequences Lemlist du
// prospect qui reserve (l'arret automatique promis par .agents/nurture.md ;
// Cal.com notifie deja le fondateur par email, pas besoin de doublon).
// Configuration cote Cal.com : Settings > Developer > Webhooks, URL
// https://coucou-ia.com/api/cal-webhook, evenement BOOKING_CREATED, secret
// identique a la variable d'environnement CAL_WEBHOOK_SECRET (Vercel).

import { createHmac, timingSafeEqual } from "node:crypto";

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
  // l'arret Lemlist est un best-effort par-dessus.
  console.log(`[rdv] ${JSON.stringify(resume)}`);

  const apiKey = process.env.LEMLIST_API_KEY;
  const emailInvite = invite?.email;
  if (apiKey && emailInvite && evenement === "BOOKING_CREATED") {
    try {
      // Marque le lead "interessé" dans toutes ses campagnes Lemlist :
      // ses sequences (outbound comme nurture) s'arretent immediatement.
      const res = await fetch(
        `https://api.lemlist.com/api/leads/interested/${encodeURIComponent(emailInvite)}`,
        {
          method: "POST",
          headers: { Authorization: `Basic ${Buffer.from(`:${apiKey}`).toString("base64")}` },
        }
      );
      // 404 = le prospect n'etait dans aucune campagne (venu par le site) : normal.
      if (!res.ok && res.status !== 404) {
        throw new Error(`Lemlist a repondu ${res.status}`);
      }
    } catch (error) {
      console.error("[rdv] arret des sequences Lemlist en echec", error);
    }
  }

  return new Response("ok");
}

// Webhook Cal.com : rend chaque reservation visible cote Coucou IA
// (marqueur [rdv] dans les logs Vercel + email de notification via Brevo).
// Configuration cote Cal.com : Settings > Developer > Webhooks, URL
// https://coucou-ia.com/api/cal-webhook, evenement BOOKING_CREATED, secret
// identique a la variable d'environnement CAL_WEBHOOK_SECRET (Vercel).

import { createHmac, timingSafeEqual } from "node:crypto";

import { contactEmail } from "@/content/site";

const BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

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
  // l'email Brevo est un confort best-effort par-dessus.
  console.log(`[rdv] ${JSON.stringify(resume)}`);

  const apiKey = process.env.BREVO_API_KEY;
  if (apiKey && evenement === "BOOKING_CREATED") {
    try {
      await fetch(BREVO_EMAIL_URL, {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender: { name: "Site Coucou IA", email: contactEmail },
          to: [{ email: contactEmail }],
          subject: `[rdv] ${resume.invite} : ${resume.debut}`,
          htmlContent: `<p>Point de départ réservé.</p><pre>${JSON.stringify(resume, null, 2)
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</pre>`,
        }),
      });
    } catch (error) {
      console.error("[rdv] notification Brevo en echec", error);
    }
  }

  return new Response("ok");
}

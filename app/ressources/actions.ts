"use server";

// Server action de capture email pour les landings /ressources/[slug].
// Signature imposee par useActionState : (prevState, formData). Le slug
// voyage dans un champ cache du formulaire (voir components/ressource-form.tsx).

import { contactEmail, siteUrl } from "@/content/site";
import { ressources, ressourcesShared } from "@/content/ressources";

export type SubscribeState = {
  status: "idle" | "success" | "error";
  error?: "invalid" | "server";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";
const BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

// Le corps de l'email (paragraphes separes par une ligne vide dans
// content/ressources.ts, du contenu maison : pas d'echappement necessaire)
// enveloppe en <p>, plus le lien direct vers la carte.
function bodyToHtml(body: string, carteUrl: string): string {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.trim()}</p>`)
    .join("");
  return `${paragraphs}<p><a href="${carteUrl}">${ressourcesShared.successCarteLabel}</a></p>`;
}

async function sendViaBrevo(
  apiKey: string,
  email: string,
  slug: string,
  subject: string,
  htmlContent: string
): Promise<void> {
  const headers = {
    "api-key": apiKey,
    "Content-Type": "application/json",
    accept: "application/json",
  };

  const contactRes = await fetch(BREVO_CONTACTS_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, attributes: { RESSOURCE: slug }, updateEnabled: true }),
  });
  if (!contactRes.ok) {
    throw new Error(`Brevo contacts a repondu ${contactRes.status}`);
  }

  const emailRes = await fetch(BREVO_EMAIL_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      sender: { name: "Jérôme, Coucou IA", email: contactEmail },
      to: [{ email }],
      subject,
      htmlContent,
    }),
  });
  if (!emailRes.ok) {
    throw new Error(`Brevo smtp/email a repondu ${emailRes.status}`);
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

  const carteUrl = `${siteUrl}/ressources/${ressource.slug}/carte`;
  const apiKey = process.env.BREVO_API_KEY;

  if (apiKey) {
    try {
      await sendViaBrevo(
        apiKey,
        email,
        ressource.slug,
        ressource.email.subject,
        bodyToHtml(ressource.email.body, carteUrl)
      );
      return { status: "success" };
    } catch (error) {
      // ponytail: Brevo en panne ne doit jamais bloquer le prospect, la carte
      // reste accessible depuis la page de succes. Le lead vit dans les logs
      // Vercel en attendant une relance manuelle ou un fix d'infra Brevo.
      console.error(`[lead] ${email} -> ${ressource.slug}`, error);
      return { status: "success" };
    }
  }

  // ponytail: pas de cle Brevo configuree (dev local ou prod pas encore branchee) :
  // le lead part quand meme dans les logs Vercel plutot que de rester perdu.
  console.log(`[lead] ${email} -> ${ressource.slug}`);
  return { status: "success" };
}

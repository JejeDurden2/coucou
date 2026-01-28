import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface DunningFirstEmailData {
  userName: string;
  planName: 'SOLO' | 'PRO';
  billingUrl: string;
}

export function generateDunningFirstEmail(data: DunningFirstEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading("Votre paiement n'a pas abouti", 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`Le paiement de votre abonnement <strong>${data.planName}</strong> n'a pas pu être traité. Veuillez mettre à jour vos informations de paiement pour continuer à bénéficier de toutes les fonctionnalités de votre plan.`)}

    ${createButton('Mettre à jour mon moyen de paiement', data.billingUrl)}

    <p style="margin: 24px 0 0; font-size: 13px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      Des questions ? Répondez directement à cet email.
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Votre paiement pour le plan ${data.planName} n'a pas abouti.`,
  });

  const text = `
Votre paiement n'a pas abouti

Bonjour ${data.userName},

Le paiement de votre abonnement ${data.planName} n'a pas pu être traité. Veuillez mettre à jour vos informations de paiement pour continuer à bénéficier de toutes les fonctionnalités de votre plan.

Mettre à jour mon moyen de paiement : ${data.billingUrl}

Des questions ? Répondez directement à cet email.

--
Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

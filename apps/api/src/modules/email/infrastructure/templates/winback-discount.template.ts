import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  createInfoBox,
  EMAIL_COLORS,
} from './base.template';

export interface WinbackDiscountEmailData {
  firstName: string;
  previousPlan: 'SOLO' | 'PRO';
  checkoutUrl: string;
  unsubscribeUrl: string;
}

export function generateWinbackDiscountEmail(data: WinbackDiscountEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Offre spéciale : -20% pendant 3 mois', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph('Votre visibilité IA nous tient à cœur. Pour vous aider à reprendre le monitoring de votre marque, nous vous offrons une réduction exclusive.')}

    ${createInfoBox(
      `<p style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: ${EMAIL_COLORS.text};">-20% sur votre abonnement ${data.previousPlan}</p>
      <p style="margin: 0; font-size: 14px; color: ${EMAIL_COLORS.text};">Pendant 3 mois, profitez de toutes les fonctionnalités du plan ${data.previousPlan} à prix réduit.</p>`,
      'success',
    )}

    ${createButton('Réactiver mon abonnement — -20%', data.checkoutUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Offre spéciale : -20% sur votre abonnement ${data.previousPlan} pendant 3 mois.`,
  });

  const text = `
Offre spéciale : -20% sur votre abonnement Coucou IA pendant 3 mois

Bonjour ${data.firstName},

Votre visibilité IA nous tient à cœur. Pour vous aider à reprendre le monitoring de votre marque, nous vous offrons une réduction exclusive.

-20% sur votre abonnement ${data.previousPlan}
Pendant 3 mois, profitez de toutes les fonctionnalités du plan ${data.previousPlan} à prix réduit.

Réactiver mon abonnement — -20% : ${data.checkoutUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  createInfoBox,
  EMAIL_COLORS,
} from './base.template';

export interface DunningFinalEmailData {
  userName: string;
  planName: 'SOLO' | 'PRO';
  billingUrl: string;
}

export function generateDunningFinalEmail(data: DunningFinalEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading(`Dernier rappel avant suspension`, 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createInfoBox(
      `<p style="margin: 0; font-size: 14px; color: ${EMAIL_COLORS.text};"><strong>Sans action de votre part dans les prochains jours, votre compte sera rétrogradé au plan Gratuit.</strong></p>
      <ul style="margin: 12px 0 0; padding-left: 20px; color: ${EMAIL_COLORS.text}; font-size: 14px; line-height: 1.8;">
        <li>Vos analyses automatiques seront désactivées</li>
        <li>Vos données au-delà de 30 jours ne seront plus accessibles</li>
        <li>Vos projets et requêtes au-delà des limites du plan Gratuit seront archivés</li>
      </ul>`,
      'warning',
    )}

    ${createParagraph('Mettez à jour votre moyen de paiement pour conserver votre abonnement et toutes vos données.')}

    ${createButton('Conserver mon abonnement', data.billingUrl)}

    <p style="margin: 24px 0 0; font-size: 13px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      Des questions ? Répondez directement à cet email.
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Dernier rappel : votre compte ${data.planName} sera suspendu sans action de votre part.`,
  });

  const text = `
Dernier rappel avant suspension de votre compte ${data.planName}

Bonjour ${data.userName},

Sans action de votre part dans les prochains jours, votre compte sera rétrogradé au plan Gratuit.

- Vos analyses automatiques seront désactivées
- Vos données au-delà de 30 jours ne seront plus accessibles
- Vos projets et requêtes au-delà des limites du plan Gratuit seront archivés

Mettez à jour votre moyen de paiement pour conserver votre abonnement et toutes vos données.

Conserver mon abonnement : ${data.billingUrl}

Des questions ? Répondez directement à cet email.

--
Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

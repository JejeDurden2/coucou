import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface PostUpgradeTipsEmailData {
  firstName: string;
  planName: 'SOLO' | 'PRO';
  dashboardUrl: string;
  unsubscribeUrl: string;
}

export function generatePostUpgradeTipsEmail(data: PostUpgradeTipsEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('3 astuces pour maximiser votre visibilité IA', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph(`Vous utilisez le plan <strong>${data.planName}</strong> depuis quelques jours. Voici 3 astuces pour en tirer le maximum :`)}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      <tr>
        <td style="padding: 16px; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px; margin-bottom: 12px;">
          <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: ${EMAIL_COLORS.primary};">1. Variez vos requêtes</p>
          <p style="margin: 0; font-size: 14px; color: ${EMAIL_COLORS.text}; line-height: 1.6;">Incluez des requêtes d'intention d'achat, de comparaison et de découverte pour couvrir tout le parcours utilisateur.</p>
        </td>
      </tr>
      <tr><td style="height: 12px;"></td></tr>
      <tr>
        <td style="padding: 16px; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px;">
          <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: ${EMAIL_COLORS.primary};">2. Surveillez vos concurrents</p>
          <p style="margin: 0; font-size: 14px; color: ${EMAIL_COLORS.text}; line-height: 1.6;">L'onglet concurrents montre qui apparaît à côté de vous dans les réponses IA.</p>
        </td>
      </tr>
      <tr><td style="height: 12px;"></td></tr>
      <tr>
        <td style="padding: 16px; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px;">
          <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: ${EMAIL_COLORS.primary};">3. Consultez les recommandations</p>
          <p style="margin: 0; font-size: 14px; color: ${EMAIL_COLORS.text}; line-height: 1.6;">Des suggestions personnalisées pour améliorer votre visibilité IA.</p>
        </td>
      </tr>
    </table>

    ${createButton('Voir mes recommandations', data.dashboardUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: '3 astuces pour maximiser votre visibilité IA avec Coucou IA.',
  });

  const text = `
3 astuces pour maximiser votre visibilité IA

Bonjour ${data.firstName},

Vous utilisez le plan ${data.planName} depuis quelques jours. Voici 3 astuces pour en tirer le maximum :

1. Variez vos requêtes
Incluez des requêtes d'intention d'achat, de comparaison et de découverte pour couvrir tout le parcours utilisateur.

2. Surveillez vos concurrents
L'onglet concurrents montre qui apparaît à côté de vous dans les réponses IA.

3. Consultez les recommandations
Des suggestions personnalisées pour améliorer votre visibilité IA.

Voir mes recommandations : ${data.dashboardUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

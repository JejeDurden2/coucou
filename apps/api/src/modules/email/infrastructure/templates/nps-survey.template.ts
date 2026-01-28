import { wrapInBaseTemplate, createParagraph, createHeading, EMAIL_COLORS } from './base.template';

export interface NpsSurveyEmailData {
  firstName: string;
  surveyUrl: string;
  unsubscribeUrl: string;
}

export function generateNpsSurveyEmail(data: NpsSurveyEmailData): {
  html: string;
  text: string;
} {
  const scoreButtons = Array.from({ length: 11 }, (_, i) => {
    const bgColor =
      i <= 6 ? EMAIL_COLORS.destructive : i <= 8 ? EMAIL_COLORS.warning : EMAIL_COLORS.success;
    return `<td style="padding: 2px;">
              <a href="${data.surveyUrl}?score=${i}" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; text-align: center; background-color: ${bgColor}; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 6px;">${i}</a>
            </td>`;
  }).join('\n            ');

  const content = `
    ${createHeading('Que pensez-vous de Coucou IA ?', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph('Vous utilisez Coucou IA depuis un mois. Nous aimerions connaître votre avis.')}

    ${createParagraph('<strong>Sur une échelle de 0 à 10, quelle est la probabilité que vous recommandiez Coucou IA à un collègue ?</strong>')}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" style="border-collapse: collapse;">
            <tr>
            ${scoreButtons}
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-top: 8px;">
          <table role="presentation" style="width: 100%; max-width: 420px; border-collapse: collapse;">
            <tr>
              <td style="font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: left;">Pas du tout probable</td>
              <td style="font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: right;">Très probable</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${createParagraph('Votre avis nous aide à améliorer Coucou IA. Merci !', { muted: true })}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Que pensez-vous de Coucou IA ? Donnez votre avis en un clic.',
  });

  const scoreLinks = Array.from(
    { length: 11 },
    (_, i) => `${i} : ${data.surveyUrl}?score=${i}`,
  ).join('\n');

  const text = `
Que pensez-vous de Coucou IA ?

Bonjour ${data.firstName},

Vous utilisez Coucou IA depuis un mois. Nous aimerions connaître votre avis.

Sur une échelle de 0 à 10, quelle est la probabilité que vous recommandiez Coucou IA à un collègue ?

${scoreLinks}

Votre avis nous aide à améliorer Coucou IA. Merci !

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

import {
  wrapInBaseTemplate,
  createButton,
  createInfoBox,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface PostScanEmailData {
  firstName: string;
  projectName: string;
  projectUrl: string;
  unsubscribeUrl: string;
  citationRate?: number;
  citationRateChange?: number;
  upgradeUrl?: string;
}

export function generatePostScanEmail(data: PostScanEmailData): { html: string; text: string } {
  const changeLabel =
    data.citationRateChange !== undefined
      ? data.citationRateChange > 0
        ? `+${data.citationRateChange}%`
        : `${data.citationRateChange}%`
      : null;
  const changeColor =
    data.citationRateChange !== undefined
      ? data.citationRateChange > 0
        ? '#22c55e'
        : data.citationRateChange < 0
          ? '#ef4444'
          : EMAIL_COLORS.textMuted
      : null;

  const summaryHtml =
    data.citationRate !== undefined
      ? createInfoBox(
          `
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Taux de citation</td>
          <td style="padding: 8px 0; font-size: 20px; font-weight: 700; color: ${EMAIL_COLORS.text}; text-align: right;">
            ${data.citationRate}%${changeLabel ? ` <span style="font-size: 13px; color: ${changeColor};">(${changeLabel})</span>` : ''}
          </td>
        </tr>
      </table>
      `,
          'primary',
        )
      : '';

  const summaryText =
    data.citationRate !== undefined
      ? `\nTaux de citation : ${data.citationRate}%${changeLabel ? ` (${changeLabel})` : ''}\n`
      : '';

  const content = `
    ${createHeading('Votre rapport de visibilité IA est prêt', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph(`Votre analyse pour <strong>${data.projectName}</strong> est terminée.`)}

    ${summaryHtml}

    ${createParagraph(`Découvrez si votre visibilité a évolué et ce que les IA disent de votre marque.`)}

    ${createButton('Consulter mon rapport', data.projectUrl)}

    ${
      data.upgradeUrl
        ? createParagraph(
            `<a href="${data.upgradeUrl}" style="color: ${EMAIL_COLORS.primary}; text-decoration: underline;">Passez au plan supérieur</a> pour des analyses automatiques et multi-modèles.`,
          )
        : ''
    }

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Votre rapport de visibilité IA pour ${data.projectName} est prêt.`,
  });

  const text = `
Votre rapport de visibilité IA est prêt

Bonjour ${data.firstName},

Votre analyse pour ${data.projectName} est terminée.
${summaryText}
Découvrez si votre visibilité a évolué et ce que les IA disent de votre marque.

Consulter mon rapport : ${data.projectUrl}
${data.upgradeUrl ? `\nPassez au plan supérieur : ${data.upgradeUrl}\n` : ''}
--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

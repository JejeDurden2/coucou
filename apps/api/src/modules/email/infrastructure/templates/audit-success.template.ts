import {
  wrapInBaseTemplate,
  createButton,
  createInfoBox,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface AuditSuccessEmailData {
  firstName: string;
  brandName: string;
  score: number;
  keyPoints: string[];
  actionCount: number;
  reportUrl: string;
  pdfUrl: string | null;
  unsubscribeUrl: string;
}

export function generateAuditSuccessEmail(data: AuditSuccessEmailData): {
  html: string;
  text: string;
} {
  const scoreColor =
    data.score >= 70
      ? EMAIL_COLORS.success
      : data.score >= 40
        ? EMAIL_COLORS.warning
        : EMAIL_COLORS.destructive;

  const keyPointsHtml = data.keyPoints
    .map(
      (point) => `
      <tr>
        <td style="padding: 6px 0 6px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; line-height: 1.5;">
          <span style="color: ${EMAIL_COLORS.primary}; margin-right: 8px;">&#8226;</span>${point}
        </td>
      </tr>`,
    )
    .join('');

  const scoreBoxHtml = createInfoBox(
    `
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 8px 0;">
          <span style="font-size: 48px; font-weight: 700; color: ${scoreColor};">${data.score}</span>
          <span style="font-size: 20px; font-weight: 500; color: ${EMAIL_COLORS.textMuted};">/100</span>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 0 0 4px; font-size: 13px; color: ${EMAIL_COLORS.textMuted};">
          Score GEO
        </td>
      </tr>
    </table>
    `,
    'success',
  );

  const pdfLinkHtml = data.pdfUrl
    ? `<p style="margin: 16px 0 0; font-size: 14px; text-align: center;">
        <a href="${data.pdfUrl}" style="color: ${EMAIL_COLORS.primary}; text-decoration: underline;">Télécharger le PDF</a>
      </p>`
    : '';

  const content = `
    ${createHeading('Votre audit GEO est prêt', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph(`L'audit pour <strong>${data.brandName}</strong> est terminé.`)}

    ${scoreBoxHtml}

    ${createHeading('Points clés', 2)}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 16px;">
      ${keyPointsHtml}
    </table>

    ${createParagraph(`<strong>${data.actionCount} actions recommandées</strong> pour améliorer votre score.`)}

    ${createButton('Voir le rapport', data.reportUrl)}

    ${pdfLinkHtml}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Score GEO : ${data.score}/100 pour ${data.brandName} — ${data.actionCount} actions recommandées.`,
  });

  const keyPointsText = data.keyPoints.map((point) => `  - ${point}`).join('\n');

  const text = `
Votre audit GEO est prêt

Bonjour ${data.firstName},

L'audit pour ${data.brandName} est terminé.

Score GEO : ${data.score}/100

Points clés :
${keyPointsText}

${data.actionCount} actions recommandées pour améliorer votre score.

Voir le rapport : ${data.reportUrl}
${data.pdfUrl ? `\nTélécharger le PDF : ${data.pdfUrl}\n` : ''}
--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

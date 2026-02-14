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
  verdict: string | null;
  externalPresenceScore: number | null;
  keyPoints: string[];
  actionCount: number;
  reportUrl: string;
  pdfUrl: string;
  unsubscribeUrl: string;
}

function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case 'insuffisante':
      return EMAIL_COLORS.destructive;
    case 'à renforcer':
      return EMAIL_COLORS.warning;
    case 'correcte':
    case 'excellente':
      return EMAIL_COLORS.success;
    default:
      return EMAIL_COLORS.textMuted;
  }
}

function getVerdictLabel(verdict: string): string {
  return `Visibilité ${verdict}`;
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

  const verdictHtml = data.verdict
    ? `
      <tr>
        <td align="center" style="padding: 4px 0 0; font-size: 14px; font-weight: 600; color: ${getVerdictColor(data.verdict)};">
          ${getVerdictLabel(data.verdict)}
        </td>
      </tr>`
    : '';

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
      ${verdictHtml}
    </table>
    `,
    'success',
  );

  const externalPresenceHtml =
    data.externalPresenceScore !== null
      ? createInfoBox(
          `
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: ${EMAIL_COLORS.text};">
            Présence externe
          </td>
          <td align="right" style="padding: 4px 0; font-size: 14px; font-weight: 600; color: ${EMAIL_COLORS.text};">
            ${data.externalPresenceScore}/100
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 4px 0 0;">
            <table role="presentation" style="width: 100%; height: 6px; border-radius: 3px; background-color: ${EMAIL_COLORS.cardHover};">
              <tr>
                <td style="width: ${data.externalPresenceScore}%; height: 6px; border-radius: 3px; background-color: ${EMAIL_COLORS.primary};"></td>
                <td style="height: 6px;"></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      `,
          'primary',
        )
      : '';

  const content = `
    ${createHeading('Votre audit GEO est prêt', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph(`L'audit pour <strong>${data.brandName}</strong> est terminé.`)}

    ${scoreBoxHtml}

    ${externalPresenceHtml}

    ${createHeading('Points clés', 2)}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 16px;">
      ${keyPointsHtml}
    </table>

    ${createParagraph(`<strong>${data.actionCount} actions recommandées</strong> pour améliorer votre score.`)}

    ${createButton('Voir le rapport', data.reportUrl)}

    <p style="margin: 16px 0 0; font-size: 14px; text-align: center;">
      <a href="${data.pdfUrl}" style="color: ${EMAIL_COLORS.primary}; text-decoration: underline;">Télécharger le PDF</a>
    </p>

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Score GEO : ${data.score}/100 pour ${data.brandName} — ${data.actionCount} actions recommandées.`,
  });

  const verdictText = data.verdict ? `\nVerdict : ${getVerdictLabel(data.verdict)}` : '';
  const externalPresenceText =
    data.externalPresenceScore !== null
      ? `\nPrésence externe : ${data.externalPresenceScore}/100`
      : '';
  const keyPointsText = data.keyPoints.map((point) => `  - ${point}`).join('\n');

  const text = `
Votre audit GEO est prêt

Bonjour ${data.firstName},

L'audit pour ${data.brandName} est terminé.

Score GEO : ${data.score}/100${verdictText}${externalPresenceText}

Points clés :
${keyPointsText}

${data.actionCount} actions recommandées pour améliorer votre score.

Voir le rapport : ${data.reportUrl}

Télécharger le PDF : ${data.pdfUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

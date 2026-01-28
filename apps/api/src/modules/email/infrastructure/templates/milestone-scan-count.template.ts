import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface MilestoneScanCountEmailData {
  firstName: string;
  scanCount: number;
  brandName: string;
  projectUrl: string;
  unsubscribeUrl: string;
}

export function generateMilestoneScanCountEmail(data: MilestoneScanCountEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading(`${data.scanCount} analyses réalisées`, 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph(`Vous avez réalisé <strong>${data.scanCount} analyses</strong> pour <strong>${data.brandName}</strong>. Chaque analyse enrichit vos données et vous donne une meilleure compréhension de votre visibilité IA.`)}

    ${createParagraph('Continuez sur cette lancée pour suivre les tendances de votre positionnement.')}

    ${createButton('Consulter mes statistiques', data.projectUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `${data.scanCount} analyses réalisées pour ${data.brandName} — continuez sur cette lancée.`,
  });

  const text = `
${data.scanCount} analyses réalisées — continuez sur cette lancée

Bonjour ${data.firstName},

Vous avez réalisé ${data.scanCount} analyses pour ${data.brandName}. Chaque analyse enrichit vos données et vous donne une meilleure compréhension de votre visibilité IA.

Continuez sur cette lancée pour suivre les tendances de votre positionnement.

Consulter mes statistiques : ${data.projectUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

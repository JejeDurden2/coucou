import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface PostScanEmailData {
  firstName: string;
  projectName: string;
  projectUrl: string;
  unsubscribeUrl: string;
}

export function generatePostScanEmail(data: PostScanEmailData): { html: string; text: string } {
  const content = `
    ${createHeading('Votre scan GEO est terminé', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph(`Votre scan GEO pour <strong>${data.projectName}</strong> vient de se terminer.`)}

    ${createParagraph(`Découvrez si votre visibilité a évolué et ce que les IA disent de votre marque.`)}

    ${createButton('Voir mes résultats', data.projectUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Votre scan GEO pour ${data.projectName} est terminé. Découvrez vos résultats.`,
  });

  const text = `
Votre scan GEO est terminé

Bonjour ${data.firstName},

Votre scan GEO pour ${data.projectName} vient de se terminer.

Découvrez si votre visibilité a évolué et ce que les IA disent de votre marque.

Voir mes résultats : ${data.projectUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou - Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

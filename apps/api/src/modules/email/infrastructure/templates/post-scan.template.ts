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
    ${createHeading('Votre rapport de visibilité IA est prêt', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph(`Votre analyse pour <strong>${data.projectName}</strong> est terminée.`)}

    ${createParagraph(`Découvrez si votre visibilité a évolué et ce que les IA disent de votre marque.`)}

    ${createButton('Consulter mon rapport', data.projectUrl)}

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

Découvrez si votre visibilité a évolué et ce que les IA disent de votre marque.

Consulter mon rapport : ${data.projectUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

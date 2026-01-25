import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  createInfoBox,
  EMAIL_COLORS,
} from './base.template';

export interface InactivityEmailData {
  firstName: string;
  brandName: string;
  projectUrl: string;
  unsubscribeUrl: string;
}

export function generateInactivityEmail(data: InactivityEmailData): { html: string; text: string } {
  const content = `
    ${createHeading('Votre visibilité IA a peut-être changé', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph(`Cela fait plus de 14 jours que vous n'avez pas vérifié votre visibilité IA.`)}

    ${createParagraph(`Les réponses de ChatGPT et Claude évoluent constamment. Vos concurrents sont peut-être passés devant.`)}

    ${createButton('Vérifier ma visibilité', data.projectUrl)}

    ${createInfoBox(`<p style="margin: 0; font-size: 14px; color: ${EMAIL_COLORS.text};">💡 Passez au plan Solo pour des analyses automatiques et ne plus jamais rater une évolution.</p>`, 'primary')}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Votre visibilité IA a peut-être changé. Vérifiez votre positionnement.',
  });

  const text = `
Votre visibilité IA a peut-être changé

Bonjour ${data.firstName},

Cela fait plus de 14 jours que vous n'avez pas vérifié votre visibilité IA.

Les réponses de ChatGPT et Claude évoluent constamment. Vos concurrents sont peut-être passés devant.

Vérifier ma visibilité : ${data.projectUrl}

💡 Passez au plan Solo pour des analyses automatiques et ne plus jamais rater une évolution.

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

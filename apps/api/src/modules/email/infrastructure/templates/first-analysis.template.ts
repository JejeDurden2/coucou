import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  createInfoBox,
  EMAIL_COLORS,
} from './base.template';

export interface FirstAnalysisEmailData {
  firstName: string;
  brandName: string;
  projectUrl: string;
  unsubscribeUrl: string;
}

export function generateFirstAnalysisEmail(data: FirstAnalysisEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading(`Découvrez ce que les IA disent de ${data.brandName}`, 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph(`Vous avez créé votre projet <strong>${data.brandName}</strong> mais vous n'avez pas encore lancé d'analyse.`)}

    ${createParagraph(`Savez-vous si ChatGPT ou Claude mentionnent votre marque ? Lancez votre première analyse pour le découvrir.`)}

    ${createButton('Lancer ma première analyse', data.projectUrl)}

    ${createInfoBox(`<p style="margin: 0; font-size: 14px; color: ${EMAIL_COLORS.text};">💡 Passez au plan Solo pour des analyses automatiques et ne plus jamais rater une évolution.</p>`, 'primary')}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Découvrez ce que les IA disent de ${data.brandName}.`,
  });

  const text = `
Découvrez ce que les IA disent de ${data.brandName}

Bonjour ${data.firstName},

Vous avez créé votre projet ${data.brandName} mais vous n'avez pas encore lancé d'analyse.

Savez-vous si ChatGPT ou Claude mentionnent votre marque ? Lancez votre première analyse pour le découvrir.

Lancer ma première analyse : ${data.projectUrl}

💡 Passez au plan Solo pour des analyses automatiques et ne plus jamais rater une évolution.

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

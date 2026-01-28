import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface OnboardingFirstScanEmailData {
  firstName: string;
  brandName: string;
  projectUrl: string;
  unsubscribeUrl: string;
}

export function generateOnboardingFirstScanEmail(data: OnboardingFirstScanEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading(`Que disent ChatGPT et Claude de ${data.brandName} ?`, 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph(`Vous avez créé <strong>${data.brandName}</strong>, mais vous n'avez pas encore vérifié votre visibilité IA. Lancez votre première analyse en un clic pour découvrir si ChatGPT et Claude mentionnent votre marque.`)}

    ${createButton('Lancer ma première analyse', data.projectUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Découvrez si les IA mentionnent ${data.brandName}.`,
  });

  const text = `
Que disent ChatGPT et Claude de ${data.brandName} ?

Bonjour ${data.firstName},

Vous avez créé ${data.brandName}, mais vous n'avez pas encore vérifié votre visibilité IA. Lancez votre première analyse en un clic pour découvrir si ChatGPT et Claude mentionnent votre marque.

Lancer ma première analyse : ${data.projectUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

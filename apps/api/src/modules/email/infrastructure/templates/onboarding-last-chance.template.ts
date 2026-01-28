import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface OnboardingLastChanceEmailData {
  firstName: string;
  projectUrl: string;
  unsubscribeUrl: string;
}

export function generateOnboardingLastChanceEmail(data: OnboardingLastChanceEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Votre analyse gratuite vous attend', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph('Cela fait une semaine que vous avez rejoint Coucou IA. Votre plan gratuit vous permet de lancer des analyses hebdomadaires.')}

    ${createParagraph('Plus vous commencez tôt, plus vous aurez de données pour comprendre votre visibilité IA.')}

    ${createButton('Lancer mon analyse', data.projectUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Dernière chance : lancez votre première analyse gratuite.',
  });

  const text = `
Votre analyse gratuite vous attend

Bonjour ${data.firstName},

Cela fait une semaine que vous avez rejoint Coucou IA. Votre plan gratuit vous permet de lancer des analyses hebdomadaires.

Plus vous commencez tôt, plus vous aurez de données pour comprendre votre visibilité IA.

Lancer mon analyse : ${data.projectUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

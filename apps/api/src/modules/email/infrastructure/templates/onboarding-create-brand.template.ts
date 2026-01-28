import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface OnboardingCreateBrandEmailData {
  firstName: string;
  dashboardUrl: string;
  unsubscribeUrl: string;
}

export function generateOnboardingCreateBrandEmail(data: OnboardingCreateBrandEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Créez votre marque en 30 secondes', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph("Vous avez créé votre compte, la prochaine étape est de créer votre premier projet. C'est rapide : entrez le nom de votre marque, votre domaine, et vous êtes prêt.")}

    ${createButton('Créer mon premier projet', data.dashboardUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Créez votre premier projet en quelques clics.',
  });

  const text = `
Créez votre marque en 30 secondes

Bonjour ${data.firstName},

Vous avez créé votre compte, la prochaine étape est de créer votre premier projet. C'est rapide : entrez le nom de votre marque, votre domaine, et vous êtes prêt.

Créer mon premier projet : ${data.dashboardUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

import {
  wrapInBaseTemplate,
  createButton,
  createInfoBox,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface WelcomeEmailData {
  userName: string;
  loginUrl: string;
}

export function generateWelcomeEmail(data: WelcomeEmailData): { html: string; text: string } {
  const content = `
    ${createHeading('Bienvenue sur Coucou IA', 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`Merci de rejoindre Coucou ! Vous venez de faire un premier pas important vers une meilleure visibilité de votre marque dans les réponses des IA.`)}

    ${createInfoBox(
      `
      <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: ${EMAIL_COLORS.text};">
        Pourquoi c'est important ?
      </p>
      <ul style="margin: 0; padding-left: 20px; color: ${EMAIL_COLORS.text}; font-size: 14px; line-height: 1.8;">
        <li><strong>40% des recherches</strong> passent désormais par les IA (ChatGPT, Claude...)</li>
        <li>Les utilisateurs font confiance aux recommandations de l'IA</li>
        <li>Être cité = plus de visibilité et de conversions</li>
      </ul>
      `,
      'success',
    )}

    ${createHeading('Premiers pas', 3)}

    <ol style="margin: 0 0 24px; padding-left: 20px; color: ${EMAIL_COLORS.text}; font-size: 14px; line-height: 2;">
      <li>Créez votre premier projet avec votre nom de marque</li>
      <li>Ajoutez des prompts que vos clients pourraient poser</li>
      <li>Lancez un scan pour voir si vous êtes cité</li>
      <li>Suivez vos recommandations pour améliorer votre visibilité</li>
    </ol>

    ${createButton('Accéder à mon dashboard', data.loginUrl)}

    <p style="margin: 24px 0 0; font-size: 13px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      Des questions ? Répondez directement à cet email.
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Bienvenue sur Coucou IA! Découvrez comment améliorer votre visibilité dans les IA.',
  });

  const text = `
Bienvenue sur Coucou IA !

Bonjour ${data.userName},

Merci de rejoindre Coucou IA! Vous venez de faire un premier pas important vers une meilleure visibilité de votre marque dans les réponses des IA.

POURQUOI C'EST IMPORTANT ?
- 40% des recherches passent désormais par les IA (ChatGPT, Claude...)
- Les utilisateurs font confiance aux recommandations de l'IA
- Être cité = plus de visibilité et de conversions

PREMIERS PAS :
1. Créez votre premier projet avec votre nom de marque
2. Ajoutez des prompts que vos clients pourraient poser
3. Lancez un scan pour voir si vous êtes cité
4. Suivez vos recommandations pour améliorer votre visibilité

Accédez à votre dashboard : ${data.loginUrl}

Des questions ? Répondez directement à cet email.

--
Coucou - Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

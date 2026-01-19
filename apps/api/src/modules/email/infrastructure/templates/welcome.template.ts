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
    ${createHeading('Bienvenue sur Coucou', 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`Merci de rejoindre Coucou ! Vous venez de faire un premier pas important vers une meilleure visibilite de votre marque dans les reponses des IA.`)}

    ${createInfoBox(
      `
      <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: ${EMAIL_COLORS.text};">
        Pourquoi c'est important ?
      </p>
      <ul style="margin: 0; padding-left: 20px; color: ${EMAIL_COLORS.text}; font-size: 14px; line-height: 1.8;">
        <li><strong>40% des recherches</strong> passent desormais par les IA (ChatGPT, Claude...)</li>
        <li>Les utilisateurs font confiance aux recommandations de l'IA</li>
        <li>Etre cite = plus de visibilite et de conversions</li>
      </ul>
      `,
      'success',
    )}

    ${createHeading('Premiers pas', 3)}

    <ol style="margin: 0 0 24px; padding-left: 20px; color: ${EMAIL_COLORS.text}; font-size: 14px; line-height: 2;">
      <li>Creez votre premier projet avec votre nom de marque</li>
      <li>Ajoutez des prompts que vos clients pourraient poser</li>
      <li>Lancez un scan pour voir si vous etes cite</li>
      <li>Suivez vos recommandations pour ameliorer votre visibilite</li>
    </ol>

    ${createButton('Acceder a mon dashboard', data.loginUrl)}

    <p style="margin: 24px 0 0; font-size: 13px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      Des questions ? Repondez directement a cet email.
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Bienvenue sur Coucou ! Decouvrez comment ameliorer votre visibilite dans les IA.',
  });

  const text = `
Bienvenue sur Coucou !

Bonjour ${data.userName},

Merci de rejoindre Coucou ! Vous venez de faire un premier pas important vers une meilleure visibilite de votre marque dans les reponses des IA.

POURQUOI C'EST IMPORTANT ?
- 40% des recherches passent desormais par les IA (ChatGPT, Claude...)
- Les utilisateurs font confiance aux recommandations de l'IA
- Etre cite = plus de visibilite et de conversions

PREMIERS PAS :
1. Creez votre premier projet avec votre nom de marque
2. Ajoutez des prompts que vos clients pourraient poser
3. Lancez un scan pour voir si vous etes cite
4. Suivez vos recommandations pour ameliorer votre visibilite

Accedez a votre dashboard : ${data.loginUrl}

Des questions ? Repondez directement a cet email.

--
Coucou - Votre visibilite dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

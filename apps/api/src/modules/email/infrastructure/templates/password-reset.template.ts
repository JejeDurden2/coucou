import {
  wrapInBaseTemplate,
  createButton,
  createInfoBox,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export function generatePasswordResetEmail(data: PasswordResetEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Réinitialisation de votre mot de passe', 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.`)}

    ${createButton('Réinitialiser mon mot de passe', data.resetUrl)}

    ${createInfoBox(
      `
      <p style="margin: 0; font-size: 13px; color: ${EMAIL_COLORS.text};">
        Ce lien expire dans <strong>${data.expiresInMinutes} minutes</strong>.
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
      </p>
      `,
      'warning',
    )}

    <p style="margin: 24px 0 0; font-size: 13px; color: ${EMAIL_COLORS.textMuted};">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
      <a href="${data.resetUrl}" style="color: ${EMAIL_COLORS.primary}; word-break: break-all;">${data.resetUrl}</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Réinitialisation de votre mot de passe Coucou',
  });

  const text = `
Réinitialisation de votre mot de passe

Bonjour ${data.userName},

Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :

${data.resetUrl}

Ce lien expire dans ${data.expiresInMinutes} minutes.
Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

--
Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

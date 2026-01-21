import {
  wrapInBaseTemplate,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface NewUserNotificationEmailData {
  userName: string;
  userEmail: string;
  authMethod: 'email' | 'google';
  createdAt: string;
}

export function generateNewUserNotificationEmail(
  data: NewUserNotificationEmailData,
): { html: string; text: string } {
  const content = `
    ${createHeading('Nouvel utilisateur inscrit', 1)}

    ${createParagraph(`Un nouvel utilisateur vient de s'inscrire sur Coucou IA.`)}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Nom</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${data.userName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Email</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${data.userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Méthode</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${data.authMethod === 'google' ? 'Google' : 'Email/Mot de passe'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Date</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${data.createdAt}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Nouvel utilisateur : ${data.userName} (${data.userEmail})`,
  });

  const text = `
Nouvel utilisateur inscrit

Un nouvel utilisateur vient de s'inscrire sur Coucou IA.

- Nom : ${data.userName}
- Email : ${data.userEmail}
- Méthode : ${data.authMethod === 'google' ? 'Google' : 'Email/Mot de passe'}
- Date : ${data.createdAt}

--
Coucou - Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

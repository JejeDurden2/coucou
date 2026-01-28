import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface WinbackCheckinEmailData {
  firstName: string;
  dashboardUrl: string;
  unsubscribeUrl: string;
}

export function generateWinbackCheckinEmail(data: WinbackCheckinEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Comment va votre visibilité IA ?', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph('Cela fait une semaine que vous êtes passé au plan Gratuit. Votre marque est-elle toujours citée par les IA ?')}

    ${createParagraph('Avec le plan Gratuit, vos analyses ne couvrent plus que GPT-4o-mini.')}

    ${createButton('Vérifier ma visibilité', data.dashboardUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Votre visibilité IA a peut-être changé depuis votre passage au plan Gratuit.',
  });

  const text = `
Comment va votre visibilité IA ?

Bonjour ${data.firstName},

Cela fait une semaine que vous êtes passé au plan Gratuit. Votre marque est-elle toujours citée par les IA ?

Avec le plan Gratuit, vos analyses ne couvrent plus que GPT-4o-mini.

Vérifier ma visibilité : ${data.dashboardUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

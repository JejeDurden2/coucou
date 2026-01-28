import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface WinbackValueEmailData {
  firstName: string;
  pricingUrl: string;
  unsubscribeUrl: string;
}

export function generateWinbackValueEmail(data: WinbackValueEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Ce qui a changé dans les IA cette semaine', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph('Les réponses de ChatGPT et Claude évoluent en permanence. Chaque semaine, de nouvelles marques apparaissent ou disparaissent des recommandations IA.')}

    ${createParagraph("Sans monitoring, vous naviguez à l'aveugle.")}

    ${createButton('Reprendre le monitoring', data.pricingUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Les réponses des IA changent chaque semaine. Surveillez votre visibilité.',
  });

  const text = `
Ce qui a changé dans les IA cette semaine

Bonjour ${data.firstName},

Les réponses de ChatGPT et Claude évoluent en permanence. Chaque semaine, de nouvelles marques apparaissent ou disparaissent des recommandations IA.

Sans monitoring, vous naviguez à l'aveugle.

Reprendre le monitoring : ${data.pricingUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

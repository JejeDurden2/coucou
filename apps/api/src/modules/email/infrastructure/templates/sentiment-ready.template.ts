import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface SentimentReadyEmailData {
  userName: string;
  brandName: string;
  dashboardUrl: string;
  unsubscribeUrl?: string;
}

export function generateSentimentReadyEmail(data: SentimentReadyEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Votre analyse de sentiment IA est prête', 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`L'analyse de sentiment IA de votre projet <strong>${data.brandName}</strong> est maintenant disponible.`)}

    ${createParagraph("Découvrez comment les IA perçoivent votre marque : thèmes associés, points positifs et axes d'amélioration.")}

    ${createButton("Consulter l'analyse", data.dashboardUrl)}

    ${
      data.unsubscribeUrl
        ? `<p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>`
        : ''
    }
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `L'analyse de sentiment IA de ${data.brandName} est prête.`,
  });

  const text = `
Votre analyse de sentiment IA est prête

Bonjour ${data.userName},

L'analyse de sentiment IA de votre projet ${data.brandName} est maintenant disponible.

Découvrez comment les IA perçoivent votre marque : thèmes associés, points positifs et axes d'amélioration.

Consulter l'analyse : ${data.dashboardUrl}

--${data.unsubscribeUrl ? `\nSe désinscrire : ${data.unsubscribeUrl}\n` : ''}
Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

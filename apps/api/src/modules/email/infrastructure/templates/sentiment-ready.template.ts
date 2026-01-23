import { wrapInBaseTemplate, createButton, createParagraph, createHeading } from './base.template';

export interface SentimentReadyEmailData {
  userName: string;
  brandName: string;
  dashboardUrl: string;
}

export function generateSentimentReadyEmail(data: SentimentReadyEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Votre analyse sentiment est prête', 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`L'analyse sentiment de votre projet <strong>${data.brandName}</strong> est maintenant disponible.`)}

    ${createParagraph("Découvrez comment les IA perçoivent votre marque : thèmes associés, points positifs et axes d'amélioration.")}

    ${createButton("Voir l'analyse", data.dashboardUrl)}
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `L'analyse sentiment de ${data.brandName} est prête.`,
  });

  const text = `
Votre analyse sentiment est prête

Bonjour ${data.userName},

L'analyse sentiment de votre projet ${data.brandName} est maintenant disponible.

Découvrez comment les IA perçoivent votre marque : thèmes associés, points positifs et axes d'amélioration.

Voir l'analyse : ${data.dashboardUrl}

--
Coucou - Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  createInfoBox,
  EMAIL_COLORS,
} from './base.template';

export interface UpgradeMultimodelEmailData {
  firstName: string;
  pricingUrl: string;
  unsubscribeUrl: string;
}

export function generateUpgradeMultimodelEmail(data: UpgradeMultimodelEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Vous analysez 1 modèle IA. Vos concurrents en utilisent 3.', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph('Avec le plan Gratuit, vous analysez uniquement GPT-4o-mini. Mais ChatGPT et Claude donnent des réponses différentes.')}

    ${createParagraph('Le plan Solo analyse <strong>3 modèles IA</strong> pour une vision complète de votre visibilité.')}

    ${createInfoBox(
      `<p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: ${EMAIL_COLORS.text};">Modèles analysés avec le plan Solo :</p>
      <ul style="margin: 0; padding-left: 20px; color: ${EMAIL_COLORS.text}; font-size: 14px; line-height: 1.8;">
        <li>GPT-4o-mini</li>
        <li>GPT-4o</li>
        <li>Claude Sonnet 4.5</li>
      </ul>`,
      'primary',
    )}

    ${createButton('Comparer les plans', data.pricingUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: "Analysez 3 modèles IA au lieu d'un seul avec le plan Solo.",
  });

  const text = `
Vous analysez 1 modèle IA. Vos concurrents en utilisent 3.

Bonjour ${data.firstName},

Avec le plan Gratuit, vous analysez uniquement GPT-4o-mini. Mais ChatGPT et Claude donnent des réponses différentes.

Le plan Solo analyse 3 modèles IA pour une vision complète de votre visibilité.

Modèles analysés avec le plan Solo :
- GPT-4o-mini
- GPT-4o
- Claude Sonnet 4.5

Comparer les plans : ${data.pricingUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

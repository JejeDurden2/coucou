import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  createInfoBox,
  createProviderBadge,
  createProviderListText,
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
    ${createHeading('Vous analysez 1 IA. Vos concurrents en utilisent 2.', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph('Avec le plan Gratuit, vous analysez uniquement ChatGPT. Mais <strong>ChatGPT et Claude donnent des réponses différentes</strong>.')}

    ${createParagraph('Le plan Solo analyse les <strong>2 IA leaders</strong> pour une vision complète de votre visibilité.')}

    ${createInfoBox(
      `<p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: ${EMAIL_COLORS.text};">IA analysées avec le plan Solo :</p>
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: ${EMAIL_COLORS.text};">${createProviderBadge('CHATGPT')}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: ${EMAIL_COLORS.text};">${createProviderBadge('CLAUDE')}</td>
        </tr>
      </table>`,
      'primary',
    )}

    ${createButton('Comparer les plans', data.pricingUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Analysez ChatGPT + Claude avec le plan Solo.',
  });

  const text = `
Vous analysez 1 IA. Vos concurrents en utilisent 2.

Bonjour ${data.firstName},

Avec le plan Gratuit, vous analysez uniquement ChatGPT. Mais ChatGPT et Claude donnent des réponses différentes.

Le plan Solo analyse les 2 IA leaders pour une vision complète de votre visibilité.

IA analysées avec le plan Solo :
- ${createProviderListText(['CHATGPT', 'CLAUDE'])}

Comparer les plans : ${data.pricingUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA - Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

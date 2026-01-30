import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  PROVIDER_NAMES,
  EMAIL_COLORS,
} from './base.template';

export interface UpgradeFinalEmailData {
  firstName: string;
  pricingUrl: string;
  unsubscribeUrl: string;
}

export function generateUpgradeFinalEmail(data: UpgradeFinalEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading(`${data.firstName}, votre plan gratuit a ses limites`, 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph("1 projet, 2 requêtes : c'est un aperçu. Pour une vision complète de votre visibilité IA, le plan Solo offre <strong>5 projets</strong> et <strong>10 requêtes par projet</strong>.")}

    ${createParagraph('Des centaines de marques françaises utilisent déjà Coucou IA pour surveiller leur visibilité.')}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: ${EMAIL_COLORS.textMuted};"></td>
              <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: ${EMAIL_COLORS.textMuted}; text-align: right;">Gratuit</td>
              <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: ${EMAIL_COLORS.primary}; text-align: right;">Solo</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted}; border-top: 1px solid ${EMAIL_COLORS.border};">Projets</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500; border-top: 1px solid ${EMAIL_COLORS.border};">1</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.primary}; text-align: right; font-weight: 500; border-top: 1px solid ${EMAIL_COLORS.border};">5</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Requêtes par projet</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">2</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.primary}; text-align: right; font-weight: 500;">10</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">IA analysées</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${PROVIDER_NAMES.CHATGPT}</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.primary}; text-align: right; font-weight: 500;">${PROVIDER_NAMES.CHATGPT} + ${PROVIDER_NAMES.CLAUDE}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Analyses automatiques</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">Non</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.primary}; text-align: right; font-weight: 500;">Oui</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${createButton('Passer au plan Solo — 39\u20AC/mois', data.pricingUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Le plan Solo offre 5 projets, 10 requêtes et ChatGPT + Claude.',
  });

  const text = `
${data.firstName}, votre plan gratuit a ses limites

Bonjour ${data.firstName},

1 projet, 2 requêtes : c'est un aperçu. Pour une vision complète de votre visibilité IA, le plan Solo offre 5 projets et 10 requêtes par projet.

Des centaines de marques françaises utilisent déjà Coucou IA pour surveiller leur visibilité.

Comparaison :
                  Gratuit      Solo
Projets           1            5
Requêtes/projet   2            10
IA analysées      ChatGPT      ChatGPT + Claude
Analyses auto     Non          Oui

Passer au plan Solo — 39\u20AC/mois : ${data.pricingUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

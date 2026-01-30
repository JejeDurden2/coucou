import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  createProviderList,
  createProviderListText,
  EMAIL_COLORS,
} from './base.template';

export type SoloToProLimitType = 'projects' | 'prompts';

export interface SoloToProNudgeEmailData {
  userName: string;
  limitType: SoloToProLimitType;
  currentUsage: number;
  maxAllowed: number;
  upgradeUrl: string;
  unsubscribeUrl?: string;
}

const LIMIT_LABELS: Record<SoloToProLimitType, string> = {
  projects: 'projets',
  prompts: 'requêtes',
};

export function generateSoloToProNudgeEmail(data: SoloToProNudgeEmailData): {
  html: string;
  text: string;
} {
  const limitLabel = LIMIT_LABELS[data.limitType];

  const content = `
    ${createHeading(`Vous exploitez déjà ${data.currentUsage}/${data.maxAllowed} de votre plan Solo`, 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`Vous utilisez <strong>${data.currentUsage}</strong> de vos <strong>${data.maxAllowed} ${limitLabel}</strong> sur le plan Solo. Le plan Pro vous offre bien plus de capacité pour surveiller votre visibilité IA.`)}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: ${EMAIL_COLORS.text};">
            Plan Pro
          </p>
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Projets</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">15</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Requêtes par projet</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">50</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">IA analysées</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${createProviderList(['CHATGPT', 'CLAUDE'])}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Fréquence d'analyse</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">Quotidienne</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Historique</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">Illimité</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${createButton('Voir le plan Pro', data.upgradeUrl)}

    ${
      data.unsubscribeUrl
        ? `<p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>`
        : ''
    }
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Vous utilisez ${data.currentUsage}/${data.maxAllowed} ${limitLabel} de votre plan Solo.`,
  });

  const text = `
Vous exploitez déjà ${data.currentUsage}/${data.maxAllowed} de votre plan Solo

Bonjour ${data.userName},

Vous utilisez ${data.currentUsage} de vos ${data.maxAllowed} ${limitLabel} sur le plan Solo. Le plan Pro vous offre bien plus de capacité pour surveiller votre visibilité IA.

Plan Pro :
- 15 projets
- 50 requêtes par projet
- IA analysées : ${createProviderListText(['CHATGPT', 'CLAUDE'])}
- Analyses quotidiennes
- Historique illimité

Voir le plan Pro : ${data.upgradeUrl}

--${data.unsubscribeUrl ? `\nSe désinscrire : ${data.unsubscribeUrl}\n` : ''}
Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

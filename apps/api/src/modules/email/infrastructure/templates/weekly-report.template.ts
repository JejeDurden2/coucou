import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  createInfoBox,
  EMAIL_COLORS,
} from './base.template';

export interface WeeklyReportEmailData {
  firstName: string;
  brandName: string;
  projectUrl: string;
  citationRate: number;
  citationRateChange: number;
  totalPrompts: number;
  citedPrompts: number;
  topCompetitors: string[];
  plan: 'FREE' | 'SOLO' | 'PRO';
  unsubscribeUrl: string;
}

function getChangeIndicator(change: number): { symbol: string; color: string; textSymbol: string } {
  if (change > 0) {
    return { symbol: '&#9650;', color: EMAIL_COLORS.success, textSymbol: '▲' };
  }
  if (change < 0) {
    return { symbol: '&#9660;', color: EMAIL_COLORS.destructive, textSymbol: '▼' };
  }
  return { symbol: '&#8212;', color: EMAIL_COLORS.textMuted, textSymbol: '—' };
}

export function generateWeeklyReportEmail(data: WeeklyReportEmailData): {
  html: string;
  text: string;
} {
  const indicator = getChangeIndicator(data.citationRateChange);
  const absChange = Math.abs(data.citationRateChange);

  const competitorsHtml =
    data.topCompetitors.length > 0
      ? `
    ${createHeading('Marques les plus citées dans vos requêtes', 3)}
    <p style="margin: 0 0 16px; font-size: 14px; color: ${EMAIL_COLORS.text};">${data.topCompetitors.join(', ')}</p>
  `
      : '';

  const competitorsText =
    data.topCompetitors.length > 0
      ? `\nMarques les plus citées dans vos requêtes :\n${data.topCompetitors.join(', ')}\n`
      : '';

  const freeUpgradeBox =
    data.plan === 'FREE'
      ? createInfoBox(
          `<p style="margin: 0; font-size: 14px; color: ${EMAIL_COLORS.text};">Vous analysez uniquement ChatGPT. Le plan Solo analyse ChatGPT + Claude pour une vision complète. À partir de 39€/mois.</p>`,
          'primary',
        )
      : '';

  const freeUpgradeText =
    data.plan === 'FREE'
      ? '\nVous analysez uniquement ChatGPT. Le plan Solo analyse ChatGPT + Claude pour une vision complète. À partir de 39€/mois.\n'
      : '';

  const content = `
    ${createHeading(`${data.brandName} : rapport de visibilité IA`, 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px; text-align: center;">
      <tr>
        <td style="padding: 24px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: ${EMAIL_COLORS.textMuted};">Taux de citation</p>
          <p style="margin: 0 0 8px; font-size: 36px; font-weight: 700; color: ${EMAIL_COLORS.text};">${data.citationRate}%</p>
          <p style="margin: 0; font-size: 14px; color: ${indicator.color};">
            ${indicator.symbol} ${absChange > 0 ? `${absChange} pt${absChange > 1 ? 's' : ''}` : 'Stable'}
          </p>
        </td>
      </tr>
    </table>

    ${createParagraph(`Votre marque est citée dans <strong>${data.citedPrompts}/${data.totalPrompts} requêtes</strong>.`)}

    ${competitorsHtml}

    ${freeUpgradeBox}

    ${createButton('Voir mon rapport complet', data.projectUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `${data.brandName} : taux de citation ${data.citationRate}% ${indicator.textSymbol} ${absChange > 0 ? `${absChange} pts` : 'stable'}`,
  });

  const text = `
${data.brandName} : rapport de visibilité IA

Bonjour ${data.firstName},

Taux de citation : ${data.citationRate}% ${indicator.textSymbol} ${absChange > 0 ? `${absChange} pt${absChange > 1 ? 's' : ''}` : 'Stable'}

Votre marque est citée dans ${data.citedPrompts}/${data.totalPrompts} requêtes.
${competitorsText}${freeUpgradeText}
Voir mon rapport complet : ${data.projectUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

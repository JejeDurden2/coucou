import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export type ApproachingLimitType = 'projects' | 'prompts';

export interface PlanApproachingLimitEmailData {
  userName: string;
  currentPlan: 'FREE' | 'SOLO';
  limitType: ApproachingLimitType;
  currentUsage: number;
  maxAllowed: number;
  upgradeUrl: string;
  unsubscribeUrl?: string;
}

const LIMIT_LABELS: Record<ApproachingLimitType, string> = {
  projects: 'projets',
  prompts: 'requêtes',
};

const NEXT_PLAN_LIMITS = {
  FREE: { plan: 'SOLO', projects: 5, prompts: 10 },
  SOLO: { plan: 'PRO', projects: 15, prompts: 50 },
} as const;

export function generatePlanApproachingLimitEmail(data: PlanApproachingLimitEmailData): {
  html: string;
  text: string;
} {
  const limitLabel = LIMIT_LABELS[data.limitType];
  const nextPlan = NEXT_PLAN_LIMITS[data.currentPlan];

  const content = `
    ${createHeading(`Vous utilisez ${data.currentUsage}/${data.maxAllowed} ${limitLabel}`, 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`Vous utilisez <strong>${data.currentUsage}</strong> de vos <strong>${data.maxAllowed} ${limitLabel}</strong>. Pour ne pas être bloqué, pensez à passer au plan supérieur.`)}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: ${EMAIL_COLORS.text};">
            Plan ${nextPlan.plan}
          </p>
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Projets</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${nextPlan.projects}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Requêtes par projet</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${nextPlan.prompts}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${createButton(`Voir le plan ${nextPlan.plan}`, data.upgradeUrl)}

    ${
      data.unsubscribeUrl
        ? `<p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>`
        : ''
    }
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Vous utilisez ${data.currentUsage}/${data.maxAllowed} ${limitLabel} de votre plan.`,
  });

  const text = `
Vous utilisez ${data.currentUsage}/${data.maxAllowed} ${limitLabel} de votre plan

Bonjour ${data.userName},

Vous utilisez ${data.currentUsage} de vos ${data.maxAllowed} ${limitLabel}. Pour ne pas être bloqué, pensez à passer au plan supérieur.

Plan ${nextPlan.plan} :
- ${nextPlan.projects} projets
- ${nextPlan.prompts} requêtes par projet

Voir le plan ${nextPlan.plan} : ${data.upgradeUrl}

--${data.unsubscribeUrl ? `\nSe désinscrire : ${data.unsubscribeUrl}\n` : ''}
Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

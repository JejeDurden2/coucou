import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export type LimitType = 'projects' | 'prompts';

export interface PlanLimitEmailData {
  userName: string;
  currentPlan: 'FREE' | 'SOLO';
  limitType: LimitType;
  currentUsage: number;
  maxAllowed: number;
  upgradeUrl: string;
}

const LIMIT_LABELS: Record<LimitType, string> = {
  projects: 'projets',
  prompts: 'prompts',
};

const NEXT_PLAN_LIMITS = {
  FREE: { plan: 'SOLO', projects: 5, prompts: 10 },
  SOLO: { plan: 'PRO', projects: 15, prompts: 50 },
} as const;

export function generatePlanLimitEmail(data: PlanLimitEmailData): { html: string; text: string } {
  const limitLabel = LIMIT_LABELS[data.limitType];
  const nextPlan = NEXT_PLAN_LIMITS[data.currentPlan];

  const content = `
    ${createHeading(`Limite de ${limitLabel} atteinte`, 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`Vous avez atteint la limite de <strong>${data.maxAllowed} ${limitLabel}</strong> de votre plan ${data.currentPlan}.`)}

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
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Prompts par projet</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${nextPlan.prompts}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${createButton(`Voir le plan ${nextPlan.plan}`, data.upgradeUrl)}
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Vous avez atteint la limite de ${limitLabel} de votre plan.`,
  });

  const text = `
Limite de ${limitLabel} atteinte

Bonjour ${data.userName},

Vous avez atteint la limite de ${data.maxAllowed} ${limitLabel} de votre plan ${data.currentPlan}.

Plan ${nextPlan.plan} :
- ${nextPlan.projects} projets
- ${nextPlan.prompts} prompts par projet

Voir le plan ${nextPlan.plan} : ${data.upgradeUrl}

--
Coucou - Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

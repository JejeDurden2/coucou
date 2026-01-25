import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface PlanUpgradeEmailData {
  userName: string;
  planName: 'SOLO' | 'PRO';
  dashboardUrl: string;
}

const PLAN_FEATURES = {
  SOLO: {
    projects: 5,
    promptsPerProject: 10,
    models: ['GPT-4o-mini', 'GPT-4o', 'Claude Sonnet 4'],
  },
  PRO: {
    projects: 15,
    promptsPerProject: 50,
    models: ['GPT-4o-mini', 'GPT-4o', 'GPT-5.2', 'Claude Sonnet 4', 'Claude Opus 4.5'],
  },
} as const;

export function generatePlanUpgradeEmail(data: PlanUpgradeEmailData): {
  html: string;
  text: string;
} {
  const features = PLAN_FEATURES[data.planName];

  const content = `
    ${createHeading(`Votre plan ${data.planName} est actif`, 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`Votre compte a été mis à niveau vers le plan <strong>${data.planName}</strong>.`)}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: ${EMAIL_COLORS.text};">
            Votre plan inclut :
          </p>
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Projets</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${features.projects}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Requêtes par projet</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${features.promptsPerProject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Modèles IA</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${features.models.length}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${createButton('Accéder au dashboard', data.dashboardUrl)}
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Votre plan ${data.planName} est maintenant actif.`,
  });

  const text = `
Votre plan ${data.planName} est actif

Bonjour ${data.userName},

Votre compte a été mis à niveau vers le plan ${data.planName}.

Votre plan inclut :
- ${features.projects} projets
- ${features.promptsPerProject} requêtes par projet
- ${features.models.length} modèles IA (${features.models.join(', ')})

Accéder au dashboard : ${data.dashboardUrl}

--
Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

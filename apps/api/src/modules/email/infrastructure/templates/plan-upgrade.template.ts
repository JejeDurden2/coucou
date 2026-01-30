import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  createProviderList,
  createProviderListText,
  EMAIL_COLORS,
  type EmailProvider,
} from './base.template';

export interface PlanUpgradeEmailData {
  userName: string;
  planName: 'SOLO' | 'PRO';
  dashboardUrl: string;
}

const PLAN_FEATURES: Record<
  'SOLO' | 'PRO',
  { projects: number; promptsPerProject: number; providers: EmailProvider[] }
> = {
  SOLO: {
    projects: 5,
    promptsPerProject: 10,
    providers: ['CHATGPT', 'CLAUDE'],
  },
  PRO: {
    projects: 15,
    promptsPerProject: 50,
    providers: ['CHATGPT', 'CLAUDE'],
  },
};

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
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">IA analysées</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${createProviderList(features.providers)}</td>
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
- IA analysées : ${createProviderListText(features.providers)}

Accéder au dashboard : ${data.dashboardUrl}

--
Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

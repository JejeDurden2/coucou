import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface PlanDowngradeEmailData {
  userName: string;
  currentPlan: 'SOLO' | 'PRO';
  effectiveDate: string;
  dashboardUrl: string;
}

const PLAN_FEATURES = {
  SOLO: {
    projects: 5,
    promptsPerProject: 10,
    models: 3,
  },
  PRO: {
    projects: 15,
    promptsPerProject: 50,
    models: 5,
  },
} as const;

const FREE_LIMITS = {
  projects: 1,
  promptsPerProject: 2,
  models: 1,
} as const;

function formatDateFr(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

export function generatePlanDowngradeEmail(data: PlanDowngradeEmailData): {
  html: string;
  text: string;
} {
  const currentFeatures = PLAN_FEATURES[data.currentPlan];
  const formattedDate = formatDateFr(data.effectiveDate);

  const content = `
    ${createHeading("Confirmation d'annulation d'abonnement", 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`Votre demande d'annulation a bien été enregistrée.`)}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: ${EMAIL_COLORS.warning}15; border-radius: 8px; border: 1px solid ${EMAIL_COLORS.warning}40;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: ${EMAIL_COLORS.text};">
            📅 Date effective d'annulation : <strong>${formattedDate}</strong>
          </p>
        </td>
      </tr>
    </table>

    ${createParagraph("Vous conservez l'accès à toutes les fonctionnalités de votre plan <strong>" + data.currentPlan + "</strong> jusqu'à cette date.")}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: ${EMAIL_COLORS.text};">
            Votre plan actuel (jusqu'au ${formattedDate}) :
          </p>
          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Projets</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${currentFeatures.projects}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Requêtes par projet</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${currentFeatures.promptsPerProject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Modèles IA</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${currentFeatures.models}</td>
            </tr>
          </table>

          <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: ${EMAIL_COLORS.text};">
            Plan FREE (à partir du ${formattedDate}) :
          </p>
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Projets</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.warning}; text-align: right; font-weight: 500;">${FREE_LIMITS.projects}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Requêtes par projet</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.warning}; text-align: right; font-weight: 500;">${FREE_LIMITS.promptsPerProject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Modèles IA</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.warning}; text-align: right; font-weight: 500;">${FREE_LIMITS.models}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${createParagraph("Vous avez changé d'avis ? Vous pouvez réactiver votre abonnement à tout moment depuis votre tableau de bord.")}

    ${createButton('Accéder au dashboard', data.dashboardUrl)}
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Votre abonnement sera annulé le ${formattedDate}.`,
  });

  const text = `
Confirmation d'annulation d'abonnement

Bonjour ${data.userName},

Votre demande d'annulation a bien été enregistrée.

📅 Date effective d'annulation : ${formattedDate}

Vous conservez l'accès à toutes les fonctionnalités de votre plan ${data.currentPlan} jusqu'à cette date.

Votre plan actuel (jusqu'au ${formattedDate}) :
- ${currentFeatures.projects} projets
- ${currentFeatures.promptsPerProject} requêtes par projet
- ${currentFeatures.models} modèles IA

Plan FREE (à partir du ${formattedDate}) :
- ${FREE_LIMITS.projects} projet
- ${FREE_LIMITS.promptsPerProject} requêtes par projet
- ${FREE_LIMITS.models} modèle IA

Vous avez changé d'avis ? Vous pouvez réactiver votre abonnement à tout moment depuis votre tableau de bord.

Accéder au dashboard : ${data.dashboardUrl}

--
Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

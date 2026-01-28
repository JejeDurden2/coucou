import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface DunningUrgentEmailData {
  userName: string;
  planName: 'SOLO' | 'PRO';
  billingUrl: string;
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

export function generateDunningUrgentEmail(data: DunningUrgentEmailData): {
  html: string;
  text: string;
} {
  const currentFeatures = PLAN_FEATURES[data.planName];

  const content = `
    ${createHeading("Votre abonnement risque d'être suspendu", 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`Votre paiement pour le plan <strong>${data.planName}</strong> n'a toujours pas pu être traité. Sans action de votre part, votre compte sera rétrogradé au plan Gratuit.`)}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: ${EMAIL_COLORS.textMuted};"></td>
              <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: ${EMAIL_COLORS.text}; text-align: right;">Plan ${data.planName}</td>
              <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: ${EMAIL_COLORS.warning}; text-align: right;">Plan Gratuit</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted}; border-top: 1px solid ${EMAIL_COLORS.border};">Projets</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500; border-top: 1px solid ${EMAIL_COLORS.border};">${currentFeatures.projects}</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.warning}; text-align: right; font-weight: 500; border-top: 1px solid ${EMAIL_COLORS.border};">${FREE_LIMITS.projects}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Requêtes par projet</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${currentFeatures.promptsPerProject}</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.warning}; text-align: right; font-weight: 500;">${FREE_LIMITS.promptsPerProject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Modèles IA</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${currentFeatures.models}</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.warning}; text-align: right; font-weight: 500;">${FREE_LIMITS.models}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${createButton('Mettre à jour mon paiement', data.billingUrl)}

    <p style="margin: 24px 0 0; font-size: 13px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      Des questions ? Répondez directement à cet email.
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Action requise : votre abonnement ${data.planName} risque d'être suspendu.`,
  });

  const text = `
Action requise : votre abonnement risque d'être suspendu

Bonjour ${data.userName},

Votre paiement pour le plan ${data.planName} n'a toujours pas pu être traité. Sans action de votre part, votre compte sera rétrogradé au plan Gratuit.

Votre plan ${data.planName} :
- ${currentFeatures.projects} projets
- ${currentFeatures.promptsPerProject} requêtes par projet
- ${currentFeatures.models} modèles IA

Plan Gratuit :
- ${FREE_LIMITS.projects} projet
- ${FREE_LIMITS.promptsPerProject} requêtes par projet
- ${FREE_LIMITS.models} modèle IA

Mettre à jour mon paiement : ${data.billingUrl}

Des questions ? Répondez directement à cet email.

--
Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

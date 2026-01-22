import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface SubscriptionEndedEmailData {
  userName: string;
  previousPlan: 'SOLO' | 'PRO';
  billingUrl: string;
}

const FREE_LIMITS = {
  projects: 1,
  promptsPerProject: 2,
  models: 1,
  scanFrequency: 'hebdomadaires',
} as const;

export function generateSubscriptionEndedEmail(
  data: SubscriptionEndedEmailData,
): { html: string; text: string } {
  const content = `
    ${createHeading('Votre abonnement a pris fin', 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`Votre abonnement <strong>${data.previousPlan}</strong> est maintenant terminé. Votre compte est passé au plan Gratuit.`)}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: ${EMAIL_COLORS.text};">
            Avec le plan Gratuit, vous avez accès à :
          </p>
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Projets</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${FREE_LIMITS.projects}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Prompts par projet</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${FREE_LIMITS.promptsPerProject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Modèles IA</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${FREE_LIMITS.models} (GPT-4o-mini)</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Scans</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${FREE_LIMITS.scanFrequency}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${createParagraph('Envie de retrouver toutes les fonctionnalités ? Vous pouvez upgrader à tout moment.')}

    ${createButton('Voir les plans', data.billingUrl)}

    ${createParagraph('<span style="color: ' + EMAIL_COLORS.textMuted + '; font-size: 14px;">Des questions ? Répondez à cet email, nous sommes là pour vous aider.</span>')}
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Votre abonnement Coucou IA a pris fin',
  });

  const text = `
Votre abonnement a pris fin

Bonjour ${data.userName},

Votre abonnement ${data.previousPlan} est maintenant terminé. Votre compte est passé au plan Gratuit.

Avec le plan Gratuit, vous avez accès à :
- ${FREE_LIMITS.projects} projet
- ${FREE_LIMITS.promptsPerProject} prompts par projet
- ${FREE_LIMITS.models} modèle IA (GPT-4o-mini uniquement)
- Scans ${FREE_LIMITS.scanFrequency}

Envie de retrouver toutes les fonctionnalités ? Vous pouvez upgrader à tout moment.

Voir les plans : ${data.billingUrl}

Des questions ? Répondez à cet email, nous sommes là pour vous aider.

--
Coucou - Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

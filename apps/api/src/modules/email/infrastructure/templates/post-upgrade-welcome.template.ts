import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface PostUpgradeWelcomeEmailData {
  userName: string;
  planName: 'SOLO' | 'PRO';
  dashboardUrl: string;
}

const PLAN_STEPS = {
  SOLO: [
    "Créez jusqu'à 5 projets",
    "Ajoutez jusqu'à 10 requêtes par projet",
    'Activez les analyses automatiques',
  ],
  PRO: [
    "Créez jusqu'à 15 projets",
    "Ajoutez jusqu'à 50 requêtes par projet",
    'Analysez 5 modèles IA dont GPT-5.2 et Claude Opus 4.5',
  ],
} as const;

export function generatePostUpgradeWelcomeEmail(data: PostUpgradeWelcomeEmailData): {
  html: string;
  text: string;
} {
  const steps = PLAN_STEPS[data.planName];

  const stepsHtml = steps
    .map(
      (step, index) =>
        `<li style="margin-bottom: 8px;"><strong>${index + 1}.</strong> ${step}</li>`,
    )
    .join('\n        ');

  const content = `
    ${createHeading(`Bienvenue sur le plan ${data.planName}`, 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`Félicitations ! Votre plan <strong>${data.planName}</strong> est maintenant actif. Voici comment tirer le maximum de Coucou IA :`)}

    ${createHeading('Vos prochaines étapes', 3)}

    <ol style="margin: 0 0 24px; padding-left: 20px; color: ${EMAIL_COLORS.text}; font-size: 14px; line-height: 2; list-style: none;">
        ${stepsHtml}
    </ol>

    ${createButton('Explorer mes nouvelles fonctionnalités', data.dashboardUrl)}

    <p style="margin: 24px 0 0; font-size: 13px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      Des questions ? Répondez directement à cet email.
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Bienvenue sur le plan ${data.planName} — tirez le maximum de Coucou IA.`,
  });

  const text = `
Bienvenue sur le plan ${data.planName} — tirez le maximum de Coucou IA

Bonjour ${data.userName},

Félicitations ! Votre plan ${data.planName} est maintenant actif. Voici comment tirer le maximum de Coucou IA :

Vos prochaines étapes :
${steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

Explorer mes nouvelles fonctionnalités : ${data.dashboardUrl}

Des questions ? Répondez directement à cet email.

--
Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  createInfoBox,
  EMAIL_COLORS,
} from './base.template';

export interface OnboardingCompetitorFomoEmailData {
  firstName: string;
  projectUrl: string;
  unsubscribeUrl: string;
}

export function generateOnboardingCompetitorFomoEmail(data: OnboardingCompetitorFomoEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Vos concurrents sont peut-être déjà cités par les IA', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph('Les réponses de ChatGPT et Claude changent régulièrement. Pendant que vous hésitez, vos concurrents sont peut-être en train de gagner en visibilité IA.')}

    ${createInfoBox(`<p style="margin: 0; font-size: 14px; color: ${EMAIL_COLORS.text};">Ne laissez pas les autres prendre votre place dans les recommandations des IA.</p>`, 'warning')}

    ${createButton('Vérifier ma visibilité', data.projectUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Vos concurrents gagnent peut-être en visibilité IA pendant que vous hésitez.',
  });

  const text = `
Vos concurrents sont peut-être déjà cités par les IA

Bonjour ${data.firstName},

Les réponses de ChatGPT et Claude changent régulièrement. Pendant que vous hésitez, vos concurrents sont peut-être en train de gagner en visibilité IA.

Ne laissez pas les autres prendre votre place dans les recommandations des IA.

Vérifier ma visibilité : ${data.projectUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

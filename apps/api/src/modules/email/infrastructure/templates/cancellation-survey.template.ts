import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface CancellationSurveyEmailData {
  userName: string;
  surveyUrl: string;
}

export function generateCancellationSurveyEmail(data: CancellationSurveyEmailData): {
  html: string;
  text: string;
} {
  const reasons = [
    { label: 'Trop cher', param: 'too_expensive' },
    { label: 'Pas assez de valeur', param: 'not_enough_value' },
    { label: 'Fonctionnalités manquantes', param: 'missing_features' },
    { label: 'Trouvé une alternative', param: 'found_alternative' },
    { label: 'Pas besoin pour le moment', param: 'no_need' },
  ];

  const reasonsHtml = reasons
    .map(
      (r) =>
        `<li style="margin-bottom: 8px;"><a href="${data.surveyUrl}?reason=${r.param}" style="color: ${EMAIL_COLORS.primary}; text-decoration: underline; font-size: 14px;">${r.label}</a></li>`,
    )
    .join('\n            ');

  const reasonsText = reasons
    .map((r) => `- ${r.label} : ${data.surveyUrl}?reason=${r.param}`)
    .join('\n');

  const content = `
    ${createHeading('Pourquoi nous quittez-vous ?', 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph("Nous avons bien enregistré l'annulation de votre abonnement. Votre avis nous aide à améliorer Coucou IA.")}

    ${createParagraph('Pourriez-vous nous dire ce qui a motivé votre décision ?')}

    <ul style="margin: 0 0 24px; padding-left: 20px; list-style: none;">
            ${reasonsHtml}
    </ul>

    ${createButton('Donner mon avis', data.surveyUrl)}

    <p style="margin: 24px 0 0; font-size: 13px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      Des questions ? Répondez directement à cet email.
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Votre avis nous aide à améliorer Coucou IA.',
  });

  const text = `
Pourquoi nous quittez-vous ?

Bonjour ${data.userName},

Nous avons bien enregistré l'annulation de votre abonnement. Votre avis nous aide à améliorer Coucou IA.

Pourriez-vous nous dire ce qui a motivé votre décision ?

${reasonsText}

Donner mon avis : ${data.surveyUrl}

Des questions ? Répondez directement à cet email.

--
Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

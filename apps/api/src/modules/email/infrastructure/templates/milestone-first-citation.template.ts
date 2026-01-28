import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  createInfoBox,
  EMAIL_COLORS,
} from './base.template';

export interface MilestoneFirstCitationEmailData {
  firstName: string;
  brandName: string;
  projectUrl: string;
  unsubscribeUrl: string;
}

export function generateMilestoneFirstCitationEmail(data: MilestoneFirstCitationEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Votre marque a été citée par une IA !', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createInfoBox(
      `<p style="margin: 0; font-size: 15px; color: ${EMAIL_COLORS.text};"><strong>${data.brandName}</strong> a été mentionnée dans une réponse IA.</p>`,
      'success',
    )}

    ${createParagraph("C'est le premier pas vers une visibilité IA solide. Continuez à surveiller et à optimiser.")}

    ${createButton('Voir les détails', data.projectUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `${data.brandName} a été citée par une IA pour la première fois !`,
  });

  const text = `
Votre marque a été citée par une IA !

Bonjour ${data.firstName},

Bonne nouvelle ! ${data.brandName} a été mentionnée dans une réponse IA. C'est le premier pas vers une visibilité IA solide. Continuez à surveiller et à optimiser.

Voir les détails : ${data.projectUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

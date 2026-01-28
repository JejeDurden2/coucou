import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface PaidInactivityEmailData {
  firstName: string;
  brandName: string;
  projectUrl: string;
  unsubscribeUrl: string;
}

export function generatePaidInactivityEmail(data: PaidInactivityEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Vos analyses automatiques tournent', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph(`Cela fait un moment que vous n'avez pas consulté vos résultats pour <strong>${data.brandName}</strong>.`)}

    ${createParagraph("Vos analyses automatiques continuent de surveiller votre visibilité IA. Prenez quelques minutes pour vérifier l'évolution de votre positionnement.")}

    ${createButton('Voir mes résultats', data.projectUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Vos analyses automatiques pour ${data.brandName} continuent — consultez vos résultats.`,
  });

  const text = `
Vos analyses automatiques tournent — consultez vos résultats

Bonjour ${data.firstName},

Cela fait un moment que vous n'avez pas consulté vos résultats pour ${data.brandName}.

Vos analyses automatiques continuent de surveiller votre visibilité IA. Prenez quelques minutes pour vérifier l'évolution de votre positionnement.

Voir mes résultats : ${data.projectUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

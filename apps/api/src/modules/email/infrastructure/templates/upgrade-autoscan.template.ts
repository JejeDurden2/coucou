import {
  wrapInBaseTemplate,
  createButton,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface UpgradeAutoscanEmailData {
  firstName: string;
  pricingUrl: string;
  unsubscribeUrl: string;
}

export function generateUpgradeAutoscanEmail(data: UpgradeAutoscanEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Vos analyses automatiques vous attendent', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph('Imaginez recevoir chaque semaine un rapport montrant si votre visibilité IA a changé — sans rien faire.')}

    ${createParagraph("C'est exactement ce que le plan Solo vous offre avec les <strong>analyses automatiques</strong>.")}

    ${createButton('Activer les analyses automatiques', data.pricingUrl)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Recevez un rapport de visibilité IA chaque semaine, automatiquement.',
  });

  const text = `
Vos analyses automatiques vous attendent

Bonjour ${data.firstName},

Imaginez recevoir chaque semaine un rapport montrant si votre visibilité IA a changé — sans rien faire.

C'est exactement ce que le plan Solo vous offre avec les analyses automatiques.

Activer les analyses automatiques : ${data.pricingUrl}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

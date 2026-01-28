import { wrapInBaseTemplate, createParagraph, EMAIL_COLORS } from './base.template';

export interface FounderOutreachEmailData {
  firstName: string;
  dashboardUrl: string;
}

export function generateFounderOutreachEmail(data: FounderOutreachEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createParagraph("Je suis Jérôme, fondateur de Coucou IA. Je voulais prendre un moment pour vous remercier personnellement d'avoir rejoint le plan payant.")}

    ${createParagraph("Coucou IA est né d'un constat simple : les IA comme ChatGPT et Claude sont en train de devenir le premier réflexe pour trouver des solutions. Et pourtant, très peu de marques savent si elles sont citées dans ces réponses.")}

    ${createParagraph('Si vous avez des questions, des suggestions ou simplement envie de discuter de votre stratégie GEO, répondez directement à cet email. Je lis et réponds à chaque message.')}

    ${createParagraph('Bonne continuation avec Coucou IA !')}

    ${createParagraph('Jérôme')}

    <p style="margin: 16px 0 0; font-size: 13px; color: ${EMAIL_COLORS.textMuted};">
      <a href="${data.dashboardUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Accéder à mon dashboard</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Un petit message personnel de Jérôme, fondateur de Coucou IA.',
  });

  const text = `
Bonjour ${data.firstName},

Je suis Jérôme, fondateur de Coucou IA. Je voulais prendre un moment pour vous remercier personnellement d'avoir rejoint le plan payant.

Coucou IA est né d'un constat simple : les IA comme ChatGPT et Claude sont en train de devenir le premier réflexe pour trouver des solutions. Et pourtant, très peu de marques savent si elles sont citées dans ces réponses.

Si vous avez des questions, des suggestions ou simplement envie de discuter de votre stratégie GEO, répondez directement à cet email. Je lis et réponds à chaque message.

Bonne continuation avec Coucou IA !

Jérôme

Accéder à mon dashboard : ${data.dashboardUrl}

--
Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

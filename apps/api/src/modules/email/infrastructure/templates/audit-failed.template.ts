import {
  wrapInBaseTemplate,
  createButton,
  createInfoBox,
  createParagraph,
  createHeading,
  EMAIL_COLORS,
} from './base.template';

export interface AuditFailedEmailData {
  firstName: string;
  brandName: string;
  supportEmail: string;
  unsubscribeUrl: string;
}

export function generateAuditFailedEmail(data: AuditFailedEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Un problème est survenu avec votre audit', 1)}

    ${createParagraph(`Bonjour ${data.firstName},`)}

    ${createInfoBox(
      `<p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${EMAIL_COLORS.text};">
        L'audit GEO pour <strong>${data.brandName}</strong> n'a pas pu être complété. Notre équipe a été notifiée et investigue le problème.
      </p>`,
      'warning',
    )}

    ${createParagraph('Nous vous recontacterons dès que votre audit sera prêt, ou vous pouvez contacter notre support.')}

    ${createButton('Contacter le support', `mailto:${data.supportEmail}`)}

    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-align: center;">
      <a href="${data.unsubscribeUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">Se désinscrire des emails</a>
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `Un problème est survenu avec l'audit GEO pour ${data.brandName}.`,
  });

  const text = `
Un problème est survenu avec votre audit

Bonjour ${data.firstName},

L'audit GEO pour ${data.brandName} n'a pas pu être complété. Notre équipe a été notifiée et investigue le problème.

Nous vous recontacterons dès que votre audit sera prêt, ou vous pouvez contacter notre support.

Contacter le support : ${data.supportEmail}

--
Se désinscrire : ${data.unsubscribeUrl}

Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

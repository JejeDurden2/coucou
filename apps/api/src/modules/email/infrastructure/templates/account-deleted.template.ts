import { wrapInBaseTemplate, createParagraph, createHeading, EMAIL_COLORS } from './base.template';

export interface AccountDeletedEmailData {
  userName: string;
}

export function generateAccountDeletedEmail(data: AccountDeletedEmailData): {
  html: string;
  text: string;
} {
  const content = `
    ${createHeading('Confirmation de suppression de compte', 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph('Nous vous confirmons que votre compte Coucou IA a bien été supprimé.')}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: ${EMAIL_COLORS.text};">
            Ce qui a été supprimé :
          </p>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: ${EMAIL_COLORS.textMuted}; line-height: 1.8;">
            <li>Vos données personnelles</li>
            <li>Vos projets et requêtes</li>
            <li>Votre historique d'analyses</li>
            <li>Votre abonnement (le cas échéant)</li>
          </ul>
        </td>
      </tr>
    </table>

    ${createParagraph('Si vous aviez un abonnement actif, il a été annulé et vous recevrez un remboursement au prorata pour la période non utilisée.')}

    ${createParagraph("Nous sommes désolés de vous voir partir. Si vous changez d'avis, vous pourrez toujours créer un nouveau compte sur coucou-ia.com.")}

    ${createParagraph("Merci d'avoir utilisé Coucou.")}
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: 'Votre compte Coucou IA a bien été supprimé.',
  });

  const text = `
Confirmation de suppression de compte

Bonjour ${data.userName},

Nous vous confirmons que votre compte Coucou IA a bien été supprimé.

Ce qui a été supprimé :
- Vos données personnelles
- Vos projets et requêtes
- Votre historique d'analyses
- Votre abonnement (le cas échéant)

Si vous aviez un abonnement actif, il a été annulé et vous recevrez un remboursement au prorata pour la période non utilisée.

Nous sommes désolés de vous voir partir. Si vous changez d'avis, vous pourrez toujours créer un nouveau compte sur coucou-ia.com.

Merci d'avoir utilisé Coucou.

--
Coucou IA - Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

import {
  wrapInBaseTemplate,
  createHeading,
  createParagraph,
  createInfoBox,
  EMAIL_COLORS,
} from './base.template';

export interface SupportRequestEmailData {
  userEmail: string;
  userId: string;
  plan: 'SOLO' | 'PRO';
  category: 'bug' | 'question' | 'billing' | 'other';
  subject: string;
  message: string;
  projectName?: string;
  projectId?: string;
  timestamp: string;
}

const PLAN_BADGE_COLORS = {
  SOLO: '#3b82f6', // blue-500
  PRO: EMAIL_COLORS.primary, // violet-500
} as const;

const CATEGORY_LABELS: Record<SupportRequestEmailData['category'], string> = {
  bug: 'Bug',
  question: 'Question',
  billing: 'Facturation',
  other: 'Autre',
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createBadge(text: string, color: string): string {
  return `<span style="display: inline-block; padding: 4px 10px; font-size: 12px; font-weight: 600; color: #ffffff; background-color: ${color}; border-radius: 4px;">${text}</span>`;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateSupportRequestEmail(data: SupportRequestEmailData): {
  html: string;
  text: string;
} {
  const safeEmail = escapeHtml(data.userEmail);
  const safeSubject = escapeHtml(data.subject);
  const safeMessage = escapeHtml(data.message);
  const safeProjectName = data.projectName ? escapeHtml(data.projectName) : undefined;

  const planBadge = createBadge(data.plan, PLAN_BADGE_COLORS[data.plan]);
  const categoryLabel = CATEGORY_LABELS[data.category];
  const formattedDate = formatTimestamp(data.timestamp);

  const projectRow = safeProjectName
    ? `<tr>
        <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Projet</td>
        <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${safeProjectName} <span style="color: ${EMAIL_COLORS.textMuted};">(${data.projectId})</span></td>
      </tr>`
    : `<tr>
        <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Projet</td>
        <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted}; text-align: right; font-style: italic;">Non spécifié</td>
      </tr>`;

  const content = `
    ${createHeading('Nouvelle demande de support', 1)}

    ${createParagraph(`Catégorie : <strong>${categoryLabel}</strong>`)}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Email</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${safeEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">User ID</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500;">${data.userId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">Plan</td>
              <td style="padding: 8px 0; text-align: right;">${planBadge}</td>
            </tr>
            ${projectRow}
          </table>
        </td>
      </tr>
    </table>

    ${createHeading(safeSubject, 2)}

    ${createInfoBox(`<div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: ${EMAIL_COLORS.text};">${safeMessage}</div>`)}

    <p style="margin: 24px 0 0; font-size: 13px; color: ${EMAIL_COLORS.textMuted};">
      Envoyé le ${formattedDate}
    </p>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `[${data.plan}] ${categoryLabel} - ${safeSubject}`,
  });

  const projectLine = data.projectName
    ? `- Projet : ${data.projectName} (${data.projectId})`
    : '- Projet : Non spécifié';

  const text = `
Nouvelle demande de support

Catégorie : ${categoryLabel}

---
Informations utilisateur
- Email : ${data.userEmail}
- User ID : ${data.userId}
- Plan : ${data.plan}
${projectLine}

---
Sujet : ${data.subject}

${data.message}

---
Envoyé le ${formattedDate}

--
Coucou IA - Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

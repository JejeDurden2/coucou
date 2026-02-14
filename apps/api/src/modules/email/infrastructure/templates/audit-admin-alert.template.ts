import { wrapInBaseTemplate, createHeading, createParagraph, EMAIL_COLORS } from './base.template';

export interface AuditAdminAlertEmailData {
  auditOrderId: string;
  brandName: string;
  projectId: string;
  userId: string;
  userEmail: string;
  status: string;
  failureReason: string | null;
  twinAgentId: string | null;
  startedAt: string | null;
  failedAt: string;
  executionDuration: string | null;
  refundStatus: 'refunded' | 'failed' | 'not_applicable';
  refundId: string | null;
  amountCents: number;
}

function row(label: string, value: string | null): string {
  return `
    <tr>
      <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.textMuted};">${label}</td>
      <td style="padding: 8px 0; font-size: 14px; color: ${EMAIL_COLORS.text}; text-align: right; font-weight: 500; word-break: break-all;">${value ?? '—'}</td>
    </tr>`;
}

export function generateAuditAdminAlertEmail(data: AuditAdminAlertEmailData): {
  html: string;
  text: string;
} {
  const statusColor =
    data.status === 'TIMEOUT'
      ? EMAIL_COLORS.warning
      : EMAIL_COLORS.destructive;

  const content = `
    ${createHeading('Audit GEO échoué', 1)}

    ${createParagraph(`Un audit a échoué avec le statut <strong style="color: ${statusColor};">${data.status}</strong>.`)}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: ${EMAIL_COLORS.cardHover}; border-radius: 8px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            ${row('Audit ID', data.auditOrderId)}
            ${row('Status', data.status)}
            ${row('Brand', data.brandName)}
            ${row('Project ID', data.projectId)}
            ${row('User ID', data.userId)}
            ${row('User Email', data.userEmail)}
            ${row('Twin Agent ID', data.twinAgentId)}
            ${row('Failure Reason', data.failureReason)}
            ${row('Started At', data.startedAt)}
            ${row('Failed At', data.failedAt)}
            ${row('Duration', data.executionDuration)}
            ${row('Refund', data.refundStatus === 'refunded'
              ? `Remboursé (${data.refundId})`
              : data.refundStatus === 'failed'
                ? 'ECHEC DU REMBOURSEMENT'
                : 'N/A'
            )}
            ${row('Amount', `${(data.amountCents / 100).toFixed(2)} EUR`)}
          </table>
        </td>
      </tr>
    </table>
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `[ALERTE] Audit ${data.status} pour ${data.brandName} — ${data.auditOrderId}`,
  });

  const text = `
Audit GEO échoué

Un audit a échoué avec le statut ${data.status}.

- Audit ID : ${data.auditOrderId}
- Status : ${data.status}
- Brand : ${data.brandName}
- Project ID : ${data.projectId}
- User ID : ${data.userId}
- User Email : ${data.userEmail}
- Twin Agent ID : ${data.twinAgentId ?? '—'}
- Failure Reason : ${data.failureReason ?? '—'}
- Started At : ${data.startedAt ?? '—'}
- Failed At : ${data.failedAt}
- Duration : ${data.executionDuration ?? '—'}
- Refund : ${data.refundStatus === 'refunded' ? `Remboursé (${data.refundId})` : data.refundStatus === 'failed' ? 'ECHEC DU REMBOURSEMENT' : 'N/A'}
- Amount : ${(data.amountCents / 100).toFixed(2)} EUR

--
Coucou IA- Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}

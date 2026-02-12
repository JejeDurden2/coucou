import type { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';
import type { AuditOrder } from '../entities/audit-order.entity';

export const AUDIT_PDF_PORT = Symbol('AUDIT_PDF_PORT');

export interface AuditPdfPort {
  generateReport(
    auditOrder: AuditOrder,
  ): Promise<Result<{ url: string }, DomainError>>;
}

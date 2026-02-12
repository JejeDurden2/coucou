import { Injectable } from '@nestjs/common';

import type { Result } from '../../../../common/utils/result';
import { Result as R } from '../../../../common/utils/result';
import { DomainError } from '../../../../common/errors/domain-error';
import type { AuditPdfPort } from '../../domain/ports/audit-pdf.port';
import type { AuditOrder } from '../../domain/entities/audit-order.entity';

class AuditPdfNotImplementedError extends DomainError {
  readonly code = 'AUDIT_PDF_NOT_IMPLEMENTED' as const;
  readonly statusCode = 501 as const;

  constructor() {
    super('La génération de rapport PDF n\'est pas encore implémentée');
  }
}

@Injectable()
export class StubAuditPdfAdapter implements AuditPdfPort {
  async generateReport(
    _auditOrder: AuditOrder,
  ): Promise<Result<{ url: string }, DomainError>> {
    return R.err(new AuditPdfNotImplementedError());
  }
}

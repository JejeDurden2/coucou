import type { AuditAnalysis, TwinObservations } from '@coucou-ia/shared';

import type { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';

export const AUDIT_ANALYZER_PORT = Symbol('AUDIT_ANALYZER_PORT');

export interface AuditAnalyzerPort {
  analyze(
    observations: TwinObservations,
    brandContext: {
      name: string;
      domain: string;
      businessType: string;
      locality: string;
    },
  ): Promise<Result<AuditAnalysis, DomainError>>;
}

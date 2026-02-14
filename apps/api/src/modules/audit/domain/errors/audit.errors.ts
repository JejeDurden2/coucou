import { DomainError } from '../../../../common/errors/domain-error';

export class AuditNotFoundError extends DomainError {
  readonly code = 'AUDIT_NOT_FOUND' as const;
  readonly statusCode = 404 as const;

  constructor(auditId: string) {
    super(`Audit "${auditId}" introuvable`, { auditId });
  }
}

export class AuditAlreadyActiveError extends DomainError {
  readonly code = 'AUDIT_ALREADY_ACTIVE' as const;
  readonly statusCode = 409 as const;

  constructor(projectId: string) {
    super('Un audit est déjà en cours pour ce projet', { projectId });
  }
}

export class AuditInvalidTransitionError extends DomainError {
  readonly code = 'AUDIT_INVALID_TRANSITION' as const;
  readonly statusCode = 400 as const;

  constructor(currentStatus: string, targetStatus: string) {
    super(`Transition invalide : ${currentStatus} → ${targetStatus}`, {
      currentStatus,
      targetStatus,
    });
  }
}

export class AuditBriefAssemblyError extends DomainError {
  readonly code = 'AUDIT_BRIEF_ASSEMBLY_ERROR' as const;
  readonly statusCode = 500 as const;

  constructor(reason: string, projectId?: string) {
    super(`Erreur lors de la construction du brief d'audit : ${reason}`, {
      reason,
      ...(projectId && { projectId }),
    });
  }
}

export class AuditAgentTriggerError extends DomainError {
  readonly code = 'AUDIT_AGENT_TRIGGER_ERROR' as const;
  readonly statusCode = 502 as const;

  constructor(reason: string) {
    super(`Erreur lors du déclenchement de l'agent d'audit : ${reason}`, {
      reason,
    });
  }
}

export class AuditPdfGenerationError extends DomainError {
  readonly code = 'AUDIT_PDF_GENERATION_ERROR' as const;
  readonly statusCode = 500 as const;

  constructor(reason: string, auditOrderId?: string) {
    super(`Erreur lors de la génération du rapport PDF : ${reason}`, {
      reason,
      ...(auditOrderId && { auditOrderId }),
    });
  }
}

export class AuditStorageError extends DomainError {
  readonly code = 'AUDIT_STORAGE_ERROR' as const;
  readonly statusCode = 502 as const;

  constructor(operation: string, reason: string) {
    super(`Erreur de stockage (${operation}) : ${reason}`, {
      operation,
      reason,
    });
  }
}

export class AuditAnalysisError extends DomainError {
  readonly code = 'AUDIT_ANALYSIS_ERROR' as const;
  readonly statusCode = 502 as const;

  constructor(reason: string, auditOrderId?: string) {
    super(`Erreur lors de l'analyse Mistral : ${reason}`, {
      reason,
      ...(auditOrderId && { auditOrderId }),
    });
  }
}

export class AuditAnalysisValidationError extends DomainError {
  readonly code = 'AUDIT_ANALYSIS_VALIDATION_ERROR' as const;
  readonly statusCode = 500 as const;

  constructor(reason: string, auditOrderId?: string) {
    super(`Validation de l'analyse échouée : ${reason}`, {
      reason,
      ...(auditOrderId && { auditOrderId }),
    });
  }
}

export class AuditReportNotAvailableError extends DomainError {
  readonly code = 'AUDIT_REPORT_NOT_AVAILABLE' as const;
  readonly statusCode = 400 as const;

  constructor(auditId: string, status: string) {
    super(
      `Le rapport PDF n'est pas disponible pour cet audit (statut : ${status})`,
      { auditId, status },
    );
  }
}

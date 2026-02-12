import { DomainError } from '../../../../common/errors/domain-error';

export class FileStorageError extends DomainError {
  readonly code = 'FILE_STORAGE_ERROR' as const;
  readonly statusCode = 502 as const;

  constructor(operation: string, reason: string) {
    super(`Erreur de stockage (${operation}) : ${reason}`, {
      operation,
      reason,
    });
  }
}

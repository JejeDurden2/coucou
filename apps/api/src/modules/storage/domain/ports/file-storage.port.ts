import type { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';

export const FILE_STORAGE_PORT = Symbol('FILE_STORAGE_PORT');

export interface FileStoragePort {
  upload(
    key: string,
    data: Buffer,
    contentType: string,
  ): Promise<Result<{ url: string }, DomainError>>;

  getSignedUrl(
    key: string,
    expiresInSeconds: number,
  ): Promise<Result<{ url: string }, DomainError>>;

  download(key: string): Promise<Result<Buffer, DomainError>>;

  delete(key: string): Promise<Result<void, DomainError>>;
}

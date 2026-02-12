import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';
import { LoggerService } from '../../../../common/logger';
import type { FileStoragePort } from '../../domain/ports/file-storage.port';
import { FileStorageError } from '../../domain/errors/storage.errors';

@Injectable()
export class R2StorageAdapter implements FileStoragePort {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(R2StorageAdapter.name);

    const accountId =
      this.configService.getOrThrow<string>('R2_ACCOUNT_ID');
    this.bucket =
      this.configService.getOrThrow<string>('R2_BUCKET_NAME');
    this.publicUrl =
      this.configService.get<string>('R2_PUBLIC_URL') || undefined;

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId:
          this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey:
          this.configService.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async upload(
    key: string,
    data: Buffer,
    contentType: string,
  ): Promise<Result<{ url: string }, DomainError>> {
    const start = Date.now();

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: data,
          ContentType: contentType,
          ContentDisposition: 'inline',
        }),
      );

      const durationMs = Date.now() - start;
      const url = this.publicUrl ? `${this.publicUrl}/${key}` : key;

      this.logger.info('File uploaded to R2', {
        key,
        bucket: this.bucket,
        sizeBytes: data.length,
        durationMs,
      });

      return Result.ok({ url });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('R2 upload failed', { key, error: message });
      return Result.err(new FileStorageError('upload', message));
    }
  }

  async getSignedUrl(
    key: string,
    expiresInSeconds: number,
  ): Promise<Result<{ url: string }, DomainError>> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3, command, {
        expiresIn: expiresInSeconds,
      });

      this.logger.info('Signed URL generated', { key, expiresInSeconds });

      return Result.ok({ url });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('R2 signed URL generation failed', {
        key,
        error: message,
      });
      return Result.err(new FileStorageError('getSignedUrl', message));
    }
  }

  async delete(key: string): Promise<Result<void, DomainError>> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      this.logger.info('File deleted from R2', { key, bucket: this.bucket });

      return Result.ok(undefined);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('R2 delete failed', { key, error: message });
      return Result.err(new FileStorageError('delete', message));
    }
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { promises as dns } from 'dns';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';

import { Result } from '../../../../common';
import { LoggerService } from '../../../../common/logger';
import type { EmailValidatorPort } from '../../domain/ports/email-validator.port';
import {
  DisposableEmailError,
  type EmailValidationError,
  InvalidEmailDomainError,
  InvalidEmailFormatError,
} from '../../domain/errors/email-validation.error';

const DNS_TIMEOUT_MS = 5000;

const emailSchema = z.string().email();

@Injectable()
export class DnsEmailValidatorService implements EmailValidatorPort, OnModuleInit {
  private disposableDomains: Set<string> = new Set();

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(DnsEmailValidatorService.name);
  }

  async onModuleInit(): Promise<void> {
    await this.loadDisposableDomains();
  }

  private async loadDisposableDomains(): Promise<void> {
    try {
      const filePath = join(__dirname, '../data/disposable-domains.json');
      const content = await readFile(filePath, 'utf-8');
      const domains: string[] = JSON.parse(content);
      this.disposableDomains = new Set(domains.map((d) => d.toLowerCase()));
      this.logger.info('Loaded disposable domains', { count: this.disposableDomains.size });
    } catch (error) {
      this.logger.error(
        'Failed to load disposable domains',
        error instanceof Error ? error : undefined,
      );
      // Continue with empty set - fail open
    }
  }

  async validate(email: string): Promise<Result<void, EmailValidationError>> {
    // Layer 1: Format validation (Zod)
    const formatResult = emailSchema.safeParse(email);
    if (!formatResult.success) {
      return Result.err(new InvalidEmailFormatError(email));
    }

    const domain = email.split('@')[1].toLowerCase();

    // Layer 2: Disposable domain check (O(1) Set lookup)
    if (this.disposableDomains.has(domain)) {
      return Result.err(new DisposableEmailError(domain));
    }

    // Layer 3: DNS MX lookup with timeout
    const mxResult = await this.checkMxRecords(domain);
    if (!mxResult.ok) {
      return mxResult;
    }

    return Result.ok(undefined);
  }

  private async checkMxRecords(domain: string): Promise<Result<void, EmailValidationError>> {
    try {
      const result = await Promise.race([dns.resolveMx(domain), this.timeout(DNS_TIMEOUT_MS)]);

      // Timeout returns null - fail open
      if (result === null) {
        this.logger.warn('DNS lookup timeout', { domain });
        return Result.ok(undefined);
      }

      // No MX records
      if (!result || result.length === 0) {
        return Result.err(new InvalidEmailDomainError(domain));
      }

      return Result.ok(undefined);
    } catch (error) {
      // ENOTFOUND or other DNS errors = invalid domain
      if (error instanceof Error && 'code' in error) {
        const dnsError = error as NodeJS.ErrnoException;
        if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
          return Result.err(new InvalidEmailDomainError(domain));
        }
      }
      // Other errors - fail open
      this.logger.warn('DNS lookup error', { domain });
      return Result.ok(undefined);
    }
  }

  private timeout(ms: number): Promise<null> {
    return new Promise((resolve) => setTimeout(() => resolve(null), ms));
  }
}

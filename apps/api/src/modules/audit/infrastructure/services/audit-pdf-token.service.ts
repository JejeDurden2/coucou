import { createHmac, timingSafeEqual } from 'crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LoggerService } from '../../../../common/logger';

const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface TokenPayload {
  auditOrderId: string;
  userId: string;
  timestamp: number;
}

@Injectable()
export class AuditPdfTokenService {
  private readonly secret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.secret = this.configService.getOrThrow<string>('JWT_SECRET');
    this.logger.setContext(AuditPdfTokenService.name);
  }

  generateToken(auditOrderId: string, userId: string): string {
    const payload: TokenPayload = {
      auditOrderId,
      userId,
      timestamp: Date.now(),
    };

    const payloadString = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.sign(payloadString);

    return `${payloadString}.${signature}`;
  }

  verifyToken(token: string): { auditOrderId: string; userId: string } | null {
    const parts = token.split('.');
    if (parts.length !== 2) {
      this.logger.warn('Token rejected: invalid format', { partsCount: parts.length });
      return null;
    }

    const [payloadString, providedSignature] = parts;
    const expectedSignature = this.sign(payloadString);

    const a = Buffer.from(providedSignature);
    const b = Buffer.from(expectedSignature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      this.logger.warn('Token rejected: invalid signature');
      return null;
    }

    try {
      const payload = JSON.parse(
        Buffer.from(payloadString, 'base64url').toString(),
      ) as TokenPayload;

      if (
        !payload.auditOrderId ||
        typeof payload.auditOrderId !== 'string' ||
        !payload.userId ||
        typeof payload.userId !== 'string'
      ) {
        this.logger.warn('Token rejected: missing required fields');
        return null;
      }

      if (
        typeof payload.timestamp === 'number' &&
        Date.now() - payload.timestamp > TOKEN_MAX_AGE_MS
      ) {
        this.logger.warn('Token rejected: expired', {
          ageMs: Date.now() - payload.timestamp,
          maxAgeMs: TOKEN_MAX_AGE_MS,
        });
        return null;
      }

      return { auditOrderId: payload.auditOrderId, userId: payload.userId };
    } catch {
      this.logger.warn('Token rejected: payload parse error');
      return null;
    }
  }

  private sign(payload: string): string {
    return createHmac('sha256', this.secret).update(payload).digest('base64url');
  }
}

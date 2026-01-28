import { createHmac, timingSafeEqual } from 'crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface TokenPayload {
  userId: string;
  timestamp: number;
}

@Injectable()
export class UnsubscribeTokenService {
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.getOrThrow<string>('JWT_SECRET');
  }

  generateToken(userId: string): string {
    const payload: TokenPayload = {
      userId,
      timestamp: Date.now(),
    };

    const payloadString = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.sign(payloadString);

    return `${payloadString}.${signature}`;
  }

  verifyToken(token: string): { userId: string } | null {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [payloadString, providedSignature] = parts;
    const expectedSignature = this.sign(payloadString);

    // Timing-safe comparison to prevent timing attacks
    const a = Buffer.from(providedSignature);
    const b = Buffer.from(expectedSignature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return null;
    }

    try {
      const payload = JSON.parse(
        Buffer.from(payloadString, 'base64url').toString(),
      ) as TokenPayload;

      if (!payload.userId || typeof payload.userId !== 'string') {
        return null;
      }

      // Reject expired tokens (30 days)
      if (
        typeof payload.timestamp === 'number' &&
        Date.now() - payload.timestamp > TOKEN_MAX_AGE_MS
      ) {
        return null;
      }

      return { userId: payload.userId };
    } catch {
      return null;
    }
  }

  private sign(payload: string): string {
    return createHmac('sha256', this.secret).update(payload).digest('base64url');
  }
}

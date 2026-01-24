import { createHmac } from 'crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  /**
   * Generates a signed unsubscribe token containing the userId
   * Format: base64url(payload).signature
   */
  generateToken(userId: string): string {
    const payload: TokenPayload = {
      userId,
      timestamp: Date.now(),
    };

    const payloadString = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.sign(payloadString);

    return `${payloadString}.${signature}`;
  }

  /**
   * Verifies and extracts the userId from the token
   * Returns null if the token is invalid or tampered with
   */
  verifyToken(token: string): { userId: string } | null {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [payloadString, providedSignature] = parts;
    const expectedSignature = this.sign(payloadString);

    if (providedSignature !== expectedSignature) {
      return null;
    }

    try {
      const payload = JSON.parse(
        Buffer.from(payloadString, 'base64url').toString(),
      ) as TokenPayload;

      if (!payload.userId || typeof payload.userId !== 'string') {
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

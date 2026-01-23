import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'crypto';
import type { Request } from 'express';

export interface OAuthStateData {
  nonce: string;
  termsAccepted?: boolean;
  timestamp: number;
}

// Define callback types to match passport-oauth2's StateStore interface
type StoreCallback = (err: Error | null, state: string) => void;
type VerifyCallback = (err: Error | null, ok: boolean, state?: string) => void;

/**
 * Stateless OAuth2 state store that uses HMAC signing instead of sessions.
 * The state is self-contained and signed, eliminating the need for server-side storage.
 */
@Injectable()
export class StatelessStateStore {
  private readonly secret: string;
  private readonly maxAge = 10 * 60 * 1000; // 10 minutes

  constructor(private readonly configService: ConfigService) {
    this.secret = configService.get<string>('JWT_SECRET', 'oauth-state-secret');
  }

  store(req: Request, callback: StoreCallback): void;
  store(req: Request, meta: unknown, callback: StoreCallback): void;
  store(req: Request, metaOrCallback: unknown, maybeCallback?: StoreCallback): void {
    const callback =
      typeof metaOrCallback === 'function'
        ? (metaOrCallback as StoreCallback)
        : (maybeCallback as StoreCallback);

    try {
      // Extract termsAccepted from query if provided by frontend
      let termsAccepted = false;
      const stateParam = req.query.state as string | undefined;
      if (stateParam) {
        try {
          const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString());
          termsAccepted = decoded.termsAccepted === true;
        } catch {
          // Invalid state format, ignore
        }
      }

      const stateData: OAuthStateData = {
        nonce: randomBytes(16).toString('hex'),
        termsAccepted,
        timestamp: Date.now(),
      };

      const payload = Buffer.from(JSON.stringify(stateData)).toString('base64url');
      const signature = this.sign(payload);
      const state = `${payload}.${signature}`;

      callback(null, state);
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)), '');
    }
  }

  verify(req: Request, state: string, callback: VerifyCallback): void;
  verify(req: Request, state: string, meta: unknown, callback: VerifyCallback): void;
  verify(
    req: Request,
    providedState: string,
    metaOrCallback: unknown,
    maybeCallback?: VerifyCallback,
  ): void {
    const callback =
      typeof metaOrCallback === 'function'
        ? (metaOrCallback as VerifyCallback)
        : (maybeCallback as VerifyCallback);

    try {
      const [payload, signature] = providedState.split('.');

      if (!payload || !signature) {
        return callback(new Error('Invalid state format'), false, providedState);
      }

      // Verify signature
      const expectedSignature = this.sign(payload);
      if (signature !== expectedSignature) {
        return callback(new Error('Invalid state signature'), false, providedState);
      }

      // Decode and validate
      const stateData: OAuthStateData = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf-8'),
      );

      // Check expiration
      if (Date.now() - stateData.timestamp > this.maxAge) {
        return callback(new Error('State has expired'), false, providedState);
      }

      // Attach state data to request for use in strategy
      (req as Request & { oauthStateData?: OAuthStateData }).oauthStateData = stateData;

      callback(null, true, providedState);
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)), false, providedState);
    }
  }

  private sign(payload: string): string {
    return createHmac('sha256', this.secret).update(payload).digest('base64url');
  }
}

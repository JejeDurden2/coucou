import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

@Injectable()
export class CookieService {
  private readonly isProduction: boolean;
  private readonly cookieDomain: string | undefined;
  private readonly isCrossOrigin: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isProduction = configService.get('NODE_ENV') === 'production';
    this.cookieDomain = configService.get<string>('COOKIE_DOMAIN');

    // Detect cross-origin setup: frontend and API on different domains
    // In this case we need SameSite=none for cookies to work
    const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const apiUrl = configService.get<string>('API_URL', 'http://localhost:3001');
    try {
      const frontendHost = new URL(frontendUrl).hostname;
      const apiHost = new URL(apiUrl).hostname;
      this.isCrossOrigin = frontendHost !== apiHost;
    } catch {
      this.isCrossOrigin = false;
    }
  }

  setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    // For cross-origin setups (frontend and API on different domains),
    // we need SameSite=none + Secure for cookies to be sent
    // This is required for Vercel (frontend) + Railway (API) deployments
    const commonOptions = {
      httpOnly: true,
      secure: this.isProduction || this.isCrossOrigin,
      sameSite: this.isCrossOrigin ? ('none' as const) : ('lax' as const),
      path: '/',
      ...(this.cookieDomain && { domain: this.cookieDomain }),
    };

    // Access token: short-lived (15 minutes)
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...commonOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Refresh token: long-lived (7 days)
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...commonOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  clearAuthCookies(res: Response): void {
    const commonOptions = {
      httpOnly: true,
      secure: this.isProduction || this.isCrossOrigin,
      sameSite: this.isCrossOrigin ? ('none' as const) : ('lax' as const),
      path: '/',
      ...(this.cookieDomain && { domain: this.cookieDomain }),
    };

    res.clearCookie(ACCESS_TOKEN_COOKIE, commonOptions);
    res.clearCookie(REFRESH_TOKEN_COOKIE, commonOptions);
  }
}

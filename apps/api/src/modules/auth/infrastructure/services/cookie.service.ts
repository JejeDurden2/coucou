import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

@Injectable()
export class CookieService {
  private readonly isProduction: boolean;
  private readonly cookieDomain: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.isProduction = configService.get('NODE_ENV') === 'production';
    this.cookieDomain = configService.get<string>('COOKIE_DOMAIN');
  }

  setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    // Use 'lax' for CSRF protection - allows cookies on same-site navigation
    // but blocks cross-site POST requests (CSRF attacks)
    // In production with cross-origin setup, we need 'none' + secure
    // but only if COOKIE_DOMAIN is explicitly set for cross-domain auth
    const useCrossOrigin = this.isProduction && Boolean(this.cookieDomain);
    const commonOptions = {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: useCrossOrigin ? ('none' as const) : ('lax' as const),
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
    const useCrossOrigin = this.isProduction && Boolean(this.cookieDomain);
    const commonOptions = {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: useCrossOrigin ? ('none' as const) : ('lax' as const),
      path: '/',
      ...(this.cookieDomain && { domain: this.cookieDomain }),
    };

    res.clearCookie(ACCESS_TOKEN_COOKIE, commonOptions);
    res.clearCookie(REFRESH_TOKEN_COOKIE, commonOptions);
  }
}

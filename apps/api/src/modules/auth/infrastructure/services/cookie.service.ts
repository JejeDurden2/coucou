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

  setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const commonOptions = {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax' as const,
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
      secure: this.isProduction,
      sameSite: 'lax' as const,
      path: '/',
      ...(this.cookieDomain && { domain: this.cookieDomain }),
    };

    res.clearCookie(ACCESS_TOKEN_COOKIE, commonOptions);
    res.clearCookie(REFRESH_TOKEN_COOKIE, commonOptions);
  }
}

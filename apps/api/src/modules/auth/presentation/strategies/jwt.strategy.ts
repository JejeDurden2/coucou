import { Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';

import type { AuthenticatedUser, JwtPayload } from '../../application/dto/auth.dto';
import { ACCESS_TOKEN_COOKIE } from '../../infrastructure/services/cookie.service';

// Extract JWT from cookie OR Authorization header (for backwards compatibility)
const extractJwtFromCookieOrHeader = (req: Request): string | null => {
  // First try cookie
  if (req.cookies && req.cookies[ACCESS_TOKEN_COOKIE]) {
    return req.cookies[ACCESS_TOKEN_COOKIE] as string;
  }
  // Fallback to Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Optional() configService?: ConfigService) {
    const jwtSecret = configService?.get<string>('JWT_SECRET') ?? process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractJwtFromCookieOrHeader]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing user ID');
    }
    return {
      id: payload.sub,
      email: payload.email,
      plan: payload.plan,
    };
  }
}

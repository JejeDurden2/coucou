import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import type { Request } from 'express';

import {
  StatelessStateStore,
  type OAuthStateData,
} from '../../infrastructure/services/stateless-state-store';

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  termsAccepted?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Optional() configService: ConfigService | undefined,
    statelessStateStore: StatelessStateStore,
  ) {
    super({
      clientID:
        configService?.get<string>('GOOGLE_CLIENT_ID') ?? process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret:
        configService?.get<string>('GOOGLE_CLIENT_SECRET') ?? process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackURL:
        configService?.get<string>('GOOGLE_CALLBACK_URL') ?? process.env.GOOGLE_CALLBACK_URL ?? '',
      scope: ['email', 'profile'],
      passReqToCallback: true,
      store: statelessStateStore,
    });
  }

  validate(
    req: Request & { oauthStateData?: OAuthStateData },
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      emails?: Array<{ value: string }>;
      displayName?: string;
      name?: { givenName?: string; familyName?: string };
      photos?: Array<{ value: string }>;
    },
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error('Email not provided by Google'), undefined);
    }

    const nameFromParts = [profile.name?.givenName, profile.name?.familyName]
      .filter(Boolean)
      .join(' ');
    const name = profile.displayName || nameFromParts || 'User';

    // Get termsAccepted from the verified state (attached by StatelessStateStore)
    const termsAccepted = req.oauthStateData?.termsAccepted ?? false;

    const googleProfile: GoogleProfile = {
      id: profile.id,
      email,
      name,
      picture: profile.photos?.[0]?.value,
      termsAccepted,
      ipAddress: req.ip ?? req.headers['x-forwarded-for']?.toString(),
      userAgent: req.headers['user-agent'],
    };

    done(null, googleProfile);
  }
}

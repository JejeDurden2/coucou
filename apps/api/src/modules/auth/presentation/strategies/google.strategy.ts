import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import type { Request } from 'express';

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
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
      state: true,
    });
  }

  validate(
    req: Request,
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

    // Decode state parameter to get terms acceptance
    let termsAccepted = false;
    try {
      const state = req.query.state as string;
      if (state) {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
        termsAccepted = decoded.termsAccepted === true;
      }
    } catch {
      // State parsing failed, default to false
    }

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

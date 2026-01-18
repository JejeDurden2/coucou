import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { USER_REPOSITORY, type UserRepository } from '../../domain';
import type { AuthResponseDto, JwtPayload } from '../dto/auth.dto';
import type { GoogleProfile } from '../../presentation/strategies/google.strategy';

@Injectable()
export class GoogleAuthUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(profile: GoogleProfile): Promise<AuthResponseDto> {
    // Check if user exists by Google ID
    let user = await this.userRepository.findByGoogleId(profile.id);

    if (!user) {
      // Check if user exists by email (may have registered with email/password before)
      user = await this.userRepository.findByEmail(profile.email);

      if (!user) {
        // Create new user from OAuth
        user = await this.userRepository.createFromOAuth({
          email: profile.email,
          name: profile.name,
          googleId: profile.id,
          avatarUrl: profile.picture,
        });
      }
      // Note: If user exists with email but no googleId, they need to link accounts manually
      // For MVP, we just create a new session for the existing user
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      plan: user.plan,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        createdAt: user.createdAt,
      },
    };
  }
}

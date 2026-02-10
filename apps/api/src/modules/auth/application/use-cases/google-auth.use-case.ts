import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from '@coucou-ia/shared';

import { LoggerService } from '../../../../common/logger';
import { EmailQueueService } from '../../../../infrastructure/queue';
import { EMAIL_PORT, type EmailPort, generateWelcomeEmail } from '../../../email';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import {
  USER_REPOSITORY,
  CONSENT_REPOSITORY,
  type UserRepository,
  type User,
  type ConsentRepository,
} from '../../domain';
import type { AuthResponseDto, JwtPayload } from '../dto/auth.dto';
import type { GoogleProfile } from '../../presentation/strategies/google.strategy';

@Injectable()
export class GoogleAuthUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(CONSENT_REPOSITORY)
    private readonly consentRepository: ConsentRepository,
    @Inject(EMAIL_PORT)
    private readonly emailService: EmailPort,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailQueueService: EmailQueueService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GoogleAuthUseCase.name);
  }

  async execute(profile: GoogleProfile): Promise<AuthResponseDto> {
    // Check if user exists by Google ID
    let user = await this.userRepository.findByGoogleId(profile.id);
    let isNewUser = false;

    if (!user) {
      // Check if user exists by email (may have registered with email/password before)
      user = await this.userRepository.findByEmail(profile.email);

      if (user) {
        // Link Google account to existing user
        user = await this.userRepository.linkGoogleAccount(user.id, profile.id, profile.picture);
      } else {
        // Create new user from OAuth
        user = await this.userRepository.createFromOAuth({
          email: profile.email,
          name: profile.name,
          googleId: profile.id,
          avatarUrl: profile.picture,
        });
        isNewUser = true;
      }
    }

    // Log consent for RGPD compliance (new users only)
    if (isNewUser && profile.termsAccepted) {
      await Promise.all([
        this.consentRepository.logConsent({
          userId: user.id,
          type: 'TERMS_OF_SERVICE',
          action: 'ACCEPTED',
          version: CURRENT_TERMS_VERSION,
          ipAddress: profile.ipAddress,
          userAgent: profile.userAgent,
        }),
        this.consentRepository.logConsent({
          userId: user.id,
          type: 'PRIVACY_POLICY',
          action: 'ACCEPTED',
          version: CURRENT_PRIVACY_VERSION,
          ipAddress: profile.ipAddress,
          userAgent: profile.userAgent,
        }),
      ]);
    }

    // Send welcome email and admin notification for new users (non-blocking)
    if (isNewUser) {
      this.sendWelcomeEmail(user).catch((error) => {
        this.logger.error(
          'Failed to send welcome email',
          error instanceof Error ? error : undefined,
          {
            email: user.email,
          },
        );
      });
      this.emailQueueService.notifyNewUser(user, 'google').catch((error) => {
        this.logger.error(
          'Failed to send admin notification',
          error instanceof Error ? error : undefined,
          {
            email: user.email,
          },
        );
      });
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

    const projectCount = await this.projectRepository.countByUserId(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        projectCount,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
        createdAt: user.createdAt,
        isOAuthUser: true,
      },
    };
  }

  private async sendWelcomeEmail(user: User): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const { html, text } = generateWelcomeEmail({
      userName: user.name ?? user.email.split('@')[0],
      loginUrl: `${frontendUrl}/projects`,
    });

    await this.emailService.send({
      to: user.email,
      subject: 'Bienvenue sur Coucou IA - Votre visibilite IA commence ici',
      html,
      text,
    });
  }
}

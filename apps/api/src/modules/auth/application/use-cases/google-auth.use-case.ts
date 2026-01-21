import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../../prisma';
import {
  EMAIL_PORT,
  type EmailPort,
  generateWelcomeEmail,
  generateNewUserNotificationEmail,
} from '../../../email';
import { USER_REPOSITORY, type UserRepository, type User } from '../../domain';
import type { AuthResponseDto, JwtPayload } from '../dto/auth.dto';
import type { GoogleProfile } from '../../presentation/strategies/google.strategy';

@Injectable()
export class GoogleAuthUseCase {
  private readonly logger = new Logger(GoogleAuthUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(EMAIL_PORT)
    private readonly emailService: EmailPort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

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

    // Send welcome email and admin notification for new users (non-blocking)
    if (isNewUser) {
      this.sendWelcomeEmail(user).catch((error) => {
        this.logger.error(`Failed to send welcome email to ${user.email}`, error);
      });
      this.sendAdminNotification(user).catch((error) => {
        this.logger.error(`Failed to send admin notification for ${user.email}`, error);
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

    const projectCount = await this.prisma.project.count({
      where: { userId: user.id },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        projectCount,
        createdAt: user.createdAt,
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

  private async sendAdminNotification(user: User): Promise<void> {
    const { html, text } = generateNewUserNotificationEmail({
      userName: user.name ?? user.email.split('@')[0],
      userEmail: user.email,
      authMethod: 'google',
      createdAt: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
    });

    await this.emailService.send({
      to: 'jerome@coucou-ia.com',
      subject: `Nouvel utilisateur : ${user.name ?? user.email}`,
      html,
      text,
    });
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

import { Result } from '../../../../common';
import { EMAIL_PORT, type EmailPort, generatePasswordResetEmail } from '../../../email';
import {
  USER_REPOSITORY,
  type UserRepository,
  PASSWORD_RESET_REPOSITORY,
  type PasswordResetRepository,
} from '../../domain';

const TOKEN_EXPIRY_MINUTES = 30;

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepository,
    @Inject(EMAIL_PORT)
    private readonly emailService: EmailPort,
    private readonly configService: ConfigService,
  ) {}

  async execute(email: string): Promise<Result<void, never>> {
    // Always return success to prevent email enumeration
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.logger.debug(`Password reset requested for non-existent email: ${email}`);
      return Result.ok(undefined);
    }

    // Users with only Google OAuth cannot reset password
    if (!user.password && user.googleId) {
      this.logger.debug(`Password reset requested for OAuth-only user: ${email}`);
      return Result.ok(undefined);
    }

    // Clean up old tokens
    await this.passwordResetRepository.deleteExpiredTokens(user.id);

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await this.passwordResetRepository.create(user.id, token, expiresAt);

    // Send email (non-blocking)
    this.sendPasswordResetEmail(user.email, user.name, token).catch((error) => {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
    });

    return Result.ok(undefined);
  }

  private async sendPasswordResetEmail(
    email: string,
    userName: string | null,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const { html, text } = generatePasswordResetEmail({
      userName: userName ?? email.split('@')[0],
      resetUrl,
      expiresInMinutes: TOKEN_EXPIRY_MINUTES,
    });

    await this.emailService.send({
      to: email,
      subject: 'Reinitialisation de votre mot de passe Coucou',
      html,
      text,
    });
  }
}

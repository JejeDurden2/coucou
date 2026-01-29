import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

import { Result } from '../../../../common';
import { LoggerService } from '../../../../common/logger';
import { EmailQueueService } from '../../../../infrastructure/queue';
import {
  USER_REPOSITORY,
  type UserRepository,
  PASSWORD_RESET_REPOSITORY,
  type PasswordResetRepository,
} from '../../domain';

const TOKEN_EXPIRY_MINUTES = 30;

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly emailQueueService: EmailQueueService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ForgotPasswordUseCase.name);
  }

  async execute(email: string): Promise<Result<void, never>> {
    // Always return success to prevent email enumeration
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.logger.debug('Password reset requested for non-existent email', { email });
      return Result.ok(undefined);
    }

    // Users with only Google OAuth cannot reset password
    if (!user.password && user.googleId) {
      this.logger.debug('Password reset requested for OAuth-only user', { email });
      return Result.ok(undefined);
    }

    // Clean up old tokens
    await this.passwordResetRepository.deleteExpiredTokens(user.id);

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await this.passwordResetRepository.create(user.id, token, expiresAt);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    // Send email via queue
    await this.emailQueueService.addJob({
      type: 'password-reset',
      to: user.email,
      data: {
        userName: user.name ?? user.email.split('@')[0],
        resetUrl,
        expiresInMinutes: TOKEN_EXPIRY_MINUTES,
      },
    });

    return Result.ok(undefined);
  }
}

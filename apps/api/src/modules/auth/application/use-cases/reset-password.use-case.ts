import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { Result, ValidationError } from '../../../../common';
import {
  USER_REPOSITORY,
  type UserRepository,
  PASSWORD_RESET_REPOSITORY,
  type PasswordResetRepository,
} from '../../domain';

type ResetPasswordError = ValidationError;

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepository,
  ) {}

  async execute(token: string, newPassword: string): Promise<Result<void, ResetPasswordError>> {
    const resetToken = await this.passwordResetRepository.findByToken(token);

    if (!resetToken) {
      return Result.err(new ValidationError(['Token invalide ou expire']));
    }

    if (resetToken.usedAt) {
      return Result.err(new ValidationError(['Ce lien a deja ete utilise']));
    }

    if (resetToken.expiresAt < new Date()) {
      return Result.err(new ValidationError(['Ce lien a expire']));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.userRepository.updatePassword(resetToken.userId, hashedPassword);

    // Mark token as used
    await this.passwordResetRepository.markAsUsed(resetToken.id);

    return Result.ok(undefined);
  }
}

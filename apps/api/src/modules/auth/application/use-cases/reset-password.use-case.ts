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
    // Atomically consume token to prevent TOCTOU race condition
    // This validates and marks the token as used in a single transaction
    const resetToken = await this.passwordResetRepository.consumeToken(token);

    if (!resetToken) {
      return Result.err(new ValidationError(['Token invalide, expire ou deja utilise']));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.userRepository.updatePassword(resetToken.userId, hashedPassword);

    return Result.ok(undefined);
  }
}

import { Inject, Injectable } from '@nestjs/common';

import { ConflictError, Result } from '../../../../common';
import { DomainError } from '../../../../common/errors/domain-error';
import { User } from '../../domain/entities/user.entity';
import {
  EMAIL_VALIDATOR_PORT,
  type EmailValidatorPort,
  type EmailValidationError,
} from '../../domain';
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository';

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
  readonly statusCode = 404;

  constructor() {
    super('User not found');
  }
}

export class OAuthEmailChangeError extends DomainError {
  readonly code = 'OAUTH_EMAIL_CHANGE_NOT_ALLOWED';
  readonly statusCode = 400;

  constructor() {
    super('Cannot change email for accounts linked with Google');
  }
}

export interface UpdateProfileDto {
  email?: string;
  name?: string;
  emailNotificationsEnabled?: boolean;
}

type UpdateProfileError =
  | UserNotFoundError
  | OAuthEmailChangeError
  | EmailValidationError
  | ConflictError;

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(EMAIL_VALIDATOR_PORT)
    private readonly emailValidator: EmailValidatorPort,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<Result<User, UpdateProfileError>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.err(new UserNotFoundError());
    }

    // Handle email change validation first (before any updates)
    if (dto.email !== undefined && dto.email !== user.email) {
      // OAuth users cannot change their email
      if (user.googleId) {
        return Result.err(new OAuthEmailChangeError());
      }

      // Validate email format, domain, and check for disposable emails
      const emailResult = await this.emailValidator.validate(dto.email);
      if (!emailResult.ok) {
        return emailResult;
      }

      // Check if email is already in use
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        return Result.err(new ConflictError('User', 'email', dto.email));
      }
    }

    // Apply updates
    const emailChanged = dto.email !== undefined && dto.email !== user.email;

    if (emailChanged) {
      await this.userRepository.updateEmail(userId, dto.email!);
    }

    if (dto.name !== undefined) {
      await this.userRepository.updateName(userId, dto.name!);
    }

    if (dto.emailNotificationsEnabled !== undefined) {
      await this.userRepository.updateEmailNotificationsEnabled(
        userId,
        dto.emailNotificationsEnabled!,
      );
    }

    // Fetch updated user only if any changes were made
    const hasChanges =
      emailChanged || dto.name !== undefined || dto.emailNotificationsEnabled !== undefined;
    const updatedUser = hasChanges ? (await this.userRepository.findById(userId))! : user;

    return Result.ok(updatedUser);
  }
}

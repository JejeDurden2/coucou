import { Inject, Injectable } from '@nestjs/common';

import { Result } from '../../../../common/utils/result';
import { DomainError } from '../../../../common/errors/domain-error';
import { User } from '../../domain/entities/user.entity';
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository';

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
  readonly statusCode = 404;

  constructor() {
    super('User not found');
  }
}

export interface UpdateProfileDto {
  name?: string;
  emailNotificationsEnabled?: boolean;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<Result<User, UserNotFoundError>> {
    let user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.err(new UserNotFoundError());
    }

    if (dto.name !== undefined) {
      user = await this.userRepository.updateName(userId, dto.name);
    }

    if (dto.emailNotificationsEnabled !== undefined) {
      await this.userRepository.updateEmailNotificationsEnabled(
        userId,
        dto.emailNotificationsEnabled,
      );
      user = (await this.userRepository.findById(userId))!;
    }

    return Result.ok(user);
  }
}

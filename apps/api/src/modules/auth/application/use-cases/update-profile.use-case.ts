import { Inject, Injectable } from '@nestjs/common';

import { Result } from '../../../../common/utils/result';
import { DomainError } from '../../../../common/errors/domain-error';
import { User } from '../../domain/entities/user.entity';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../domain/repositories/user.repository';

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
  readonly statusCode = 404;

  constructor() {
    super('User not found');
  }
}

export interface UpdateProfileDto {
  name: string;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Result<User, UserNotFoundError>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.err(new UserNotFoundError());
    }

    const updatedUser = await this.userRepository.updateName(userId, dto.name);

    return Result.ok(updatedUser);
  }
}

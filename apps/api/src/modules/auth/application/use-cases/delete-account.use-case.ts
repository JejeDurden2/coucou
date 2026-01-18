import { Inject, Injectable, Logger } from '@nestjs/common';

import { Result } from '../../../../common/utils/result';
import { DomainError } from '../../../../common/errors/domain-error';
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

@Injectable()
export class DeleteAccountUseCase {
  private readonly logger = new Logger(DeleteAccountUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string): Promise<Result<void, UserNotFoundError>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.err(new UserNotFoundError());
    }

    this.logger.log(`Deleting account for user: ${userId}`);

    await this.userRepository.delete(userId);

    this.logger.log(`Account deleted successfully for user: ${userId}`);

    return Result.ok(undefined);
  }
}

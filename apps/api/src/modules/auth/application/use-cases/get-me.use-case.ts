import { Inject, Injectable } from '@nestjs/common';

import { NotFoundError, Result } from '../../../../common';
import { USER_REPOSITORY, type UserRepository } from '../../domain';
import type { UserResponseDto } from '../dto/auth.dto';

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string): Promise<Result<UserResponseDto, NotFoundError>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.err(new NotFoundError('User', userId));
    }

    return Result.ok({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      createdAt: user.createdAt,
    });
  }
}

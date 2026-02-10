import { Inject, Injectable } from '@nestjs/common';

import { NotFoundError, Result } from '../../../../common';
import { USER_REPOSITORY, type UserRepository } from '../../domain';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import type { UserResponseDto } from '../dto/auth.dto';

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(userId: string): Promise<Result<UserResponseDto, NotFoundError>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.err(new NotFoundError('User', userId));
    }

    const projectCount = await this.projectRepository.countByUserId(userId);

    return Result.ok({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      projectCount,
      emailNotificationsEnabled: user.emailNotificationsEnabled,
      createdAt: user.createdAt,
      isOAuthUser: !!user.googleId,
    });
  }
}

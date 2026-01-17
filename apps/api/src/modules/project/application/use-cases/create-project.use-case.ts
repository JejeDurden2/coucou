import { Inject, Injectable } from '@nestjs/common';
import type { Plan } from '@prisma/client';

import { PlanLimitError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../domain';
import type { CreateProjectDto, ProjectResponseDto } from '../dto/project.dto';

const PROJECT_LIMITS: Record<Plan, number> = {
  FREE: 1,
  SOLO: 5,
  PRO: 15,
};

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(
    userId: string,
    plan: Plan,
    dto: CreateProjectDto,
  ): Promise<Result<ProjectResponseDto, PlanLimitError>> {
    const currentCount = await this.projectRepository.countByUserId(userId);
    const limit = PROJECT_LIMITS[plan];

    if (currentCount >= limit) {
      return Result.err(new PlanLimitError('projects', limit, plan));
    }

    const project = await this.projectRepository.create({
      userId,
      name: dto.name,
      brandName: dto.brandName,
      brandVariants: dto.brandVariants,
      domain: dto.domain,
    });

    return Result.ok({
      id: project.id,
      name: project.name,
      brandName: project.brandName,
      brandVariants: project.brandVariants,
      domain: project.domain,
      lastScannedAt: project.lastScannedAt,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type { Plan } from '@prisma/client';

import { PlanLimitError, Result } from '../../../../common';
import { PlanLimitNotificationService } from '../../../email';
import { PLAN_LIMITS } from '../../../billing/domain/services/plan-limits.service';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../domain';
import type { CreateProjectDto, ProjectResponseDto } from '../dto/project.dto';

interface UserInfo {
  email: string;
  name?: string;
}

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    private readonly planLimitNotification: PlanLimitNotificationService,
  ) {}

  async execute(
    userId: string,
    plan: Plan,
    dto: CreateProjectDto,
    userInfo?: UserInfo,
  ): Promise<Result<ProjectResponseDto, PlanLimitError>> {
    const currentCount = await this.projectRepository.countByUserId(userId);
    const limit = PLAN_LIMITS[plan].projects;

    if (currentCount >= limit) {
      if (userInfo && (plan === 'FREE' || plan === 'SOLO')) {
        this.planLimitNotification.notifyIfNeeded(userInfo, plan, 'projects', currentCount, limit);
      }
      return Result.err(new PlanLimitError('projects', limit, plan));
    }

    const project = await this.projectRepository.create({
      userId,
      name: dto.name,
      brandName: dto.brandName,
      brandVariants: dto.brandVariants,
      domain: dto.domain,
    });

    // Notify at 80% usage (non-blocking, handled internally)
    const newCount = currentCount + 1;
    if (userInfo && (plan === 'FREE' || plan === 'SOLO') && newCount < limit) {
      this.planLimitNotification.notifyIfNeeded(userInfo, plan, 'projects', newCount, limit);
    }

    return Result.ok({
      id: project.id,
      name: project.name,
      brandName: project.brandName,
      brandVariants: project.brandVariants,
      domain: project.domain,
      lastScannedAt: project.lastScannedAt,
      lastAutoScanAt: project.lastAutoScanAt,
      nextAutoScanAt: project.nextAutoScanAt,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  }
}

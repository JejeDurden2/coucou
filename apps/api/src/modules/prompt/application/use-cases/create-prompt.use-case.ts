import { Inject, Injectable } from '@nestjs/common';
import type { Plan } from '@prisma/client';

import { ForbiddenError, NotFoundError, PlanLimitError, Result } from '../../../../common';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../domain';
import type { CreatePromptDto, PromptResponseDto } from '../dto/prompt.dto';

const PROMPT_LIMITS: Record<Plan, number> = {
  FREE: 3,
  SOLO: 20,
  PRO: 50,
};

type CreatePromptError = NotFoundError | ForbiddenError | PlanLimitError;

@Injectable()
export class CreatePromptUseCase {
  constructor(
    @Inject(PROMPT_REPOSITORY)
    private readonly promptRepository: PromptRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(
    projectId: string,
    userId: string,
    plan: Plan,
    dto: CreatePromptDto,
  ): Promise<Result<PromptResponseDto, CreatePromptError>> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }

    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('You do not have access to this project'));
    }

    const currentCount = await this.promptRepository.countByProjectId(projectId);
    const limit = PROMPT_LIMITS[plan];

    if (currentCount >= limit) {
      return Result.err(new PlanLimitError('prompts per project', limit, plan));
    }

    const prompt = await this.promptRepository.create({
      projectId,
      content: dto.content,
      category: dto.category,
    });

    return Result.ok({
      id: prompt.id,
      projectId: prompt.projectId,
      content: prompt.content,
      category: prompt.category,
      isActive: prompt.isActive,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
    });
  }
}

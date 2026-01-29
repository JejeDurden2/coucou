import { Inject, Injectable } from '@nestjs/common';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../domain';
import type { PromptResponseDto, UpdatePromptDto } from '../dto/prompt.dto';

type UpdatePromptError = NotFoundError | ForbiddenError;

@Injectable()
export class UpdatePromptUseCase {
  constructor(
    @Inject(PROMPT_REPOSITORY)
    private readonly promptRepository: PromptRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(
    projectId: string,
    promptId: string,
    userId: string,
    dto: UpdatePromptDto,
  ): Promise<Result<PromptResponseDto, UpdatePromptError>> {
    const prompt = await this.promptRepository.findById(promptId);

    if (!prompt) {
      return Result.err(new NotFoundError('Prompt', promptId));
    }

    // Validate that prompt belongs to the requested project (prevents IDOR)
    if (prompt.projectId !== projectId) {
      return Result.err(new ForbiddenError('Prompt does not belong to this project'));
    }

    const project = await this.projectRepository.findById(prompt.projectId);

    if (!project || !project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('You do not have access to this prompt'));
    }

    const updated = await this.promptRepository.update(promptId, dto);

    return Result.ok({
      id: updated.id,
      projectId: updated.projectId,
      content: updated.content,
      category: updated.category,
      isActive: updated.isActive,
      lastScannedAt: updated.lastScannedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }
}

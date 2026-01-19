import { Inject, Injectable } from '@nestjs/common';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../domain';

type DeletePromptError = NotFoundError | ForbiddenError;

@Injectable()
export class DeletePromptUseCase {
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
  ): Promise<Result<void, DeletePromptError>> {
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

    await this.promptRepository.delete(promptId);

    return Result.ok(undefined);
  }
}

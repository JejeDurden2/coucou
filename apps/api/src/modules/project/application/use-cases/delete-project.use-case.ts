import { Inject, Injectable } from '@nestjs/common';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { LoggerService } from '../../../../common/logger';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../domain';

type DeleteProjectError = NotFoundError | ForbiddenError;

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(DeleteProjectUseCase.name);
  }

  async execute(projectId: string, userId: string): Promise<Result<void, DeleteProjectError>> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }

    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('You do not have access to this project'));
    }

    this.logger.info('Project deleted', {
      projectId,
      projectName: project.name,
      brandName: project.brandName,
      userId,
    });

    await this.projectRepository.delete(projectId);

    return Result.ok(undefined);
  }
}

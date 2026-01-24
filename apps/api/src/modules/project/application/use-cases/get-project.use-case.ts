import { Inject, Injectable } from '@nestjs/common';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../domain';
import type { ProjectResponseDto } from '../dto/project.dto';

type GetProjectError = NotFoundError | ForbiddenError;

@Injectable()
export class GetProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(
    projectId: string,
    userId: string,
  ): Promise<Result<ProjectResponseDto, GetProjectError>> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }

    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('You do not have access to this project'));
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

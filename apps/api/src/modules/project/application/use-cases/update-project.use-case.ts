import { Inject, Injectable } from '@nestjs/common';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../domain';
import type { ProjectResponseDto, UpdateProjectDto } from '../dto/project.dto';

type UpdateProjectError = NotFoundError | ForbiddenError;

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(
    projectId: string,
    userId: string,
    dto: UpdateProjectDto,
  ): Promise<Result<ProjectResponseDto, UpdateProjectError>> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }

    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('You do not have access to this project'));
    }

    const updated = await this.projectRepository.update(projectId, dto);

    return Result.ok({
      id: updated.id,
      name: updated.name,
      brandName: updated.brandName,
      brandVariants: updated.brandVariants,
      domain: updated.domain,
      lastScannedAt: updated.lastScannedAt,
      lastAutoScanAt: updated.lastAutoScanAt,
      nextAutoScanAt: updated.nextAutoScanAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }
}

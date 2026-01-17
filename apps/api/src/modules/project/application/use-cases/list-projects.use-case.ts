import { Inject, Injectable } from '@nestjs/common';

import { PROJECT_REPOSITORY, type ProjectRepository } from '../../domain';
import type { ProjectResponseDto } from '../dto/project.dto';

@Injectable()
export class ListProjectsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(userId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.projectRepository.findByUserId(userId);

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      brandName: project.brandName,
      brandVariants: project.brandVariants,
      domain: project.domain,
      lastScannedAt: project.lastScannedAt,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));
  }
}

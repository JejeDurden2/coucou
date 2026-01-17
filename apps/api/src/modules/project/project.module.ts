import { Module } from '@nestjs/common';

import { PROJECT_REPOSITORY } from './domain';
import { PrismaProjectRepository } from './infrastructure/persistence/prisma-project.repository';
import {
  CreateProjectUseCase,
  DeleteProjectUseCase,
  GetProjectUseCase,
  ListProjectsUseCase,
  UpdateProjectUseCase,
} from './application/use-cases';
import { ProjectController } from './presentation/controllers/project.controller';

@Module({
  controllers: [ProjectController],
  providers: [
    // Use cases
    CreateProjectUseCase,
    GetProjectUseCase,
    ListProjectsUseCase,
    UpdateProjectUseCase,
    DeleteProjectUseCase,
    // Repository binding
    {
      provide: PROJECT_REPOSITORY,
      useClass: PrismaProjectRepository,
    },
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectModule {}

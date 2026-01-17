import { Module } from '@nestjs/common';

import { ProjectModule } from '../project';
import { PROMPT_REPOSITORY } from './domain';
import { PrismaPromptRepository } from './infrastructure/persistence/prisma-prompt.repository';
import {
  CreatePromptUseCase,
  DeletePromptUseCase,
  ListPromptsUseCase,
  UpdatePromptUseCase,
} from './application/use-cases';
import { PromptController } from './presentation/controllers/prompt.controller';

@Module({
  imports: [ProjectModule],
  controllers: [PromptController],
  providers: [
    // Use cases
    CreatePromptUseCase,
    ListPromptsUseCase,
    UpdatePromptUseCase,
    DeletePromptUseCase,
    // Repository binding
    {
      provide: PROMPT_REPOSITORY,
      useClass: PrismaPromptRepository,
    },
  ],
  exports: [PROMPT_REPOSITORY],
})
export class PromptModule {}

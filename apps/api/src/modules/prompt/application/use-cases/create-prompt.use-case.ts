import { Inject, Injectable } from '@nestjs/common';
import type { Plan } from '@prisma/client';

import { ForbiddenError, NotFoundError, PlanLimitError, Result } from '../../../../common';
import { LoggerService } from '../../../../common/logger';
import { EMAIL_PORT, type EmailPort, PlanLimitNotificationService } from '../../../email';
import { PLAN_LIMITS } from '../../../billing/domain/services/plan-limits.service';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import {
  QUEUE_PROMPT_SCAN_USE_CASE,
  type QueuePromptScanUseCase,
} from '../../../scan/application/use-cases';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../domain';
import type { CreatePromptDto, PromptResponseDto } from '../dto/prompt.dto';

type CreatePromptError = NotFoundError | ForbiddenError | PlanLimitError;

interface UserInfo {
  email: string;
  name?: string;
}

@Injectable()
export class CreatePromptUseCase {
  constructor(
    @Inject(PROMPT_REPOSITORY)
    private readonly promptRepository: PromptRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(EMAIL_PORT)
    private readonly emailPort: EmailPort,
    @Inject(QUEUE_PROMPT_SCAN_USE_CASE)
    private readonly queuePromptScanUseCase: QueuePromptScanUseCase,
    private readonly planLimitNotification: PlanLimitNotificationService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CreatePromptUseCase.name);
  }

  async execute(
    projectId: string,
    userId: string,
    plan: Plan,
    dto: CreatePromptDto,
    userInfo?: UserInfo,
  ): Promise<Result<PromptResponseDto, CreatePromptError>> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }

    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('You do not have access to this project'));
    }

    const currentCount = await this.promptRepository.countByProjectId(projectId);
    const limit = PLAN_LIMITS[plan].promptsPerProject;

    if (currentCount >= limit) {
      if (userInfo && (plan === 'FREE' || plan === 'SOLO')) {
        this.planLimitNotification.notifyIfNeeded(userInfo, plan, 'prompts', currentCount, limit);
      }
      return Result.err(new PlanLimitError('prompts per project', limit, plan));
    }

    const prompt = await this.promptRepository.create({
      projectId,
      content: dto.content,
      category: dto.category,
    });

    // Notify at 80% usage (non-blocking, handled internally)
    const newCount = currentCount + 1;
    if (userInfo && (plan === 'FREE' || plan === 'SOLO') && newCount < limit) {
      this.planLimitNotification.notifyIfNeeded(userInfo, plan, 'prompts', newCount, limit);
    }

    // Auto-trigger scan for SOLO/PRO plans (non-blocking)
    if (plan === 'SOLO' || plan === 'PRO') {
      this.triggerAutoScan(prompt.id, userId, plan, userInfo?.email).catch((err) => {
        this.logger.error('Auto-scan failed', err instanceof Error ? err : undefined, {
          promptId: prompt.id,
        });
      });
    }

    return Result.ok({
      id: prompt.id,
      projectId: prompt.projectId,
      content: prompt.content,
      category: prompt.category,
      isActive: prompt.isActive,
      lastScannedAt: prompt.lastScannedAt,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
    });
  }

  private async triggerAutoScan(
    promptId: string,
    userId: string,
    plan: Plan,
    userEmail?: string,
  ): Promise<void> {
    const result = await this.queuePromptScanUseCase.execute({
      promptId,
      userId,
      plan,
    });

    if (result.ok) {
      this.logger.info('Auto-scan queued', { promptId, jobId: result.value.jobId });
    } else if (result.error.code === 'SCAN_LIMIT_EXCEEDED' && userEmail) {
      const message = `Votre prompt a été créé. Le scan sera lancé lors de votre prochaine période.`;
      await this.emailPort.send({
        to: userEmail,
        subject: 'Scan programmé',
        html: `<p>${message}</p>`,
        text: message,
      });
      this.logger.info('Scan quota exceeded, notification sent', { userId });
    } else {
      this.logger.warn('Auto-scan rejected', { promptId, error: result.error.message });
    }
  }
}

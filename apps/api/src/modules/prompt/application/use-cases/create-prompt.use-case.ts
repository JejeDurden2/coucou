import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Plan } from '@prisma/client';

import { ForbiddenError, NotFoundError, PlanLimitError, Result } from '../../../../common';
import { EMAIL_PORT, type EmailPort, generatePlanLimitEmail } from '../../../email';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
import {
  QUEUE_PROMPT_SCAN_USE_CASE,
  type QueuePromptScanUseCase,
} from '../../../scan/application/use-cases';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../domain';
import type { CreatePromptDto, PromptResponseDto } from '../dto/prompt.dto';

const PROMPT_LIMITS: Record<Plan, number> = {
  FREE: 2,
  SOLO: 10,
  PRO: 50,
};

type CreatePromptError = NotFoundError | ForbiddenError | PlanLimitError;

interface UserInfo {
  email: string;
  name?: string;
}

@Injectable()
export class CreatePromptUseCase {
  private readonly logger = new Logger(CreatePromptUseCase.name);

  constructor(
    @Inject(PROMPT_REPOSITORY)
    private readonly promptRepository: PromptRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(EMAIL_PORT)
    private readonly emailPort: EmailPort,
    @Inject(QUEUE_PROMPT_SCAN_USE_CASE)
    private readonly queuePromptScanUseCase: QueuePromptScanUseCase,
    private readonly configService: ConfigService,
  ) {}

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
    const limit = PROMPT_LIMITS[plan];

    if (currentCount >= limit) {
      // Send plan limit email (non-blocking) - only for FREE and SOLO
      if (userInfo && (plan === 'FREE' || plan === 'SOLO')) {
        this.sendPlanLimitEmail(userInfo, plan, currentCount, limit).catch((error) => {
          this.logger.error(`Failed to send plan limit email to ${userInfo.email}`, error);
        });
      }
      return Result.err(new PlanLimitError('prompts per project', limit, plan));
    }

    const prompt = await this.promptRepository.create({
      projectId,
      content: dto.content,
      category: dto.category,
    });

    // Auto-trigger scan for SOLO/PRO plans (non-blocking)
    if (plan === 'SOLO' || plan === 'PRO') {
      this.triggerAutoScan(prompt.id, userId, plan, userInfo?.email).catch((err) => {
        this.logger.error(`Auto-scan failed for prompt ${prompt.id}:`, err);
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

  private async sendPlanLimitEmail(
    userInfo: UserInfo,
    plan: 'FREE' | 'SOLO',
    currentUsage: number,
    maxAllowed: number,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'https://coucou-ia.com';
    const { html, text } = generatePlanLimitEmail({
      userName: userInfo.name ?? userInfo.email.split('@')[0],
      currentPlan: plan,
      limitType: 'prompts',
      currentUsage,
      maxAllowed,
      upgradeUrl: `${frontendUrl}/settings/billing`,
    });

    await this.emailPort.send({
      to: userInfo.email,
      subject: `Vous avez atteint votre limite de prompts`,
      html,
      text,
    });

    this.logger.log(`Plan limit email sent to ${userInfo.email}`);
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
      this.logger.log(`Auto-scan queued for prompt ${promptId}: job ${result.value.jobId}`);
    } else if (result.error.code === 'SCAN_LIMIT_EXCEEDED' && userEmail) {
      // Send subtle notification to user if scan quota exceeded
      const message = `Votre prompt a été créé. Le scan sera lancé lors de votre prochaine période.`;
      await this.emailPort.send({
        to: userEmail,
        subject: 'Scan programmé',
        html: `<p>${message}</p>`,
        text: message,
      });
      this.logger.log(`Scan quota exceeded for user ${userId}, notification sent`);
    } else {
      this.logger.warn(`Auto-scan rejected for prompt ${promptId}: ${result.error.message}`);
    }
  }
}

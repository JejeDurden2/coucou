import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Plan } from '@prisma/client';

import { ForbiddenError, NotFoundError, PlanLimitError, Result } from '../../../../common';
import {
  EMAIL_PORT,
  type EmailPort,
  generatePlanLimitEmail,
} from '../../../email';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
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
}

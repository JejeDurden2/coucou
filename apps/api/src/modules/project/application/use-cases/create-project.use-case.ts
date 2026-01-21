import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Plan } from '@prisma/client';

import { PlanLimitError, Result } from '../../../../common';
import {
  EMAIL_PORT,
  type EmailPort,
  generatePlanLimitEmail,
} from '../../../email';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../domain';
import type { CreateProjectDto, ProjectResponseDto } from '../dto/project.dto';

const PROJECT_LIMITS: Record<Plan, number> = {
  FREE: 1,
  SOLO: 5,
  PRO: 15,
};

interface UserInfo {
  email: string;
  name?: string;
}

@Injectable()
export class CreateProjectUseCase {
  private readonly logger = new Logger(CreateProjectUseCase.name);

  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(EMAIL_PORT)
    private readonly emailPort: EmailPort,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    userId: string,
    plan: Plan,
    dto: CreateProjectDto,
    userInfo?: UserInfo,
  ): Promise<Result<ProjectResponseDto, PlanLimitError>> {
    const currentCount = await this.projectRepository.countByUserId(userId);
    const limit = PROJECT_LIMITS[plan];

    if (currentCount >= limit) {
      // Send plan limit email (non-blocking) - only for FREE and SOLO
      if (userInfo && (plan === 'FREE' || plan === 'SOLO')) {
        this.sendPlanLimitEmail(userInfo, plan, currentCount, limit).catch((error) => {
          this.logger.error(`Failed to send plan limit email to ${userInfo.email}`, error);
        });
      }
      return Result.err(new PlanLimitError('projects', limit, plan));
    }

    const project = await this.projectRepository.create({
      userId,
      name: dto.name,
      brandName: dto.brandName,
      brandVariants: dto.brandVariants,
      domain: dto.domain,
    });

    return Result.ok({
      id: project.id,
      name: project.name,
      brandName: project.brandName,
      brandVariants: project.brandVariants,
      domain: project.domain,
      lastScannedAt: project.lastScannedAt,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
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
      limitType: 'projects',
      currentUsage,
      maxAllowed,
      upgradeUrl: `${frontendUrl}/settings/billing`,
    });

    await this.emailPort.send({
      to: userInfo.email,
      subject: `Vous avez atteint votre limite de projets`,
      html,
      text,
    });

    this.logger.log(`Plan limit email sent to ${userInfo.email}`);
  }
}

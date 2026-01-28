import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EMAIL_PORT, type EmailPort } from '../../application/ports/email.port';
import { generatePlanLimitEmail } from '../templates/plan-limit.template';
import { generatePlanApproachingLimitEmail } from '../templates/plan-approaching-limit.template';
import { generateSoloToProNudgeEmail } from '../templates/solo-to-pro-nudge.template';

export type LimitResourceType = 'projects' | 'prompts';

const APPROACHING_LIMIT_THRESHOLD = 0.8;

const LIMIT_SUBJECT: Record<LimitResourceType, { approaching: string; reached: string }> = {
  projects: {
    approaching: 'Vous utilisez %usage%/%max% projets',
    reached: 'Vous avez atteint votre limite de projets',
  },
  prompts: {
    approaching: 'Vous utilisez %usage%/%max% requêtes',
    reached: 'Vous avez atteint votre limite de prompts',
  },
};

const SOLO_SUBJECT: Record<LimitResourceType, string> = {
  projects: 'Vous exploitez %usage%/%max% projets — passez au Pro',
  prompts: 'Vous exploitez %usage%/%max% requêtes — passez au Pro',
};

interface UserInfo {
  email: string;
  name?: string;
}

@Injectable()
export class PlanLimitNotificationService {
  private readonly logger = new Logger(PlanLimitNotificationService.name);
  private readonly frontendUrl: string;

  constructor(
    @Inject(EMAIL_PORT)
    private readonly emailPort: EmailPort,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://coucou-ia.com');
  }

  /**
   * Check and send approaching-limit email (at 80% usage) or plan-limit email (at 100%).
   * Non-blocking: logs errors but does not throw.
   */
  notifyIfNeeded(
    userInfo: UserInfo,
    plan: 'FREE' | 'SOLO',
    resourceType: LimitResourceType,
    currentCount: number,
    limit: number,
  ): void {
    if (currentCount >= limit) {
      this.sendPlanLimitEmail(userInfo, plan, resourceType, currentCount, limit).catch((error) => {
        this.logger.error({
          message: 'Failed to send plan limit email',
          userId: userInfo.email,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    } else {
      const threshold = Math.ceil(limit * APPROACHING_LIMIT_THRESHOLD);
      if (currentCount >= threshold) {
        this.sendApproachingLimitEmail(userInfo, plan, resourceType, currentCount, limit).catch(
          (error) => {
            this.logger.error({
              message: 'Failed to send approaching-limit email',
              userId: userInfo.email,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        );
      }
    }
  }

  private async sendPlanLimitEmail(
    userInfo: UserInfo,
    plan: 'FREE' | 'SOLO',
    resourceType: LimitResourceType,
    currentUsage: number,
    maxAllowed: number,
  ): Promise<void> {
    const userName = userInfo.name ?? userInfo.email.split('@')[0];
    const upgradeUrl = `${this.frontendUrl}/settings/billing`;

    const { html, text } =
      plan === 'SOLO'
        ? generateSoloToProNudgeEmail({
            userName,
            limitType: resourceType,
            currentUsage,
            maxAllowed,
            upgradeUrl,
          })
        : generatePlanLimitEmail({
            userName,
            currentPlan: plan,
            limitType: resourceType,
            currentUsage,
            maxAllowed,
            upgradeUrl,
          });

    const subject =
      plan === 'SOLO'
        ? SOLO_SUBJECT[resourceType]
            .replace('%usage%', String(currentUsage))
            .replace('%max%', String(maxAllowed))
        : LIMIT_SUBJECT[resourceType].reached;

    await this.emailPort.send({ to: userInfo.email, subject, html, text });

    this.logger.log({
      message: 'Plan limit email sent',
      resourceType,
      plan,
    });
  }

  private async sendApproachingLimitEmail(
    userInfo: UserInfo,
    plan: 'FREE' | 'SOLO',
    resourceType: LimitResourceType,
    currentUsage: number,
    maxAllowed: number,
  ): Promise<void> {
    const { html, text } = generatePlanApproachingLimitEmail({
      userName: userInfo.name ?? userInfo.email.split('@')[0],
      currentPlan: plan,
      limitType: resourceType,
      currentUsage,
      maxAllowed,
      upgradeUrl: `${this.frontendUrl}/settings/billing`,
    });

    const subject = LIMIT_SUBJECT[resourceType].approaching
      .replace('%usage%', String(currentUsage))
      .replace('%max%', String(maxAllowed));

    await this.emailPort.send({ to: userInfo.email, subject, html, text });

    this.logger.log({
      message: 'Approaching limit email sent',
      resourceType,
      plan,
    });
  }
}

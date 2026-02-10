import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plan } from '@prisma/client';

import { LoggerService } from '../../../../common/logger';
import { EmailQueueService } from '../../../../infrastructure/queue/email-queue.service';
import { USER_REPOSITORY, type UserRepository } from '../../../auth';
import { UnsubscribeTokenService } from '../../../email';
import { SCAN_REPOSITORY, type ScanRepository } from '../../domain';

@Injectable()
export class PostScanEmailService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(SCAN_REPOSITORY)
    private readonly scanRepository: ScanRepository,
    private readonly emailQueueService: EmailQueueService,
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PostScanEmailService.name);
  }

  async trySend(
    userId: string,
    project: { id: string; brandName: string },
    plan: Plan,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findByIdWithEmailPrefs(userId);
      if (!user) {
        this.logger.warn('User not found for post-scan email', { userId });
        return;
      }

      if (!user.emailNotificationsEnabled) {
        this.logger.debug('User has email notifications disabled, skipping post-scan email', {
          userId,
        });
        return;
      }

      // Check if we already sent an email today
      if (user.lastPostScanEmailAt) {
        const today = new Date();
        const lastSent = new Date(user.lastPostScanEmailAt);
        if (
          lastSent.getFullYear() === today.getFullYear() &&
          lastSent.getMonth() === today.getMonth() &&
          lastSent.getDate() === today.getDate()
        ) {
          this.logger.debug('User already received post-scan email today, skipping', { userId });
          return;
        }
      }

      const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
      const apiUrl = this.configService.getOrThrow<string>('API_URL');
      const unsubscribeToken = this.unsubscribeTokenService.generateToken(userId);

      const { citationRate, citationRateChange } = await this.computeCitationSummary(project.id);

      await this.emailQueueService.addJob({
        type: 'post-scan',
        to: user.email,
        data: {
          firstName: user.name ?? user.email.split('@')[0],
          projectName: project.brandName,
          projectUrl: `${frontendUrl}/projects/${project.id}`,
          unsubscribeUrl: `${apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
          citationRate,
          citationRateChange,
          upgradeUrl: plan === Plan.FREE ? `${frontendUrl}/billing` : undefined,
        },
      });

      await this.userRepository.updateLastPostScanEmailAt(userId, new Date());

      this.logger.info('Post-scan email queued', { userId });
    } catch (error) {
      // Don't fail the scan if email fails
      this.logger.error(
        'Failed to send post-scan email',
        error instanceof Error ? error : undefined,
        { userId },
      );
    }
  }

  private async computeCitationSummary(
    projectId: string,
  ): Promise<{ citationRate?: number; citationRateChange?: number }> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [currentScans, previousScans] = await Promise.all([
      this.scanRepository.findByProjectIdInRange(projectId, oneWeekAgo, now),
      this.scanRepository.findByProjectIdInRange(projectId, twoWeeksAgo, oneWeekAgo),
    ]);

    if (currentScans.length === 0) {
      return {};
    }

    const totalResults = currentScans.reduce((sum, s) => sum + s.results.length, 0);
    const citedResults = currentScans.reduce(
      (sum, s) => sum + s.results.filter((r) => r.isCited).length,
      0,
    );
    const citationRate = totalResults > 0 ? Math.round((citedResults / totalResults) * 100) : 0;

    if (previousScans.length === 0) {
      return { citationRate };
    }

    const prevTotal = previousScans.reduce((sum, s) => sum + s.results.length, 0);
    const prevCited = previousScans.reduce(
      (sum, s) => sum + s.results.filter((r) => r.isCited).length,
      0,
    );
    const prevRate = prevTotal > 0 ? Math.round((prevCited / prevTotal) * 100) : 0;

    return { citationRate, citationRateChange: citationRate - prevRate };
  }
}

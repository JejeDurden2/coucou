import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LoggerService } from '../../../../common/logger';
import { EmailQueueService } from '../../../../infrastructure/queue/email-queue.service';
import { USER_REPOSITORY, type UserRepository } from '../../../auth';
import { UnsubscribeTokenService } from '../../../email';
import { SCAN_REPOSITORY, type ScanRepository } from '../../domain';

const SCAN_MILESTONES = [5, 10, 25, 50, 100];

@Injectable()
export class MilestoneService {
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
    this.logger.setContext(MilestoneService.name);
  }

  async tryCheck(
    userId: string,
    project: { id: string; brandName: string },
  ): Promise<void> {
    const user = await this.userRepository.findByIdWithEmailPrefs(userId);
    if (!user || !user.emailNotificationsEnabled) return;

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const apiUrl = this.configService.getOrThrow<string>('API_URL');
    const unsubscribeToken = this.unsubscribeTokenService.generateToken(userId);
    const firstName = user.name ?? user.email.split('@')[0];
    const projectUrl = `${frontendUrl}/projects/${project.id}`;
    const unsubscribeUrl = `${apiUrl}/email/unsubscribe?token=${unsubscribeToken}`;

    // Use count query for scan milestones (avoids loading all scan data)
    const scanCount = await this.scanRepository.countByProjectId(project.id);

    if (SCAN_MILESTONES.includes(scanCount)) {
      await this.emailQueueService.addJob({
        type: 'milestone-scan-count',
        to: user.email,
        data: { firstName, scanCount, brandName: project.brandName, projectUrl, unsubscribeUrl },
      });
      this.logger.info('Scan count milestone email queued', { userId, scanCount });
    }

    // First citation check: load recent scans (limited to 100 by default)
    const recentScans = await this.scanRepository.findByProjectId(project.id);
    const totalCited = recentScans.flatMap((s) => s.results).filter((r) => r.isCited).length;

    if (totalCited === 1) {
      await this.emailQueueService.addJob({
        type: 'milestone-first-citation',
        to: user.email,
        data: { firstName, brandName: project.brandName, projectUrl, unsubscribeUrl },
      });
      this.logger.info('First citation milestone email queued', { userId });
    }
  }
}

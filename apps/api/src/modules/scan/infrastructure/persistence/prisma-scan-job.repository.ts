import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../prisma';
import { ScanJob } from '../../domain/entities/scan-job.entity';
import type {
  CreateScanJobData,
  UpdateScanJobData,
  ScanJobRepository,
} from '../../domain/repositories/scan-job.repository';

@Injectable()
export class PrismaScanJobRepository implements ScanJobRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateScanJobData): Promise<ScanJob> {
    const scanJob = await this.prisma.scanJob.create({
      data: {
        projectId: data.projectId,
        userId: data.userId,
        promptId: data.promptId ?? null,
        totalPrompts: data.totalPrompts,
      },
    });
    return ScanJob.fromPersistence(scanJob);
  }

  async findById(id: string): Promise<ScanJob | null> {
    const scanJob = await this.prisma.scanJob.findUnique({ where: { id } });
    return scanJob ? ScanJob.fromPersistence(scanJob) : null;
  }

  async findByProjectId(projectId: string, limit = 20): Promise<ScanJob[]> {
    const scanJobs = await this.prisma.scanJob.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return scanJobs.map((sj) => ScanJob.fromPersistence(sj));
  }

  async update(id: string, data: UpdateScanJobData): Promise<ScanJob> {
    const scanJob = await this.prisma.scanJob.update({
      where: { id },
      data,
    });
    return ScanJob.fromPersistence(scanJob);
  }

  async incrementProgress(id: string, success: boolean): Promise<ScanJob> {
    const scanJob = await this.prisma.scanJob.update({
      where: { id },
      data: {
        processedPrompts: { increment: 1 },
        ...(success ? { successCount: { increment: 1 } } : { failureCount: { increment: 1 } }),
      },
    });
    return ScanJob.fromPersistence(scanJob);
  }
}

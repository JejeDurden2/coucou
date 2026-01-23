import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../prisma';
import { SentimentScan } from '../../domain/entities/sentiment-scan.entity';
import type {
  SentimentScanRepository,
  CreateSentimentScanData,
} from '../../domain/repositories/sentiment-scan.repository';

@Injectable()
export class PrismaSentimentScanRepository implements SentimentScanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: CreateSentimentScanData): Promise<SentimentScan> {
    const scan = await this.prisma.sentimentScan.create({
      data: {
        projectId: data.projectId,
        scannedAt: data.scannedAt,
        globalScore: data.globalScore,
        results: data.results as unknown as object,
      },
    });
    return SentimentScan.fromPersistence(scan);
  }

  async findLatestByProjectId(projectId: string): Promise<SentimentScan | null> {
    const scan = await this.prisma.sentimentScan.findFirst({
      where: { projectId },
      orderBy: { scannedAt: 'desc' },
    });
    return scan ? SentimentScan.fromPersistence(scan) : null;
  }

  async findHistoryByProjectId(projectId: string, since: Date): Promise<SentimentScan[]> {
    const scans = await this.prisma.sentimentScan.findMany({
      where: {
        projectId,
        scannedAt: { gte: since },
      },
      orderBy: { scannedAt: 'desc' },
    });
    return scans.map((scan) => SentimentScan.fromPersistence(scan));
  }
}

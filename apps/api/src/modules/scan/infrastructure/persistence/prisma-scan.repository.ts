import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../prisma';
import { Scan } from '../../domain/entities/scan.entity';
import type { CreateScanData, ScanRepository } from '../../domain/repositories/scan.repository';

@Injectable()
export class PrismaScanRepository implements ScanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Scan | null> {
    const scan = await this.prisma.scan.findUnique({ where: { id } });
    return scan ? Scan.fromPersistence(scan) : null;
  }

  async findByPromptId(promptId: string, limit = 50): Promise<Scan[]> {
    const scans = await this.prisma.scan.findMany({
      where: { promptId },
      orderBy: { executedAt: 'desc' },
      take: limit,
    });
    return scans.map((s) => Scan.fromPersistence(s));
  }

  async findByProjectId(projectId: string, limit = 100): Promise<Scan[]> {
    const scans = await this.prisma.scan.findMany({
      where: {
        prompt: { projectId },
      },
      orderBy: { executedAt: 'desc' },
      take: limit,
    });
    return scans.map((s) => Scan.fromPersistence(s));
  }

  async findByProjectIdInRange(
    projectId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Scan[]> {
    const scans = await this.prisma.scan.findMany({
      where: {
        prompt: { projectId },
        executedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { executedAt: 'asc' },
    });
    return scans.map((s) => Scan.fromPersistence(s));
  }

  async findLatestByProjectId(projectId: string): Promise<Scan | null> {
    const scan = await this.prisma.scan.findFirst({
      where: {
        prompt: { projectId },
      },
      orderBy: { executedAt: 'desc' },
    });
    return scan ? Scan.fromPersistence(scan) : null;
  }

  async create(data: CreateScanData): Promise<Scan> {
    const scan = await this.prisma.scan.create({
      data: {
        promptId: data.promptId,
        results: data.results as unknown as object,
      },
    });
    return Scan.fromPersistence(scan);
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.prisma.scan.deleteMany({
      where: {
        executedAt: { lt: date },
      },
    });
    return result.count;
  }
}

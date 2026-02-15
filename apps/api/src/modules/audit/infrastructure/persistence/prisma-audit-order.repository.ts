import { Inject, Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { AuditStatus } from '@coucou-ia/shared';

import { PrismaService } from '../../../../prisma';
import { AuditOrder } from '../../domain/entities/audit-order.entity';
import type { AuditOrderRepository } from '../../domain/repositories/audit-order.repository';

function toPrismaStatus(status: AuditStatus): $Enums.AuditStatus {
  return status as unknown as $Enums.AuditStatus;
}

function fromPrismaStatus(status: $Enums.AuditStatus): AuditStatus {
  return status as unknown as AuditStatus;
}

const TERMINAL_STATUSES: $Enums.AuditStatus[] = [
  AuditStatus.COMPLETED,
  AuditStatus.FAILED,
].map(toPrismaStatus);

@Injectable()
export class PrismaAuditOrderRepository implements AuditOrderRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async save(auditOrder: AuditOrder): Promise<AuditOrder> {
    const data = {
      userId: auditOrder.userId,
      projectId: auditOrder.projectId,
      status: toPrismaStatus(auditOrder.status),
      stripePaymentIntentId: auditOrder.stripePaymentIntentId,
      amountCents: auditOrder.amountCents,
      paidAt: auditOrder.paidAt,
      briefPayload: auditOrder.briefPayload as unknown as object,
      twinAgentId: auditOrder.twinAgentId,
      reportUrl: auditOrder.reportUrl,
      crawlDataUrl: auditOrder.crawlDataUrl,
      analysisDataUrl: auditOrder.analysisDataUrl,
      retryCount: auditOrder.retryCount,
      pagesAnalyzedClient: auditOrder.pagesAnalyzedClient,
      pagesAnalyzedCompetitors: auditOrder.pagesAnalyzedCompetitors,
      competitorsAnalyzed: auditOrder.competitorsAnalyzed,
      geoScore: auditOrder.geoScore,
      verdict: auditOrder.verdict,
      topFindings: auditOrder.topFindings,
      actionCountCritical: auditOrder.actionCountCritical,
      actionCountHigh: auditOrder.actionCountHigh,
      actionCountMedium: auditOrder.actionCountMedium,
      totalActions: auditOrder.totalActions,
      externalPresenceScore: auditOrder.externalPresenceScore,
      startedAt: auditOrder.startedAt,
      completedAt: auditOrder.completedAt,
      failedAt: auditOrder.failedAt,
      timeoutAt: auditOrder.timeoutAt,
      failureReason: auditOrder.failureReason,
      refundedAt: auditOrder.refundedAt,
      refundId: auditOrder.refundId,
    };

    const record = await this.prisma.auditOrder.upsert({
      where: { id: auditOrder.id },
      create: { id: auditOrder.id, ...data },
      update: data,
    });

    return AuditOrder.fromPersistence({
      ...record,
      status: fromPrismaStatus(record.status),
    });
  }

  async findById(id: string): Promise<AuditOrder | null> {
    const record = await this.prisma.auditOrder.findUnique({ where: { id } });
    if (!record) return null;
    return AuditOrder.fromPersistence({
      ...record,
      status: fromPrismaStatus(record.status),
    });
  }

  async findByProjectId(projectId: string): Promise<AuditOrder[]> {
    const records = await this.prisma.auditOrder.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) =>
      AuditOrder.fromPersistence({
        ...r,
        status: fromPrismaStatus(r.status),
      }),
    );
  }

  async findByUserId(userId: string): Promise<AuditOrder[]> {
    const records = await this.prisma.auditOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) =>
      AuditOrder.fromPersistence({
        ...r,
        status: fromPrismaStatus(r.status),
      }),
    );
  }

  async findLatestByProjectId(projectId: string): Promise<AuditOrder | null> {
    const record = await this.prisma.auditOrder.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) return null;
    return AuditOrder.fromPersistence({
      ...record,
      status: fromPrismaStatus(record.status),
    });
  }

  async findActiveByProjectId(projectId: string): Promise<AuditOrder | null> {
    const record = await this.prisma.auditOrder.findFirst({
      where: {
        projectId,
        status: { notIn: TERMINAL_STATUSES },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) return null;
    return AuditOrder.fromPersistence({
      ...record,
      status: fromPrismaStatus(record.status),
    });
  }

  async findTimedOutAudits(): Promise<AuditOrder[]> {
    const records = await this.prisma.auditOrder.findMany({
      where: {
        status: {
          in: [
            AuditStatus.CRAWLING,
            AuditStatus.ANALYZING,
          ].map(toPrismaStatus),
        },
        timeoutAt: { lt: new Date() },
      },
    });
    return records.map((r) =>
      AuditOrder.fromPersistence({
        ...r,
        status: fromPrismaStatus(r.status),
      }),
    );
  }
}

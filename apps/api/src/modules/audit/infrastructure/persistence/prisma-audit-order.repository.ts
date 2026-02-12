import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditStatus } from '@coucou-ia/shared';

import { PrismaService } from '../../../../prisma';
import { AuditOrder } from '../../domain/entities/audit-order.entity';
import type { AuditOrderRepository } from '../../domain/repositories/audit-order.repository';

const TERMINAL_STATUSES: AuditStatus[] = [
  AuditStatus.COMPLETED,
  AuditStatus.PARTIAL,
  AuditStatus.FAILED,
  AuditStatus.TIMEOUT,
  AuditStatus.SCHEMA_ERROR,
];

function jsonOrDbNull(value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return value === null || value === undefined
    ? Prisma.DbNull
    : (value as Prisma.InputJsonValue);
}

@Injectable()
export class PrismaAuditOrderRepository implements AuditOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(auditOrder: AuditOrder): Promise<AuditOrder> {
    const data = {
      userId: auditOrder.userId,
      projectId: auditOrder.projectId,
      status: auditOrder.status,
      stripePaymentIntentId: auditOrder.stripePaymentIntentId,
      amountCents: auditOrder.amountCents,
      paidAt: auditOrder.paidAt,
      briefPayload: auditOrder.briefPayload as unknown as Prisma.InputJsonValue,
      resultPayload: jsonOrDbNull(auditOrder.resultPayload),
      rawResultPayload: jsonOrDbNull(auditOrder.rawResultPayload),
      twinAgentId: auditOrder.twinAgentId,
      reportUrl: auditOrder.reportUrl,
      startedAt: auditOrder.startedAt,
      completedAt: auditOrder.completedAt,
      failedAt: auditOrder.failedAt,
      timeoutAt: auditOrder.timeoutAt,
      failureReason: auditOrder.failureReason,
    };

    const record = await this.prisma.auditOrder.upsert({
      where: { id: auditOrder.id },
      create: { id: auditOrder.id, ...data },
      update: data,
    });

    return AuditOrder.fromPersistence({
      ...record,
      status: record.status as unknown as AuditStatus,
    });
  }

  async findById(id: string): Promise<AuditOrder | null> {
    const record = await this.prisma.auditOrder.findUnique({ where: { id } });
    if (!record) return null;
    return AuditOrder.fromPersistence({
      ...record,
      status: record.status as unknown as AuditStatus,
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
        status: r.status as unknown as AuditStatus,
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
        status: r.status as unknown as AuditStatus,
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
      status: record.status as unknown as AuditStatus,
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
      status: record.status as unknown as AuditStatus,
    });
  }

  async findTimedOutAudits(): Promise<AuditOrder[]> {
    const records = await this.prisma.auditOrder.findMany({
      where: {
        status: AuditStatus.PROCESSING,
        timeoutAt: { lt: new Date() },
      },
    });
    return records.map((r) =>
      AuditOrder.fromPersistence({
        ...r,
        status: r.status as unknown as AuditStatus,
      }),
    );
  }
}

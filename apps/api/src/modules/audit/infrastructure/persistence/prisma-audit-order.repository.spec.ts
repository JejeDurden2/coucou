import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditStatus } from '@coucou-ia/shared';
import type { AuditBrief } from '@coucou-ia/shared';

import { PrismaAuditOrderRepository } from './prisma-audit-order.repository';
import { AuditOrder } from '../../domain/entities/audit-order.entity';
import type { PrismaService } from '../../../../prisma';

describe('PrismaAuditOrderRepository', () => {
  let repository: PrismaAuditOrderRepository;
  let mockPrisma: {
    auditOrder: {
      upsert: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  const mockBrief: AuditBrief = {
    mission: 'test mission',
    brand: {
      name: 'Test Brand',
      domain: 'test.com',
      variants: [],
      context: {
        businessType: 'SaaS',
        locality: 'France',
        offerings: 'Test',
        audience: 'B2B',
      },
    },
    scanData: {
      summary: {
        totalScans: 10,
        dateRange: '2026-01-01 - 2026-01-30',
        globalCitationRate: 0.5,
        globalAvgPosition: 3,
        trend: 'stable',
      },
      byProvider: {},
      sentiment: {
        score: 0,
        themes: [],
        positiveTerms: [],
        negativeTerms: [],
        rawSummary: '',
      },
      promptResults: [],
    },
    competitors: { primary: [] },
    callback: {
      url: 'https://api.test.com/webhooks/twin',
      authHeader: 'Bearer secret',
      auditId: 'audit-123',
    },
    outputFormat: {
      schema: 'audit_result_v1',
      sections: ['geo_score'],
      language: 'fr',
    },
  };

  const mockRecord = {
    id: 'audit-123',
    userId: 'user-456',
    projectId: 'project-789',
    status: AuditStatus.PENDING,
    stripePaymentIntentId: null,
    amountCents: 4900,
    paidAt: null,
    briefPayload: mockBrief,
    resultPayload: null,
    rawResultPayload: null,
    twinAgentId: null,
    reportUrl: null,
    startedAt: null,
    completedAt: null,
    failedAt: null,
    timeoutAt: null,
    failureReason: null,
    createdAt: new Date('2026-02-10T10:00:00Z'),
    updatedAt: new Date('2026-02-10T10:00:00Z'),
  };

  beforeEach(() => {
    mockPrisma = {
      auditOrder: {
        upsert: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    };

    repository = new PrismaAuditOrderRepository(
      mockPrisma as unknown as PrismaService,
    );
  });

  describe('save', () => {
    it('should upsert an audit order and return domain entity', async () => {
      mockPrisma.auditOrder.upsert.mockResolvedValue(mockRecord);

      const auditOrder = AuditOrder.create({
        ...mockRecord,
        briefPayload: mockBrief,
      });

      const result = await repository.save(auditOrder);

      expect(mockPrisma.auditOrder.upsert).toHaveBeenCalledWith({
        where: { id: 'audit-123' },
        create: expect.objectContaining({
          id: 'audit-123',
          userId: 'user-456',
          projectId: 'project-789',
          status: AuditStatus.PENDING,
          amountCents: 4900,
        }),
        update: expect.objectContaining({
          userId: 'user-456',
          projectId: 'project-789',
          status: AuditStatus.PENDING,
        }),
      });

      expect(result).toBeInstanceOf(AuditOrder);
      expect(result.id).toBe('audit-123');
      expect(result.status).toBe(AuditStatus.PENDING);
    });
  });

  describe('findById', () => {
    it('should return domain entity when found', async () => {
      mockPrisma.auditOrder.findUnique.mockResolvedValue(mockRecord);

      const result = await repository.findById('audit-123');

      expect(mockPrisma.auditOrder.findUnique).toHaveBeenCalledWith({
        where: { id: 'audit-123' },
      });
      expect(result).toBeInstanceOf(AuditOrder);
      expect(result?.id).toBe('audit-123');
    });

    it('should return null when not found', async () => {
      mockPrisma.auditOrder.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByProjectId', () => {
    it('should return list of audit orders sorted by createdAt desc', async () => {
      const olderRecord = {
        ...mockRecord,
        id: 'audit-100',
        createdAt: new Date('2026-02-01T10:00:00Z'),
      };
      mockPrisma.auditOrder.findMany.mockResolvedValue([
        mockRecord,
        olderRecord,
      ]);

      const result = await repository.findByProjectId('project-789');

      expect(mockPrisma.auditOrder.findMany).toHaveBeenCalledWith({
        where: { projectId: 'project-789' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('audit-123');
      expect(result[1].id).toBe('audit-100');
    });
  });

  describe('findByUserId', () => {
    it('should return list of audit orders sorted by createdAt desc', async () => {
      mockPrisma.auditOrder.findMany.mockResolvedValue([mockRecord]);

      const result = await repository.findByUserId('user-456');

      expect(mockPrisma.auditOrder.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-456' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-456');
    });
  });

  describe('findActiveByProjectId', () => {
    it('should return active audit order excluding terminal statuses', async () => {
      const activeRecord = {
        ...mockRecord,
        status: AuditStatus.PROCESSING,
      };
      mockPrisma.auditOrder.findFirst.mockResolvedValue(activeRecord);

      const result = await repository.findActiveByProjectId('project-789');

      expect(mockPrisma.auditOrder.findFirst).toHaveBeenCalledWith({
        where: {
          projectId: 'project-789',
          status: {
            notIn: [
              AuditStatus.COMPLETED,
              AuditStatus.PARTIAL,
              AuditStatus.FAILED,
              AuditStatus.TIMEOUT,
              AuditStatus.SCHEMA_ERROR,
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toBeInstanceOf(AuditOrder);
      expect(result?.status).toBe(AuditStatus.PROCESSING);
    });

    it('should return null when no active audit exists', async () => {
      mockPrisma.auditOrder.findFirst.mockResolvedValue(null);

      const result = await repository.findActiveByProjectId('project-789');

      expect(result).toBeNull();
    });
  });

  describe('findTimedOutAudits', () => {
    it('should return processing audits past their timeout', async () => {
      const timedOutRecord = {
        ...mockRecord,
        status: AuditStatus.PROCESSING,
        timeoutAt: new Date('2026-02-10T09:00:00Z'),
      };
      mockPrisma.auditOrder.findMany.mockResolvedValue([timedOutRecord]);

      const result = await repository.findTimedOutAudits();

      expect(mockPrisma.auditOrder.findMany).toHaveBeenCalledWith({
        where: {
          status: AuditStatus.PROCESSING,
          timeoutAt: { lt: expect.any(Date) },
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(AuditStatus.PROCESSING);
    });

    it('should return empty array when no timed out audits', async () => {
      mockPrisma.auditOrder.findMany.mockResolvedValue([]);

      const result = await repository.findTimedOutAudits();

      expect(result).toEqual([]);
    });
  });
});

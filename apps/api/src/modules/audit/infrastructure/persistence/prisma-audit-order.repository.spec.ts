import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditStatus } from '@coucou-ia/shared';
import type { TwinCrawlInput } from '@coucou-ia/shared';

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

  const mockBrief: TwinCrawlInput = {
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
      clientCitationRate: 0.5,
      totalQueriesTested: 10,
      clientMentionsCount: 5,
      averageSentiment: 'neutral',
      positionsWhenCited: [1, 3],
      topPerformingQueries: ['best tool'],
      queriesNotCited: ['other query'],
    },
    competitors: {
      primary: [{ name: 'Competitor A', domain: '' }],
      maxPagesPerCompetitor: 3,
    },
    callback: {
      url: 'https://api.test.com/webhooks/twin/audit',
      auditId: 'audit-123',
    },
    outputFormat: 'structured_observations',
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
    crawlDataUrl: null,
    analysisDataUrl: null,
    startedAt: null,
    completedAt: null,
    failedAt: null,
    timeoutAt: null,
    failureReason: null,
    retryCount: 0,
    pagesAnalyzedClient: null,
    pagesAnalyzedCompetitors: null,
    competitorsAnalyzed: [],
    geoScore: null,
    verdict: null,
    topFindings: [],
    actionCountCritical: null,
    actionCountHigh: null,
    actionCountMedium: null,
    totalActions: null,
    externalPresenceScore: null,
    refundedAt: null,
    refundId: null,
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
        storedGeoScore: mockRecord.geoScore,
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

    it('should persist refundedAt and refundId', async () => {
      const refundedRecord = {
        ...mockRecord,
        status: AuditStatus.FAILED,
        refundedAt: new Date('2026-02-10T11:00:00Z'),
        refundId: 're_refund_123',
      };
      mockPrisma.auditOrder.upsert.mockResolvedValue(refundedRecord);

      const auditOrder = AuditOrder.create({
        ...refundedRecord,
        briefPayload: mockBrief,
        storedGeoScore: refundedRecord.geoScore,
      });

      await repository.save(auditOrder);

      const upsertCall = mockPrisma.auditOrder.upsert.mock.calls[0][0];
      expect(upsertCall.create.refundedAt).toEqual(new Date('2026-02-10T11:00:00Z'));
      expect(upsertCall.create.refundId).toBe('re_refund_123');
      expect(upsertCall.update.refundedAt).toEqual(new Date('2026-02-10T11:00:00Z'));
      expect(upsertCall.update.refundId).toBe('re_refund_123');
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
          status: {
            in: [
              AuditStatus.CRAWLING,
              AuditStatus.ANALYZING,
              AuditStatus.PROCESSING,
            ],
          },
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

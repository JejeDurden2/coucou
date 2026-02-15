import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditStatus } from '@coucou-ia/shared';
import type { TwinCrawlInput } from '@coucou-ia/shared';

import { GetLatestAuditUseCase } from '../application/use-cases/get-latest-audit.use-case';
import { AuditOrder } from '../domain/entities/audit-order.entity';
import type { AuditOrderProps } from '../domain/entities/audit-order.entity';
import type { AuditOrderRepository } from '../domain/repositories/audit-order.repository';
import type { ProjectRepository } from '../../project/domain/repositories/project.repository';

const BASE_DATE = new Date('2026-01-15T10:00:00Z');

function mockBrief(): TwinCrawlInput {
  return {
    brand: {
      name: 'TestBrand',
      domain: 'testbrand.com',
      variants: ['TB'],
      context: {
        businessType: 'SaaS',
        locality: 'France',
        offerings: 'SEO tools',
        audience: 'Marketers',
      },
    },
    scanData: {
      clientCitationRate: 0.3,
      totalQueriesTested: 10,
      clientMentionsCount: 3,
      averageSentiment: 'neutral',
      positionsWhenCited: [2, 4, 5],
      topPerformingQueries: ['best seo tool'],
      queriesNotCited: ['seo audit'],
    },
    competitors: { primary: [{ name: 'Competitor A', domain: '' }], maxPagesPerCompetitor: 3 },
    callback: { url: 'https://api.test.com/webhooks/twin/audit', auditId: 'audit-123' },
    outputFormat: 'structured_observations',
  };
}

function mockProps(overrides: Partial<AuditOrderProps> = {}): AuditOrderProps {
  return {
    id: 'audit-123',
    userId: 'user-123',
    projectId: 'project-123',
    status: AuditStatus.PENDING,
    stripePaymentIntentId: null,
    amountCents: 4900,
    paidAt: null,
    briefPayload: mockBrief(),
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
    storedGeoScore: null,
    verdict: null,
    topFindings: [],
    actionCountCritical: null,
    actionCountHigh: null,
    actionCountMedium: null,
    totalActions: null,
    externalPresenceScore: null,
    refundedAt: null,
    refundId: null,
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

const mockProject = {
  id: 'project-123',
  belongsTo: vi.fn().mockReturnValue(true),
};

describe('GetLatestAuditUseCase', () => {
  let useCase: GetLatestAuditUseCase;
  let projectRepository: { findById: ReturnType<typeof vi.fn> };
  let auditOrderRepository: { findLatestByProjectId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    projectRepository = { findById: vi.fn().mockResolvedValue(mockProject) };
    auditOrderRepository = { findLatestByProjectId: vi.fn().mockResolvedValue(null) };
    mockProject.belongsTo.mockReturnValue(true);

    useCase = new GetLatestAuditUseCase(
      projectRepository as unknown as ProjectRepository,
      auditOrderRepository as unknown as AuditOrderRepository,
    );
  });

  it('should return hasAudit false when no audit exists', async () => {
    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ hasAudit: false });
    }
  });

  it('should return NotFoundError when project does not exist', async () => {
    projectRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_FOUND');
    }
  });

  it('should return ForbiddenError when user does not own project', async () => {
    mockProject.belongsTo.mockReturnValue(false);

    const result = await useCase.execute('project-123', 'user-456');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN');
    }
  });

  it('should return hasAudit false for PENDING status (awaiting payment)', async () => {
    const audit = AuditOrder.create(mockProps({ status: AuditStatus.PENDING }));
    auditOrderRepository.findLatestByProjectId.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ hasAudit: false });
    }
  });

  it('should return PAID response for PAID status', async () => {
    const paidAt = new Date('2026-01-15T11:00:00Z');
    const audit = AuditOrder.create(
      mockProps({ status: AuditStatus.PAID, paidAt }),
    );
    auditOrderRepository.findLatestByProjectId.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        hasAudit: true,
        auditId: 'audit-123',
        status: AuditStatus.PAID,
        createdAt: BASE_DATE.toISOString(),
        paidAt: paidAt.toISOString(),
      });
    }
  });

  it('should return CRAWLING response', async () => {
    const paidAt = new Date('2026-01-15T11:00:00Z');
    const audit = AuditOrder.create(
      mockProps({
        status: AuditStatus.CRAWLING,
        paidAt,
        startedAt: new Date('2026-01-15T11:30:00Z'),
      }),
    );
    auditOrderRepository.findLatestByProjectId.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        hasAudit: true,
        auditId: 'audit-123',
        status: AuditStatus.CRAWLING,
        createdAt: BASE_DATE.toISOString(),
        paidAt: paidAt.toISOString(),
      });
    }
  });

  it('should return ANALYZING response with crawl metadata', async () => {
    const audit = AuditOrder.create(
      mockProps({
        status: AuditStatus.ANALYZING,
        paidAt: new Date('2026-01-15T11:00:00Z'),
        startedAt: new Date('2026-01-15T11:30:00Z'),
        pagesAnalyzedClient: 12,
        competitorsAnalyzed: ['competitor-a.com', 'competitor-b.com'],
      }),
    );
    auditOrderRepository.findLatestByProjectId.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        hasAudit: true,
        auditId: 'audit-123',
        status: AuditStatus.ANALYZING,
        pagesAnalyzedClient: 12,
        competitorsAnalyzed: ['competitor-a.com', 'competitor-b.com'],
      });
    }
  });

  it('should return COMPLETED response with denormalized metadata', async () => {
    const completedAt = new Date('2026-01-15T12:00:00Z');
    const audit = AuditOrder.create(
      mockProps({
        status: AuditStatus.COMPLETED,
        completedAt,
        storedGeoScore: 72,
        verdict: 'correcte',
        topFindings: ['Good structure', 'Weak content'],
        externalPresenceScore: 45,
        actionCountCritical: 2,
        actionCountHigh: 5,
        actionCountMedium: 8,
        totalActions: 15,
        competitorsAnalyzed: ['competitor-a.com'],
        pagesAnalyzedClient: 12,
        pagesAnalyzedCompetitors: 24,
      }),
    );
    auditOrderRepository.findLatestByProjectId.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        hasAudit: true,
        auditId: 'audit-123',
        status: AuditStatus.COMPLETED,
        geoScore: 72,
        verdict: 'correcte',
        topFindings: ['Good structure', 'Weak content'],
        externalPresenceScore: 45,
        actionCount: { critical: 2, high: 5, medium: 8 },
        totalActions: 15,
        competitorsAnalyzed: ['competitor-a.com'],
        pagesAnalyzedClient: 12,
        pagesAnalyzedCompetitors: 24,
        completedAt: completedAt.toISOString(),
      });
    }
  });

  it('should return FAILED response for FAILED status', async () => {
    const audit = AuditOrder.create(
      mockProps({
        status: AuditStatus.FAILED,
        failureReason: 'Agent timeout',
      }),
    );
    auditOrderRepository.findLatestByProjectId.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        hasAudit: true,
        auditId: 'audit-123',
        status: AuditStatus.FAILED,
        failureReason: 'Agent timeout',
      });
    }
  });

  it('should never expose crawlDataUrl or analysisDataUrl', async () => {
    const completedAt = new Date('2026-01-15T12:00:00Z');
    const audit = AuditOrder.create(
      mockProps({
        status: AuditStatus.COMPLETED,
        completedAt,
        crawlDataUrl: 'r2://secret-crawl-data',
        analysisDataUrl: 'r2://secret-analysis-data',
        storedGeoScore: 72,
      }),
    );
    auditOrderRepository.findLatestByProjectId.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      const json = JSON.stringify(result.value);
      expect(json).not.toContain('crawlDataUrl');
      expect(json).not.toContain('analysisDataUrl');
      expect(json).not.toContain('secret-crawl-data');
      expect(json).not.toContain('secret-analysis-data');
    }
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditStatus } from '@coucou-ia/shared';
import type { AuditBrief, AuditResult } from '@coucou-ia/shared';

import { GetLatestAuditUseCase } from '../application/use-cases/get-latest-audit.use-case';
import { AuditOrder } from '../domain/entities/audit-order.entity';
import type { AuditOrderProps } from '../domain/entities/audit-order.entity';
import type { AuditOrderRepository } from '../domain/repositories/audit-order.repository';
import type { ProjectRepository } from '../../project/domain/repositories/project.repository';

const BASE_DATE = new Date('2026-01-15T10:00:00Z');

function mockBrief(): AuditBrief {
  return {
    mission: 'Test mission',
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
      summary: {
        totalScans: 10,
        dateRange: '2026-01-01 - 2026-01-15',
        globalCitationRate: 0.3,
        globalAvgPosition: 4.2,
        trend: 'stable',
      },
      byProvider: {},
      sentiment: {
        score: 65,
        themes: [],
        positiveTerms: [],
        negativeTerms: [],
        rawSummary: '',
      },
      promptResults: [],
    },
    competitors: { primary: [] },
    callback: { url: 'https://api.test.com/webhooks/twin', auditId: 'audit-123' },
    outputFormat: {
      schema: 'audit_result_v1',
      sections: ['geo_score', 'site_audit', 'competitor_benchmark', 'action_plan', 'external_presence'],
      language: 'fr',
    },
  };
}

function mockAuditResult(): AuditResult {
  return {
    geoScore: {
      overall: 72,
      structure: 80,
      content: 65,
      technical: 70,
      competitive: 73,
      methodology: 'Test methodology',
      mainStrengths: ['Good structure'],
      mainWeaknesses: ['Low content'],
    },
    siteAudit: { pagesAnalyzed: [] },
    competitorBenchmark: [],
    actionPlan: { quickWins: [], shortTerm: [], mediumTerm: [] },
    externalPresence: {
      sourcesAudited: [],
      presenceScore: 0,
      mainGaps: [],
    },
    meta: {
      pagesAnalyzedClient: 5,
      pagesAnalyzedCompetitors: 10,
      executionTimeSeconds: 120,
      completedAt: '2026-01-15T12:00:00Z',
    },
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
    resultPayload: null,
    rawResultPayload: null,
    twinAgentId: null,
    reportUrl: null,
    startedAt: null,
    completedAt: null,
    failedAt: null,
    timeoutAt: null,
    failureReason: null,
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

  it('should return in-progress response for PAID status with paidAt', async () => {
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
        status: AuditStatus.PAID,
        createdAt: BASE_DATE.toISOString(),
        paidAt: paidAt.toISOString(),
        startedAt: null,
      });
    }
  });

  it('should return in-progress response for PROCESSING status', async () => {
    const startedAt = new Date('2026-01-15T11:30:00Z');
    const audit = AuditOrder.create(
      mockProps({
        status: AuditStatus.PROCESSING,
        paidAt: new Date('2026-01-15T11:00:00Z'),
        startedAt,
      }),
    );
    auditOrderRepository.findLatestByProjectId.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        hasAudit: true,
        status: AuditStatus.PROCESSING,
        createdAt: BASE_DATE.toISOString(),
        paidAt: expect.any(String),
        startedAt: startedAt.toISOString(),
      });
    }
  });

  it('should return completed response for COMPLETED status', async () => {
    const completedAt = new Date('2026-01-15T12:00:00Z');
    const auditResult = mockAuditResult();
    const audit = AuditOrder.create(
      mockProps({
        status: AuditStatus.COMPLETED,
        resultPayload: auditResult,
        reportUrl: 'https://cdn.example.com/report.pdf',
        completedAt,
      }),
    );
    auditOrderRepository.findLatestByProjectId.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        hasAudit: true,
        status: AuditStatus.COMPLETED,
        createdAt: BASE_DATE.toISOString(),
        result: auditResult,
        reportUrl: 'https://cdn.example.com/report.pdf',
        completedAt: completedAt.toISOString(),
      });
    }
  });

  it('should return completed response for PARTIAL status', async () => {
    const completedAt = new Date('2026-01-15T12:00:00Z');
    const auditResult = mockAuditResult();
    const audit = AuditOrder.create(
      mockProps({
        status: AuditStatus.PARTIAL,
        resultPayload: auditResult,
        completedAt,
      }),
    );
    auditOrderRepository.findLatestByProjectId.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        hasAudit: true,
        status: AuditStatus.PARTIAL,
        createdAt: BASE_DATE.toISOString(),
        result: auditResult,
        reportUrl: null,
        completedAt: completedAt.toISOString(),
      });
    }
  });

  it('should return failed response for FAILED status', async () => {
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
        status: AuditStatus.FAILED,
        createdAt: BASE_DATE.toISOString(),
        failureReason: 'Agent timeout',
      });
    }
  });

  it('should return failed response for TIMEOUT status', async () => {
    const audit = AuditOrder.create(
      mockProps({ status: AuditStatus.TIMEOUT }),
    );
    auditOrderRepository.findLatestByProjectId.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        hasAudit: true,
        status: AuditStatus.TIMEOUT,
        createdAt: BASE_DATE.toISOString(),
        failureReason: null,
      });
    }
  });

  it('should return failed response for SCHEMA_ERROR status', async () => {
    const audit = AuditOrder.create(
      mockProps({ status: AuditStatus.SCHEMA_ERROR }),
    );
    auditOrderRepository.findLatestByProjectId.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        hasAudit: true,
        status: AuditStatus.SCHEMA_ERROR,
        createdAt: BASE_DATE.toISOString(),
        failureReason: null,
      });
    }
  });
});

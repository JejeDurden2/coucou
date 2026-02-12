import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditStatus } from '@coucou-ia/shared';
import type { AuditBrief, AuditResult } from '@coucou-ia/shared';

import { GetAuditHistoryUseCase } from '../application/use-cases/get-audit-history.use-case';
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

describe('GetAuditHistoryUseCase', () => {
  let useCase: GetAuditHistoryUseCase;
  let projectRepository: { findById: ReturnType<typeof vi.fn> };
  let auditOrderRepository: { findByProjectId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    projectRepository = { findById: vi.fn().mockResolvedValue(mockProject) };
    auditOrderRepository = { findByProjectId: vi.fn().mockResolvedValue([]) };
    mockProject.belongsTo.mockReturnValue(true);

    useCase = new GetAuditHistoryUseCase(
      projectRepository as unknown as ProjectRepository,
      auditOrderRepository as unknown as AuditOrderRepository,
    );
  });

  it('should return empty array when no audits exist', async () => {
    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ audits: [] });
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

  it('should map audits correctly with geoScore for completed audits', async () => {
    const completedAudit = AuditOrder.create(
      mockProps({
        id: 'audit-1',
        status: AuditStatus.COMPLETED,
        resultPayload: mockAuditResult(),
        completedAt: new Date('2026-01-15T12:00:00Z'),
      }),
    );
    const pendingAudit = AuditOrder.create(
      mockProps({
        id: 'audit-2',
        status: AuditStatus.PENDING,
        createdAt: new Date('2026-01-16T10:00:00Z'),
      }),
    );

    auditOrderRepository.findByProjectId.mockResolvedValue([
      pendingAudit,
      completedAudit,
    ]);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.audits).toHaveLength(2);
      expect(result.value.audits[0]).toEqual({
        id: 'audit-2',
        status: AuditStatus.PENDING,
        geoScore: null,
        createdAt: new Date('2026-01-16T10:00:00Z').toISOString(),
      });
      expect(result.value.audits[1]).toEqual({
        id: 'audit-1',
        status: AuditStatus.COMPLETED,
        geoScore: 72,
        createdAt: BASE_DATE.toISOString(),
      });
    }
  });

  it('should return null geoScore for non-completed audits', async () => {
    const failedAudit = AuditOrder.create(
      mockProps({
        id: 'audit-1',
        status: AuditStatus.FAILED,
        failureReason: 'error',
      }),
    );

    auditOrderRepository.findByProjectId.mockResolvedValue([failedAudit]);

    const result = await useCase.execute('project-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.audits[0]!.geoScore).toBeNull();
    }
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditStatus } from '@coucou-ia/shared';
import type { AuditResult, TwinCrawlInput } from '@coucou-ia/shared';

import { GetAuditPdfUseCase } from '../application/use-cases/get-audit-pdf.use-case';
import { AuditOrder } from '../domain/entities/audit-order.entity';
import type { AuditOrderProps } from '../domain/entities/audit-order.entity';
import type { AuditOrderRepository } from '../domain/repositories/audit-order.repository';
import type { AuditPdfPort } from '../domain/ports/audit-pdf.port';
import type { ProjectRepository } from '../../project/domain/repositories/project.repository';
import { Result } from '../../../common/utils/result';
import { DomainError } from '../../../common/errors/domain-error';

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

class TestPdfError extends DomainError {
  readonly code = 'PDF_GENERATION_FAILED' as const;
  readonly statusCode = 500 as const;

  constructor() {
    super('PDF generation failed');
  }
}

const mockProject = {
  id: 'project-123',
  belongsTo: vi.fn().mockReturnValue(true),
};

describe('GetAuditPdfUseCase', () => {
  let useCase: GetAuditPdfUseCase;
  let projectRepository: { findById: ReturnType<typeof vi.fn> };
  let auditOrderRepository: {
    findById: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let auditPdfPort: { generateReport: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    projectRepository = { findById: vi.fn().mockResolvedValue(mockProject) };
    auditOrderRepository = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockImplementation((audit: AuditOrder) => Promise.resolve(audit)),
    };
    auditPdfPort = {
      generateReport: vi.fn().mockResolvedValue(
        Result.ok({ url: 'https://cdn.example.com/signed-report.pdf' }),
      ),
    };
    mockProject.belongsTo.mockReturnValue(true);

    useCase = new GetAuditPdfUseCase(
      projectRepository as unknown as ProjectRepository,
      auditOrderRepository as unknown as AuditOrderRepository,
      auditPdfPort as unknown as AuditPdfPort,
    );
  });

  it('should return redirect URL when PDF generation succeeds', async () => {
    const audit = AuditOrder.create(
      mockProps({
        status: AuditStatus.COMPLETED,
        resultPayload: mockAuditResult(),
        completedAt: new Date('2026-01-15T12:00:00Z'),
      }),
    );
    auditOrderRepository.findById.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'audit-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.redirectUrl).toBe('https://cdn.example.com/signed-report.pdf');
    }
  });

  it('should persist the new reportUrl', async () => {
    const audit = AuditOrder.create(
      mockProps({
        status: AuditStatus.COMPLETED,
        resultPayload: mockAuditResult(),
        completedAt: new Date('2026-01-15T12:00:00Z'),
      }),
    );
    auditOrderRepository.findById.mockResolvedValue(audit);

    await useCase.execute('project-123', 'audit-123', 'user-123');

    expect(auditOrderRepository.save).toHaveBeenCalledOnce();
    const savedAudit = auditOrderRepository.save.mock.calls[0]![0] as AuditOrder;
    expect(savedAudit.reportUrl).toBe('https://cdn.example.com/signed-report.pdf');
  });

  it('should return NotFoundError when project does not exist', async () => {
    projectRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('project-123', 'audit-123', 'user-123');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_FOUND');
    }
  });

  it('should return ForbiddenError when user does not own project', async () => {
    mockProject.belongsTo.mockReturnValue(false);

    const result = await useCase.execute('project-123', 'audit-123', 'user-456');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN');
    }
  });

  it('should return AuditNotFoundError when audit does not exist', async () => {
    auditOrderRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('project-123', 'audit-123', 'user-123');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('AUDIT_NOT_FOUND');
    }
  });

  it('should return AuditNotFoundError when audit belongs to different project', async () => {
    const audit = AuditOrder.create(
      mockProps({
        projectId: 'project-999',
        status: AuditStatus.COMPLETED,
        resultPayload: mockAuditResult(),
        completedAt: new Date('2026-01-15T12:00:00Z'),
      }),
    );
    auditOrderRepository.findById.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'audit-123', 'user-123');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('AUDIT_NOT_FOUND');
    }
  });

  it('should return AuditReportNotAvailableError for non-completed status', async () => {
    const statuses = [
      AuditStatus.PENDING,
      AuditStatus.PAID,
      AuditStatus.PROCESSING,
      AuditStatus.FAILED,
      AuditStatus.TIMEOUT,
      AuditStatus.SCHEMA_ERROR,
    ];

    for (const status of statuses) {
      const audit = AuditOrder.create(mockProps({ status }));
      auditOrderRepository.findById.mockResolvedValue(audit);

      const result = await useCase.execute('project-123', 'audit-123', 'user-123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('AUDIT_REPORT_NOT_AVAILABLE');
      }
    }
  });

  it('should return error when PDF generation fails', async () => {
    const audit = AuditOrder.create(
      mockProps({
        status: AuditStatus.COMPLETED,
        resultPayload: mockAuditResult(),
        completedAt: new Date('2026-01-15T12:00:00Z'),
      }),
    );
    auditOrderRepository.findById.mockResolvedValue(audit);
    auditPdfPort.generateReport.mockResolvedValue(Result.err(new TestPdfError()));

    const result = await useCase.execute('project-123', 'audit-123', 'user-123');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PDF_GENERATION_FAILED');
    }
  });

  it('should work for PARTIAL status', async () => {
    const audit = AuditOrder.create(
      mockProps({
        status: AuditStatus.PARTIAL,
        resultPayload: mockAuditResult(),
        completedAt: new Date('2026-01-15T12:00:00Z'),
      }),
    );
    auditOrderRepository.findById.mockResolvedValue(audit);

    const result = await useCase.execute('project-123', 'audit-123', 'user-123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.redirectUrl).toBe('https://cdn.example.com/signed-report.pdf');
    }
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuditStatus } from '@coucou-ia/shared';
import type { AuditResult, TwinCrawlInput } from '@coucou-ia/shared';

import { AuditOrder } from '../domain/entities/audit-order.entity';
import type { AuditOrderProps } from '../domain/entities/audit-order.entity';
import { AuditInvalidTransitionError } from '../domain/errors/audit.errors';

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
    competitors: {
      primary: [{ name: 'Competitor A', domain: 'competitor-a.com' }],
      maxPagesPerCompetitor: 3,
    },
    callback: {
      url: 'https://api.test.com/webhooks/twin/audit',
      auditId: 'audit-123',
    },
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
    actionPlan: {
      quickWins: [],
      shortTerm: [],
      mediumTerm: [],
    },
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

describe('AuditOrder', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('create', () => {
    it('should create an AuditOrder with given props', () => {
      const props = mockProps();
      const order = AuditOrder.create(props);

      expect(order.id).toBe('audit-123');
      expect(order.status).toBe(AuditStatus.PENDING);
      expect(order.userId).toBe('user-123');
      expect(order.projectId).toBe('project-123');
      expect(order.amountCents).toBe(4900);
    });
  });

  describe('fromPersistence', () => {
    it('should hydrate from persistence data with unknown JSON fields', () => {
      const data = {
        id: 'audit-456',
        userId: 'user-456',
        projectId: 'project-456',
        status: AuditStatus.COMPLETED,
        stripePaymentIntentId: 'pi_test',
        amountCents: 4900,
        paidAt: BASE_DATE,
        briefPayload: mockBrief() as unknown,
        resultPayload: mockAuditResult() as unknown,
        rawResultPayload: null,
        twinAgentId: 'agent-1',
        reportUrl: 'https://cdn.test.com/report.pdf',
        crawlDataUrl: null,
        analysisDataUrl: null,
        startedAt: BASE_DATE,
        completedAt: BASE_DATE,
        failedAt: null,
        timeoutAt: null,
        failureReason: null,
        retryCount: 0,
        pagesAnalyzedClient: null,
        pagesAnalyzedCompetitors: null,
        competitorsAnalyzed: [],
        geoScore: 72,
        verdict: 'correcte',
        topFindings: ['Good SEO'],
        actionCountCritical: 1,
        actionCountHigh: 3,
        actionCountMedium: 5,
        totalActions: 9,
        externalPresenceScore: 60,
        refundedAt: null,
        refundId: null,
        createdAt: BASE_DATE,
        updatedAt: BASE_DATE,
      };

      const order = AuditOrder.fromPersistence(data);

      expect(order.id).toBe('audit-456');
      expect(order.status).toBe(AuditStatus.COMPLETED);
      expect(order.resultPayload?.geoScore.overall).toBe(72);
      expect(order.briefPayload.brand.name).toBe('TestBrand');
    });
  });

  // ---- markPaid ----

  describe('markPaid', () => {
    it('should transition PENDING -> PAID', () => {
      const order = AuditOrder.create(mockProps());
      const result = order.markPaid('pi_stripe_123');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status).toBe(AuditStatus.PAID);
        expect(result.value.stripePaymentIntentId).toBe('pi_stripe_123');
        expect(result.value.paidAt).toEqual(new Date('2026-01-15T12:00:00Z'));
      }
    });

    it('should return error from PROCESSING', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.PROCESSING }),
      );
      const result = order.markPaid('pi_test');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
        expect(result.error.metadata?.currentStatus).toBe('PROCESSING');
        expect(result.error.metadata?.targetStatus).toBe('PAID');
      }
    });

    it('should return error from COMPLETED', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.COMPLETED }),
      );
      const result = order.markPaid('pi_test');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });
  });

  // ---- markCrawling ----

  describe('markCrawling', () => {
    it('should transition PAID -> CRAWLING with correct timestamps', () => {
      const order = AuditOrder.create(mockProps({ status: AuditStatus.PAID }));
      const result = order.markCrawling('twin-agent-42');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status).toBe(AuditStatus.CRAWLING);
        expect(result.value.twinAgentId).toBe('twin-agent-42');
        expect(result.value.startedAt).toEqual(
          new Date('2026-01-15T12:00:00Z'),
        );
        expect(result.value.timeoutAt).toEqual(
          new Date('2026-01-15T12:15:00Z'),
        );
      }
    });

    it('should return error from PENDING', () => {
      const order = AuditOrder.create(mockProps());
      const result = order.markCrawling('twin-agent-42');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
        expect(result.error.metadata?.currentStatus).toBe('PENDING');
        expect(result.error.metadata?.targetStatus).toBe('CRAWLING');
      }
    });

    it('should return error from COMPLETED', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.COMPLETED }),
      );
      const result = order.markCrawling('twin-agent-42');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });
  });

  // ---- markProcessing (backward compat) ----

  describe('markProcessing', () => {
    it('should transition PAID -> PROCESSING with correct timestamps', () => {
      const order = AuditOrder.create(mockProps({ status: AuditStatus.PAID }));
      const result = order.markProcessing('twin-agent-42');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status).toBe(AuditStatus.PROCESSING);
        expect(result.value.twinAgentId).toBe('twin-agent-42');
        expect(result.value.startedAt).toEqual(
          new Date('2026-01-15T12:00:00Z'),
        );
        expect(result.value.timeoutAt).toEqual(
          new Date('2026-01-15T12:15:00Z'),
        );
      }
    });

    it('should return error from PENDING', () => {
      const order = AuditOrder.create(mockProps());
      const result = order.markProcessing('twin-agent-42');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
        expect(result.error.metadata?.currentStatus).toBe('PENDING');
        expect(result.error.metadata?.targetStatus).toBe('PROCESSING');
      }
    });

    it('should return error from COMPLETED', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.COMPLETED }),
      );
      const result = order.markProcessing('twin-agent-42');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });
  });

  // ---- markCompleted ----

  describe('markCompleted', () => {
    it('should transition PROCESSING -> COMPLETED with result', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.PROCESSING }),
      );
      const auditResult = mockAuditResult();
      const result = order.markCompleted(auditResult);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status).toBe(AuditStatus.COMPLETED);
        expect(result.value.resultPayload).toBe(auditResult);
        expect(result.value.completedAt).toEqual(
          new Date('2026-01-15T12:00:00Z'),
        );
      }
    });

    it('should return error from PAID', () => {
      const order = AuditOrder.create(mockProps({ status: AuditStatus.PAID }));
      const result = order.markCompleted(mockAuditResult());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });
  });

  // ---- markPartial ----

  describe('markPartial', () => {
    it('should transition PROCESSING -> PARTIAL with result', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.PROCESSING }),
      );
      const auditResult = mockAuditResult();
      const result = order.markPartial(auditResult);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status).toBe(AuditStatus.PARTIAL);
        expect(result.value.resultPayload).toBe(auditResult);
        expect(result.value.completedAt).toEqual(
          new Date('2026-01-15T12:00:00Z'),
        );
      }
    });

    it('should return error from PAID', () => {
      const order = AuditOrder.create(mockProps({ status: AuditStatus.PAID }));
      const result = order.markPartial(mockAuditResult());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });
  });

  // ---- updateBrief ----

  describe('updateBrief', () => {
    it('should update brief from PAID status', () => {
      const order = AuditOrder.create(mockProps({ status: AuditStatus.PAID }));
      const newBrief: TwinCrawlInput = {
        ...mockBrief(),
        outputFormat: 'structured_observations',
      };
      const result = order.updateBrief(newBrief);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.briefPayload.outputFormat).toBe('structured_observations');
        expect(result.value.status).toBe(AuditStatus.PAID);
      }
    });

    it('should return error from PENDING', () => {
      const order = AuditOrder.create(mockProps());
      const result = order.updateBrief(mockBrief());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });

    it('should return error from PROCESSING', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.PROCESSING }),
      );
      const result = order.updateBrief(mockBrief());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });
  });

  // ---- markFailed ----

  describe('markFailed', () => {
    it('should transition PROCESSING -> FAILED with reason', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.PROCESSING }),
      );
      const result = order.markFailed('Agent crashed');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status).toBe(AuditStatus.FAILED);
        expect(result.value.failureReason).toBe('Agent crashed');
        expect(result.value.failedAt).toEqual(
          new Date('2026-01-15T12:00:00Z'),
        );
      }
    });

    it('should transition PAID -> FAILED with reason', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.PAID }),
      );
      const result = order.markFailed('Brief assembly failed');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status).toBe(AuditStatus.FAILED);
        expect(result.value.failureReason).toBe('Brief assembly failed');
        expect(result.value.failedAt).toEqual(
          new Date('2026-01-15T12:00:00Z'),
        );
      }
    });

    it('should transition CRAWLING -> FAILED with reason', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.CRAWLING }),
      );
      const result = order.markFailed('Twin unreachable');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status).toBe(AuditStatus.FAILED);
        expect(result.value.failureReason).toBe('Twin unreachable');
      }
    });

    it('should return error from PENDING', () => {
      const order = AuditOrder.create(mockProps());
      const result = order.markFailed('Some reason');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });

    it('should return error from COMPLETED', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.COMPLETED }),
      );
      const result = order.markFailed('Some reason');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });
  });

  // ---- markTimeout ----

  describe('markTimeout', () => {
    it('should transition CRAWLING -> TIMEOUT', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.CRAWLING }),
      );
      const result = order.markTimeout();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status).toBe(AuditStatus.TIMEOUT);
        expect(result.value.failedAt).toEqual(
          new Date('2026-01-15T12:00:00Z'),
        );
      }
    });

    it('should transition PROCESSING -> TIMEOUT', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.PROCESSING }),
      );
      const result = order.markTimeout();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status).toBe(AuditStatus.TIMEOUT);
      }
    });

    it('should return error from COMPLETED', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.COMPLETED }),
      );
      const result = order.markTimeout();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });
  });

  // ---- markSchemaError ----

  describe('markSchemaError', () => {
    it('should transition PROCESSING -> SCHEMA_ERROR with raw result', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.PROCESSING }),
      );
      const rawResult = { malformed: true, data: 'unexpected structure' };
      const result = order.markSchemaError(rawResult);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status).toBe(AuditStatus.SCHEMA_ERROR);
        expect(result.value.rawResultPayload).toBe(rawResult);
        expect(result.value.failedAt).toEqual(
          new Date('2026-01-15T12:00:00Z'),
        );
      }
    });

    it('should return error from FAILED', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.FAILED }),
      );
      const result = order.markSchemaError({ bad: 'data' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });
  });

  // ---- Computed getters ----

  describe('computed getters', () => {
    it.each([
      AuditStatus.COMPLETED,
      AuditStatus.PARTIAL,
      AuditStatus.FAILED,
      AuditStatus.TIMEOUT,
      AuditStatus.SCHEMA_ERROR,
    ])('isTerminal should return true for %s', (status) => {
      const order = AuditOrder.create(mockProps({ status }));
      expect(order.isTerminal).toBe(true);
    });

    it.each([
      AuditStatus.PENDING,
      AuditStatus.PAID,
      AuditStatus.CRAWLING,
      AuditStatus.PROCESSING,
    ])('isTerminal should return false for %s', (status) => {
      const order = AuditOrder.create(mockProps({ status }));
      expect(order.isTerminal).toBe(false);
    });

    it('isCrawling should return true only for CRAWLING', () => {
      const crawlingOrder = AuditOrder.create(
        mockProps({ status: AuditStatus.CRAWLING }),
      );
      const pendingOrder = AuditOrder.create(mockProps());

      expect(crawlingOrder.isCrawling).toBe(true);
      expect(pendingOrder.isCrawling).toBe(false);
    });

    it('isProcessing should return true only for PROCESSING', () => {
      const processingOrder = AuditOrder.create(
        mockProps({ status: AuditStatus.PROCESSING }),
      );
      const pendingOrder = AuditOrder.create(mockProps());

      expect(processingOrder.isProcessing).toBe(true);
      expect(pendingOrder.isProcessing).toBe(false);
    });

    it('isTimedOut should return true when CRAWLING and timeoutAt is in the past', () => {
      vi.setSystemTime(new Date('2026-01-15T13:00:00Z'));
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.CRAWLING,
          timeoutAt: new Date('2026-01-15T12:15:00Z'),
        }),
      );
      expect(order.isTimedOut).toBe(true);
    });

    it('isTimedOut should return false when CRAWLING and timeoutAt is in the future', () => {
      vi.setSystemTime(new Date('2026-01-15T12:10:00Z'));
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.CRAWLING,
          timeoutAt: new Date('2026-01-15T12:15:00Z'),
        }),
      );
      expect(order.isTimedOut).toBe(false);
    });

    it('geoScore should extract from resultPayload when present', () => {
      const order = AuditOrder.create(
        mockProps({ resultPayload: mockAuditResult() }),
      );
      expect(order.geoScore).toBe(72);
    });

    it('geoScore should return null when resultPayload is null', () => {
      const order = AuditOrder.create(mockProps());
      expect(order.geoScore).toBeNull();
    });

    it('geoScore should prefer storedGeoScore over resultPayload', () => {
      const order = AuditOrder.create(
        mockProps({ storedGeoScore: 55, resultPayload: mockAuditResult() }),
      );
      expect(order.geoScore).toBe(55);
    });

    it('geoScore should fallback to resultPayload when storedGeoScore is null', () => {
      const order = AuditOrder.create(
        mockProps({ storedGeoScore: null, resultPayload: mockAuditResult() }),
      );
      expect(order.geoScore).toBe(72);
    });
  });

  // ---- toJSON ----

  describe('toJSON', () => {
    it('should exclude rawResultPayload from serialization', () => {
      const order = AuditOrder.create(
        mockProps({ rawResultPayload: { some: 'debug data' } }),
      );
      const json = order.toJSON();

      expect(json).not.toHaveProperty('rawResultPayload');
      expect(json.id).toBe('audit-123');
      expect(json.status).toBe(AuditStatus.PENDING);
    });
  });

  // ---- attachReport ----

  describe('attachReport', () => {
    it('should attach report on COMPLETED order', () => {
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.COMPLETED,
          resultPayload: mockAuditResult(),
        }),
      );
      const result = order.attachReport('audit-reports/audit-123.pdf');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.reportUrl).toBe('audit-reports/audit-123.pdf');
        expect(result.value.status).toBe(AuditStatus.COMPLETED);
        expect(result.value.updatedAt).toEqual(
          new Date('2026-01-15T12:00:00Z'),
        );
      }
    });

    it('should attach report on PARTIAL order', () => {
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.PARTIAL,
          resultPayload: mockAuditResult(),
        }),
      );
      const result = order.attachReport('audit-reports/audit-123.pdf');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.reportUrl).toBe('audit-reports/audit-123.pdf');
        expect(result.value.status).toBe(AuditStatus.PARTIAL);
      }
    });

    it('should return error from PENDING', () => {
      const order = AuditOrder.create(mockProps());
      const result = order.attachReport('audit-reports/audit-123.pdf');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
        expect(result.error.metadata?.currentStatus).toBe('PENDING');
      }
    });

    it('should return error from PROCESSING', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.PROCESSING }),
      );
      const result = order.attachReport('audit-reports/audit-123.pdf');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });

    it('should return error from FAILED', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.FAILED }),
      );
      const result = order.attachReport('audit-reports/audit-123.pdf');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });
  });

  // ---- storeAnalysisResults ----

  describe('storeAnalysisResults', () => {
    const mockMetadata = {
      analysisDataUrl: 'audits/audit-123/analysis.json',
      geoScore: 65,
      verdict: 'à renforcer' as const,
      topFindings: ['Good structure', 'Weak content', 'Missing FAQ'],
      actionCountCritical: 3,
      actionCountHigh: 5,
      actionCountMedium: 7,
      totalActions: 15,
      externalPresenceScore: 40,
    };

    it('should store metadata on ANALYZING order without changing status', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.ANALYZING }),
      );
      const result = order.storeAnalysisResults(mockMetadata);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status).toBe(AuditStatus.ANALYZING);
        expect(result.value.analysisDataUrl).toBe('audits/audit-123/analysis.json');
        expect(result.value.geoScore).toBe(65);
        expect(result.value.verdict).toBe('à renforcer');
        expect(result.value.topFindings).toEqual([
          'Good structure',
          'Weak content',
          'Missing FAQ',
        ]);
        expect(result.value.actionCountCritical).toBe(3);
        expect(result.value.actionCountHigh).toBe(5);
        expect(result.value.actionCountMedium).toBe(7);
        expect(result.value.totalActions).toBe(15);
        expect(result.value.externalPresenceScore).toBe(40);
        expect(result.value.completedAt).toBeNull();
      }
    });

    it('should return error from CRAWLING', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.CRAWLING }),
      );
      const result = order.storeAnalysisResults(mockMetadata);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });

    it('should return error from COMPLETED', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.COMPLETED }),
      );
      const result = order.storeAnalysisResults(mockMetadata);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });
  });

  // ---- markAnalysisCompleted ----

  describe('markAnalysisCompleted', () => {
    it('should transition ANALYZING -> COMPLETED with completedAt', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.ANALYZING }),
      );
      const result = order.markAnalysisCompleted();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status).toBe(AuditStatus.COMPLETED);
        expect(result.value.completedAt).toEqual(
          new Date('2026-01-15T12:00:00Z'),
        );
      }
    });

    it('should return error from CRAWLING', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.CRAWLING }),
      );
      const result = order.markAnalysisCompleted();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
        expect(result.error.metadata?.currentStatus).toBe('CRAWLING');
        expect(result.error.metadata?.targetStatus).toBe('COMPLETED');
      }
    });

    it('should return error from COMPLETED', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.COMPLETED }),
      );
      const result = order.markAnalysisCompleted();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });
  });

  // ---- markRefunded ----

  describe('markRefunded', () => {
    it('should mark a FAILED order with paymentIntent as refunded', () => {
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.FAILED,
          stripePaymentIntentId: 'pi_test_123',
        }),
      );
      const result = order.markRefunded('re_refund_123');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.refundId).toBe('re_refund_123');
        expect(result.value.refundedAt).toEqual(new Date('2026-01-15T12:00:00Z'));
        expect(result.value.isRefunded).toBe(true);
        expect(result.value.canBeRefunded).toBe(false);
        expect(result.value.status).toBe(AuditStatus.FAILED);
      }
    });

    it('should mark a TIMEOUT order as refunded', () => {
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.TIMEOUT,
          stripePaymentIntentId: 'pi_test_123',
        }),
      );
      const result = order.markRefunded('re_refund_456');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.refundId).toBe('re_refund_456');
        expect(result.value.isRefunded).toBe(true);
      }
    });

    it('should mark a SCHEMA_ERROR order as refunded', () => {
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.SCHEMA_ERROR,
          stripePaymentIntentId: 'pi_test_123',
        }),
      );
      const result = order.markRefunded('re_refund_789');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.refundId).toBe('re_refund_789');
        expect(result.value.isRefunded).toBe(true);
      }
    });

    it('should return error from COMPLETED', () => {
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.COMPLETED,
          stripePaymentIntentId: 'pi_test_123',
        }),
      );
      const result = order.markRefunded('re_refund_123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
        expect(result.error.metadata?.currentStatus).toBe('COMPLETED');
        expect(result.error.metadata?.targetStatus).toBe('REFUND');
      }
    });

    it('should return error from PARTIAL', () => {
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.PARTIAL,
          stripePaymentIntentId: 'pi_test_123',
        }),
      );
      const result = order.markRefunded('re_refund_123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });

    it('should return error when no stripePaymentIntentId', () => {
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.FAILED,
          stripePaymentIntentId: null,
        }),
      );
      const result = order.markRefunded('re_refund_123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });

    it('should return error when already refunded', () => {
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.FAILED,
          stripePaymentIntentId: 'pi_test_123',
          refundedAt: new Date('2026-01-15T11:00:00Z'),
          refundId: 're_existing',
        }),
      );
      const result = order.markRefunded('re_refund_123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditInvalidTransitionError);
      }
    });
  });

  // ---- canBeRefunded / isRefunded ----

  describe('canBeRefunded', () => {
    it.each([
      AuditStatus.FAILED,
      AuditStatus.TIMEOUT,
      AuditStatus.SCHEMA_ERROR,
    ])('should return true for %s with paymentIntent and no prior refund', (status) => {
      const order = AuditOrder.create(
        mockProps({ status, stripePaymentIntentId: 'pi_test' }),
      );
      expect(order.canBeRefunded).toBe(true);
    });

    it.each([
      AuditStatus.COMPLETED,
      AuditStatus.PARTIAL,
      AuditStatus.PENDING,
      AuditStatus.PAID,
      AuditStatus.CRAWLING,
      AuditStatus.PROCESSING,
    ])('should return false for %s', (status) => {
      const order = AuditOrder.create(
        mockProps({ status, stripePaymentIntentId: 'pi_test' }),
      );
      expect(order.canBeRefunded).toBe(false);
    });

    it('should return false when no stripePaymentIntentId', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.FAILED, stripePaymentIntentId: null }),
      );
      expect(order.canBeRefunded).toBe(false);
    });

    it('should return false when already refunded', () => {
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.FAILED,
          stripePaymentIntentId: 'pi_test',
          refundedAt: new Date(),
          refundId: 're_existing',
        }),
      );
      expect(order.canBeRefunded).toBe(false);
    });
  });

  describe('isRefunded', () => {
    it('should return true when refundedAt is set', () => {
      const order = AuditOrder.create(
        mockProps({
          refundedAt: new Date(),
          refundId: 're_test',
        }),
      );
      expect(order.isRefunded).toBe(true);
    });

    it('should return false when refundedAt is null', () => {
      const order = AuditOrder.create(mockProps());
      expect(order.isRefunded).toBe(false);
    });
  });

  // ---- Full lifecycle ----

  describe('full lifecycle', () => {
    it('should support PENDING -> PAID -> CRAWLING', () => {
      const order = AuditOrder.create(mockProps());

      const paid = order.markPaid('pi_123');
      expect(paid.ok).toBe(true);
      if (!paid.ok) return;

      const crawling = paid.value.markCrawling('agent-1');
      expect(crawling.ok).toBe(true);
      if (!crawling.ok) return;

      expect(crawling.value.status).toBe(AuditStatus.CRAWLING);
      expect(crawling.value.twinAgentId).toBe('agent-1');
      expect(crawling.value.isCrawling).toBe(true);
      expect(crawling.value.isTerminal).toBe(false);
    });

    it('should support CRAWLING -> FAILED on error', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.CRAWLING }),
      );
      const failed = order.markFailed('Twin agent unreachable');

      expect(failed.ok).toBe(true);
      if (!failed.ok) return;

      expect(failed.value.status).toBe(AuditStatus.FAILED);
      expect(failed.value.failureReason).toBe('Twin agent unreachable');
      expect(failed.value.isTerminal).toBe(true);
    });

    it('should support CRAWLING -> TIMEOUT on expiry', () => {
      vi.setSystemTime(new Date('2026-01-15T13:00:00Z'));
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.CRAWLING,
          timeoutAt: new Date('2026-01-15T12:15:00Z'),
        }),
      );

      expect(order.isTimedOut).toBe(true);

      const timeout = order.markTimeout();
      expect(timeout.ok).toBe(true);
      if (!timeout.ok) return;

      expect(timeout.value.status).toBe(AuditStatus.TIMEOUT);
      expect(timeout.value.isTerminal).toBe(true);
    });
  });
});

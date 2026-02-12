import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuditStatus } from '@coucou-ia/shared';
import type { AuditBrief, AuditResult } from '@coucou-ia/shared';

import { AuditOrder } from '../domain/entities/audit-order.entity';
import type { AuditOrderProps } from '../domain/entities/audit-order.entity';
import { AuditInvalidTransitionError } from '../domain/errors/audit.errors';

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
    callback: {
      url: 'https://api.test.com/webhooks/twin',
      auditId: 'audit-123',
    },
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
        startedAt: BASE_DATE,
        completedAt: BASE_DATE,
        failedAt: null,
        timeoutAt: null,
        failureReason: null,
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

  // ---- markProcessing ----

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
      const newBrief = { ...mockBrief(), mission: 'Updated mission' };
      const result = order.updateBrief(newBrief);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.briefPayload.mission).toBe('Updated mission');
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
    it('should transition PROCESSING -> TIMEOUT', () => {
      const order = AuditOrder.create(
        mockProps({ status: AuditStatus.PROCESSING }),
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

    it.each([AuditStatus.PENDING, AuditStatus.PAID, AuditStatus.PROCESSING])(
      'isTerminal should return false for %s',
      (status) => {
        const order = AuditOrder.create(mockProps({ status }));
        expect(order.isTerminal).toBe(false);
      },
    );

    it('isProcessing should return true only for PROCESSING', () => {
      const processingOrder = AuditOrder.create(
        mockProps({ status: AuditStatus.PROCESSING }),
      );
      const pendingOrder = AuditOrder.create(mockProps());

      expect(processingOrder.isProcessing).toBe(true);
      expect(pendingOrder.isProcessing).toBe(false);
    });

    it('isTimedOut should return true when PROCESSING and timeoutAt is in the past', () => {
      vi.setSystemTime(new Date('2026-01-15T13:00:00Z'));
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.PROCESSING,
          timeoutAt: new Date('2026-01-15T12:15:00Z'),
        }),
      );
      expect(order.isTimedOut).toBe(true);
    });

    it('isTimedOut should return false when PROCESSING and timeoutAt is in the future', () => {
      vi.setSystemTime(new Date('2026-01-15T12:10:00Z'));
      const order = AuditOrder.create(
        mockProps({
          status: AuditStatus.PROCESSING,
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

  // ---- Full lifecycle ----

  describe('full lifecycle', () => {
    it('should support PENDING -> PAID -> PROCESSING -> COMPLETED', () => {
      const order = AuditOrder.create(mockProps());

      const paid = order.markPaid('pi_123');
      expect(paid.ok).toBe(true);
      if (!paid.ok) return;

      const processing = paid.value.markProcessing('agent-1');
      expect(processing.ok).toBe(true);
      if (!processing.ok) return;

      const completed = processing.value.markCompleted(mockAuditResult());
      expect(completed.ok).toBe(true);
      if (!completed.ok) return;

      expect(completed.value.status).toBe(AuditStatus.COMPLETED);
      expect(completed.value.geoScore).toBe(72);
      expect(completed.value.isTerminal).toBe(true);
    });

    it('should support full lifecycle including PDF report', () => {
      const order = AuditOrder.create(mockProps());

      const paid = order.markPaid('pi_123');
      if (!paid.ok) return;

      const processing = paid.value.markProcessing('agent-1');
      if (!processing.ok) return;

      const completed = processing.value.markCompleted(mockAuditResult());
      if (!completed.ok) return;

      const withReport = completed.value.attachReport(
        'audit-reports/audit-123.pdf',
      );
      expect(withReport.ok).toBe(true);
      if (withReport.ok) {
        expect(withReport.value.reportUrl).toBe(
          'audit-reports/audit-123.pdf',
        );
        expect(withReport.value.status).toBe(AuditStatus.COMPLETED);
      }
    });
  });
});

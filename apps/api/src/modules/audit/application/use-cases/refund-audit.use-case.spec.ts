import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditStatus } from '@coucou-ia/shared';
import type { TwinCrawlInput } from '@coucou-ia/shared';

import { RefundAuditUseCase } from './refund-audit.use-case';
import { AuditOrder } from '../../domain/entities/audit-order.entity';
import type { AuditOrderRepository } from '../../domain/repositories/audit-order.repository';
import type { StripeService } from '../../../billing/infrastructure/stripe.service';
import type { LoggerService } from '../../../../common/logger';

function mockBrief(): TwinCrawlInput {
  return {
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
}

function createFailedOrder(overrides: Record<string, unknown> = {}): AuditOrder {
  return AuditOrder.create({
    id: 'audit-123',
    userId: 'user-456',
    projectId: 'project-789',
    status: AuditStatus.FAILED,
    stripePaymentIntentId: 'pi_test_123',
    amountCents: 4900,
    paidAt: new Date('2026-02-10T10:00:00Z'),
    briefPayload: mockBrief(),
    resultPayload: null,
    rawResultPayload: null,
    twinAgentId: 'agent-1',
    reportUrl: null,
    crawlDataUrl: null,
    analysisDataUrl: null,
    startedAt: new Date('2026-02-10T10:01:00Z'),
    completedAt: null,
    failedAt: new Date('2026-02-10T10:05:00Z'),
    timeoutAt: null,
    failureReason: 'Agent crashed',
    retryCount: 3,
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
    createdAt: new Date('2026-02-10T10:00:00Z'),
    updatedAt: new Date('2026-02-10T10:05:00Z'),
    ...overrides,
  });
}

describe('RefundAuditUseCase', () => {
  let useCase: RefundAuditUseCase;
  let mockRepository: {
    save: ReturnType<typeof vi.fn>;
  };
  let mockStripeService: {
    createRefund: ReturnType<typeof vi.fn>;
  };
  let mockLogger: {
    setContext: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-10T12:00:00Z'));

    mockRepository = {
      save: vi.fn().mockImplementation((order: AuditOrder) => Promise.resolve(order)),
    };

    mockStripeService = {
      createRefund: vi.fn().mockResolvedValue({
        id: 're_refund_123',
        status: 'succeeded',
        amount: 4900,
      }),
    };

    mockLogger = {
      setContext: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    useCase = new RefundAuditUseCase(
      mockRepository as unknown as AuditOrderRepository,
      mockStripeService as unknown as StripeService,
      mockLogger as unknown as LoggerService,
    );
  });

  it('should refund a FAILED audit with paymentIntent', async () => {
    const auditOrder = createFailedOrder();

    const result = await useCase.execute(auditOrder);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(mockStripeService.createRefund).toHaveBeenCalledWith('pi_test_123');
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        refundId: 're_refund_123',
        isRefunded: true,
      }),
    );
    expect(result.value.isRefunded).toBe(true);
    expect(result.value.refundId).toBe('re_refund_123');
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Stripe refund succeeded',
      expect.objectContaining({ refundId: 're_refund_123' }),
    );
  });

  it('should refund a TIMEOUT audit', async () => {
    const auditOrder = createFailedOrder({ status: AuditStatus.TIMEOUT });

    const result = await useCase.execute(auditOrder);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(mockStripeService.createRefund).toHaveBeenCalledWith('pi_test_123');
    expect(result.value.isRefunded).toBe(true);
  });

  it('should refund a SCHEMA_ERROR audit', async () => {
    const auditOrder = createFailedOrder({ status: AuditStatus.SCHEMA_ERROR });

    const result = await useCase.execute(auditOrder);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(mockStripeService.createRefund).toHaveBeenCalledWith('pi_test_123');
    expect(result.value.isRefunded).toBe(true);
  });

  it('should skip refund when no stripePaymentIntentId', async () => {
    const auditOrder = createFailedOrder({ stripePaymentIntentId: null });

    const result = await useCase.execute(auditOrder);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(mockStripeService.createRefund).not.toHaveBeenCalled();
    expect(mockRepository.save).not.toHaveBeenCalled();
    expect(result.value.isRefunded).toBe(false);
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Refund skipped: audit not eligible',
      expect.objectContaining({ hasPaymentIntent: false }),
    );
  });

  it('should skip refund when already refunded', async () => {
    const auditOrder = createFailedOrder({
      refundedAt: new Date('2026-02-10T11:00:00Z'),
      refundId: 're_existing',
    });

    const result = await useCase.execute(auditOrder);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(mockStripeService.createRefund).not.toHaveBeenCalled();
    expect(mockRepository.save).not.toHaveBeenCalled();
    expect(result.value.refundId).toBe('re_existing');
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Refund skipped: audit not eligible',
      expect.objectContaining({ isRefunded: true }),
    );
  });

  it('should skip refund for COMPLETED audit', async () => {
    const auditOrder = createFailedOrder({ status: AuditStatus.COMPLETED });

    const result = await useCase.execute(auditOrder);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(mockStripeService.createRefund).not.toHaveBeenCalled();
    expect(result.value.isRefunded).toBe(false);
  });

  it('should skip refund for PARTIAL audit', async () => {
    const auditOrder = createFailedOrder({ status: AuditStatus.PARTIAL });

    const result = await useCase.execute(auditOrder);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(mockStripeService.createRefund).not.toHaveBeenCalled();
    expect(result.value.isRefunded).toBe(false);
  });

  it('should catch Stripe error and return original entity', async () => {
    mockStripeService.createRefund.mockRejectedValue(
      new Error('Stripe API 500: Internal Server Error'),
    );
    const auditOrder = createFailedOrder();

    const result = await useCase.execute(auditOrder);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(mockStripeService.createRefund).toHaveBeenCalledWith('pi_test_123');
    expect(mockRepository.save).not.toHaveBeenCalled();
    expect(result.value.isRefunded).toBe(false);
    expect(result.value).toBe(auditOrder);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Stripe refund failed — continuing with failure flow',
      expect.any(Error),
      expect.objectContaining({ paymentIntentId: 'pi_test_123' }),
    );
  });
});

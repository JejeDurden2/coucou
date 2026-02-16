import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditStatus } from '@coucou-ia/shared';
import type { TwinCrawlInput, AuditAnalysis } from '@coucou-ia/shared';

import { AnalyzeWithMistralUseCase } from './analyze-with-mistral.use-case';
import { AuditOrder } from '../../domain/entities/audit-order.entity';
import { Result } from '../../../../common/utils/result';
import {
  AuditAnalysisError,
  AuditStorageError,
} from '../../domain/errors/audit.errors';
import type { AuditOrderRepository } from '../../domain/repositories/audit-order.repository';
import type { FileStoragePort } from '../../../storage/domain/ports/file-storage.port';
import type { AuditAnalyzerPort } from '../../domain/ports/audit-analyzer.port';
import type { AuditPdfQueueService } from '../../infrastructure/queue/audit-pdf-queue.service';
import type { AuditEmailNotificationService } from '../services/audit-email-notification.service';
import type { RefundAuditUseCase } from './refund-audit.use-case';
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

function mockAnalysis(): AuditAnalysis {
  return {
    executiveSummary: {
      headline: 'Test headline',
      context: 'Test context',
      keyFindings: ['Finding 1', 'Finding 2', 'Finding 3'],
      verdict: 'correcte',
    },
    geoScore: {
      overall: 65,
      structure: 70,
      content: 60,
      technical: 75,
      externalPresence: 55,
      structureExplanation: 'Good structure',
      contentExplanation: 'Decent content',
      technicalExplanation: 'Good technical',
      externalPresenceExplanation: 'Needs work',
    },
    siteAudit: {
      pages: [],
      globalFindings: [],
    },
    externalPresence: {
      score: 55,
      platforms: [],
      summary: 'Summary',
      gaps: ['Wikipedia'],
    },
    competitorBenchmark: {
      competitors: [],
      summary: 'Benchmark',
      keyGaps: [],
    },
    actionPlan: {
      quickWins: [
        {
          title: 'Add FAQ',
          description: 'Add FAQ schema',
          targetUrl: 'https://test.com',
          category: 'structure',
          impact: 4,
          effort: 2,
        },
      ],
      shortTerm: [
        {
          title: 'Content',
          description: 'Improve content',
          targetUrl: null,
          category: 'content',
          impact: 3,
          effort: 3,
        },
        {
          title: 'Content 2',
          description: 'More content',
          targetUrl: null,
          category: 'content',
          impact: 3,
          effort: 4,
        },
      ],
      mediumTerm: [],
      totalActions: 3,
    },
  } satisfies AuditAnalysis;
}

function createAnalyzingOrder(): AuditOrder {
  return AuditOrder.create({
    id: 'audit-123',
    userId: 'user-456',
    projectId: 'project-789',
    status: AuditStatus.ANALYZING,
    stripePaymentIntentId: 'pi_test',
    amountCents: 4900,
    paidAt: new Date('2026-02-10T10:00:00Z'),
    briefPayload: mockBrief(),
    twinAgentId: 'agent-1',
    reportUrl: null,
    crawlDataUrl: 'audits/audit-123/crawl-data.json',
    analysisDataUrl: null,
    startedAt: new Date('2026-02-10T10:01:00Z'),
    completedAt: null,
    failedAt: null,
    timeoutAt: new Date('2026-02-10T10:16:00Z'),
    failureReason: null,
    retryCount: 0,
    pagesAnalyzedClient: 5,
    pagesAnalyzedCompetitors: 10,
    competitorsAnalyzed: ['Competitor A'],
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
  });
}

describe('AnalyzeWithMistralUseCase', () => {
  let useCase: AnalyzeWithMistralUseCase;
  let mockRepository: {
    findById: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let mockFileStorage: {
    upload: ReturnType<typeof vi.fn>;
    download: ReturnType<typeof vi.fn>;
  };
  let mockAuditAnalyzer: {
    analyze: ReturnType<typeof vi.fn>;
  };
  let mockPdfQueueService: {
    addJob: ReturnType<typeof vi.fn>;
  };
  let mockEmailNotificationService: {
    notifyAuditFailed: ReturnType<typeof vi.fn>;
  };
  let mockRefundUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };
  let mockLogger: {
    setContext: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  const observations = {
    pages: [],
    technical: {
      hasSitemap: false,
      sitemapUrl: null,
      sitemapPageCount: null,
      hasRobotsTxt: false,
      robotsAllowsCrawling: true,
      loadTimeMs: null,
      ttfbMs: null,
    },
    external: {
      wikipedia: { found: false, url: null, articleLength: null, hasInfobox: null },
      trustpilot: { found: false, url: null, rating: null, reviewCount: null, claimed: null },
      googleBusiness: { found: false, rating: null, reviewCount: null },
      pagesJaunes: { found: false, url: null },
      societecom: { found: false, url: null },
      crunchbase: { found: false, url: null },
      linkedinCompany: { found: false, url: null, followerCount: null },
      pressMentions: { count: 0, sources: [] },
    },
    competitors: [],
    llmScanData: {
      clientCitationRate: 0,
      totalQueriesTested: 0,
      clientMentionsCount: 0,
      averageSentiment: 'neutral' as const,
      positionsWhenCited: [],
      topPerformingQueries: [],
      queriesNotCited: [],
    },
    qualitativeNotes: {
      mainStrengths: [],
      mainWeaknesses: [],
      quickWinSuggestions: [],
      strategicSuggestions: [],
    },
  };

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      save: vi.fn().mockImplementation((order: AuditOrder) => Promise.resolve(order)),
    };

    mockFileStorage = {
      upload: vi.fn().mockResolvedValue(Result.ok(undefined)),
      download: vi.fn().mockResolvedValue(
        Result.ok(Buffer.from(JSON.stringify(observations), 'utf-8')),
      ),
    };

    mockAuditAnalyzer = {
      analyze: vi.fn().mockResolvedValue(Result.ok(mockAnalysis())),
    };

    mockPdfQueueService = {
      addJob: vi.fn().mockResolvedValue(undefined),
    };

    mockEmailNotificationService = {
      notifyAuditFailed: vi.fn().mockResolvedValue(undefined),
    };

    mockRefundUseCase = {
      execute: vi.fn().mockImplementation((order: AuditOrder) => Promise.resolve(order)),
    };

    mockLogger = {
      setContext: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    useCase = new AnalyzeWithMistralUseCase(
      mockRepository as unknown as AuditOrderRepository,
      mockFileStorage as unknown as FileStoragePort,
      mockAuditAnalyzer as unknown as AuditAnalyzerPort,
      mockPdfQueueService as unknown as AuditPdfQueueService,
      mockEmailNotificationService as unknown as AuditEmailNotificationService,
      mockRefundUseCase as unknown as RefundAuditUseCase,
      mockLogger as unknown as LoggerService,
    );
  });

  it('should complete the full happy path', async () => {
    mockRepository.findById.mockResolvedValue(createAnalyzingOrder());

    const result = await useCase.execute({ auditOrderId: 'audit-123' });
    expect(result.ok).toBe(true);

    // 1. Download observations
    expect(mockFileStorage.download).toHaveBeenCalledWith(
      'audits/audit-123/crawl-data.json',
    );

    // 2. Call Mistral
    expect(mockAuditAnalyzer.analyze).toHaveBeenCalledWith(
      observations,
      {
        name: 'Test Brand',
        domain: 'test.com',
        businessType: 'SaaS',
        locality: 'France',
      },
    );

    // 3. Upload analysis
    expect(mockFileStorage.upload).toHaveBeenCalledWith(
      'audits/audit-123/analysis.json',
      expect.any(Buffer),
      'application/json',
    );

    // 4. Save to DB — stays ANALYZING with metadata stored
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: AuditStatus.ANALYZING,
      }),
    );

    const savedOrder = mockRepository.save.mock.calls[0][0] as AuditOrder;
    expect(savedOrder.geoScore).toBe(65);
    expect(savedOrder.verdict).toBe('correcte');
    expect(savedOrder.topFindings).toEqual([
      'Finding 1',
      'Finding 2',
      'Finding 3',
    ]);
    expect(savedOrder.actionCountCritical).toBe(1);
    expect(savedOrder.actionCountHigh).toBe(2);
    expect(savedOrder.actionCountMedium).toBe(0);
    expect(savedOrder.totalActions).toBe(3);
    expect(savedOrder.externalPresenceScore).toBe(55);

    // 5. Enqueue PDF (email is now sent by PDF job, not here)
    expect(mockPdfQueueService.addJob).toHaveBeenCalledWith({
      auditOrderId: 'audit-123',
    });
  });

  it('should skip when audit not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await useCase.execute({ auditOrderId: 'nonexistent' });

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'Audit not found for Mistral analysis',
      expect.objectContaining({ auditOrderId: 'nonexistent' }),
    );
    expect(mockAuditAnalyzer.analyze).not.toHaveBeenCalled();
  });

  it('should skip when audit is already terminal', async () => {
    const completedOrder = AuditOrder.create({
      ...createAnalyzingOrder().toJSON(),
      status: AuditStatus.COMPLETED,
      storedGeoScore: null,
    });
    mockRepository.findById.mockResolvedValue(completedOrder);

    await useCase.execute({ auditOrderId: 'audit-123' });

    expect(mockLogger.info).toHaveBeenCalledWith(
      'Mistral analysis skipped: audit already in terminal state',
      expect.objectContaining({ currentStatus: AuditStatus.COMPLETED }),
    );
    expect(mockAuditAnalyzer.analyze).not.toHaveBeenCalled();
  });

  it('should skip when audit is not in ANALYZING status', async () => {
    const crawlingOrder = AuditOrder.create({
      ...createAnalyzingOrder().toJSON(),
      status: AuditStatus.CRAWLING,
      storedGeoScore: null,
    });
    mockRepository.findById.mockResolvedValue(crawlingOrder);

    await useCase.execute({ auditOrderId: 'audit-123' });

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'Mistral analysis rejected: unexpected audit status',
      expect.objectContaining({ currentStatus: AuditStatus.CRAWLING }),
    );
    expect(mockAuditAnalyzer.analyze).not.toHaveBeenCalled();
  });

  it('should mark as failed and refund when crawlDataUrl is missing', async () => {
    const orderNoCrawlData = AuditOrder.create({
      ...createAnalyzingOrder().toJSON(),
      crawlDataUrl: null,
      status: AuditStatus.ANALYZING,
      storedGeoScore: null,
    });
    mockRepository.findById.mockResolvedValue(orderNoCrawlData);

    await useCase.execute({ auditOrderId: 'audit-123' });

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: AuditStatus.FAILED }),
    );
    expect(mockRefundUseCase.execute).toHaveBeenCalled();
    expect(mockEmailNotificationService.notifyAuditFailed).toHaveBeenCalled();
    expect(mockAuditAnalyzer.analyze).not.toHaveBeenCalled();
  });

  it('should return err when R2 download fails', async () => {
    mockRepository.findById.mockResolvedValue(createAnalyzingOrder());
    mockFileStorage.download.mockResolvedValue(
      Result.err(new AuditStorageError('download', 'R2 connection refused')),
    );

    const result = await useCase.execute({ auditOrderId: 'audit-123' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(AuditStorageError);
    }
  });

  it('should mark as failed and refund when observations JSON is invalid', async () => {
    mockRepository.findById.mockResolvedValue(createAnalyzingOrder());
    mockFileStorage.download.mockResolvedValue(
      Result.ok(Buffer.from('invalid json {{{', 'utf-8')),
    );

    await useCase.execute({ auditOrderId: 'audit-123' });

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: AuditStatus.FAILED }),
    );
    expect(mockRefundUseCase.execute).toHaveBeenCalled();
    expect(mockEmailNotificationService.notifyAuditFailed).toHaveBeenCalled();
  });

  it('should return err when Mistral analysis fails', async () => {
    mockRepository.findById.mockResolvedValue(createAnalyzingOrder());
    mockAuditAnalyzer.analyze.mockResolvedValue(
      Result.err(new AuditAnalysisError('Mistral API 500')),
    );

    const result = await useCase.execute({ auditOrderId: 'audit-123' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(AuditAnalysisError);
    }
  });

  it('should return err when R2 upload fails', async () => {
    mockRepository.findById.mockResolvedValue(createAnalyzingOrder());
    mockFileStorage.upload.mockResolvedValue(
      Result.err(new AuditStorageError('upload', 'Upload failed')),
    );

    const result = await useCase.execute({ auditOrderId: 'audit-123' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(AuditStorageError);
    }
  });
});

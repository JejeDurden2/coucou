import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ConfigService } from '@nestjs/config';

import { MistralAuditAnalyzerAdapter } from './mistral-audit-analyzer.adapter';
import type { LoggerService } from '../../../../common/logger';
import type { TwinObservations } from '@coucou-ia/shared';

const mockObservations = {
  pages: [],
  technical: {
    hasSitemap: true,
    sitemapUrl: 'https://test.com/sitemap.xml',
    sitemapPageCount: 10,
    hasRobotsTxt: true,
    robotsAllowsCrawling: true,
    loadTimeMs: 500,
    ttfbMs: 200,
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
    clientCitationRate: 0.3,
    totalQueriesTested: 10,
    clientMentionsCount: 3,
    averageSentiment: 'neutral' as const,
    positionsWhenCited: [2],
    topPerformingQueries: ['best seo tool'],
    queriesNotCited: ['seo audit'],
  },
  qualitativeNotes: {
    mainStrengths: [],
    mainWeaknesses: [],
    quickWinSuggestions: [],
    strategicSuggestions: [],
  },
} satisfies TwinObservations;

const mockBrandContext = {
  name: 'Test Brand',
  domain: 'test.com',
  businessType: 'SaaS',
  locality: 'France',
};

const validAnalysis = {
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
    summary: 'External presence summary',
    gaps: ['Wikipedia', 'Trustpilot'],
  },
  competitorBenchmark: {
    competitors: [],
    summary: 'Benchmark summary',
    keyGaps: [],
  },
  actionPlan: {
    quickWins: [],
    shortTerm: [],
    mediumTerm: [],
    totalActions: 0,
  },
};

describe('MistralAuditAnalyzerAdapter', () => {
  let adapter: MistralAuditAnalyzerAdapter;
  let mockConfigService: { get: ReturnType<typeof vi.fn> };
  let mockLogger: {
    setContext: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  const originalFetch = global.fetch;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'MISTRAL_AUDIT_MODEL') return 'mistral-medium-latest';
        if (key === 'MISTRAL_API_KEY') return 'test-api-key';
        return '';
      }),
    };

    mockLogger = {
      setContext: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    adapter = new MistralAuditAnalyzerAdapter(
      mockConfigService as unknown as ConfigService,
      mockLogger as unknown as LoggerService,
    );

    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should set logger context on construction', () => {
    expect(mockLogger.setContext).toHaveBeenCalledWith(
      'MistralAuditAnalyzerAdapter',
    );
  });

  describe('analyze', () => {
    it('should return valid AuditAnalysis on success', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(validAnalysis) } }],
          usage: {
            prompt_tokens: 1000,
            completion_tokens: 5000,
            total_tokens: 6000,
          },
        }),
      } as Response);

      const result = await adapter.analyze(mockObservations, mockBrandContext);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.geoScore.overall).toBe(65);
        expect(result.value.executiveSummary.verdict).toBe('correcte');
      }

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.mistral.ai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
          body: expect.stringContaining('mistral-medium-latest'),
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Mistral analysis completed',
        expect.objectContaining({
          model: 'mistral-medium-latest',
          tokensIn: 1000,
          tokensOut: 5000,
          tokensTotal: 6000,
        }),
      );
    });

    it('should return error on non-200 response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      } as Response);

      const result = await adapter.analyze(mockObservations, mockBrandContext);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('429');
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Mistral API error',
        expect.objectContaining({ status: 429 }),
      );
    });

    it('should return error on invalid Mistral response format', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'structure' }),
      } as Response);

      const result = await adapter.analyze(mockObservations, mockBrandContext);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Invalid Mistral response format');
      }
    });

    it('should return error on empty content', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: null } }],
        }),
      } as Response);

      const result = await adapter.analyze(mockObservations, mockBrandContext);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Empty response from Mistral');
      }
    });

    it('should return error on invalid JSON content', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'not valid json' } }],
        }),
      } as Response);

      const result = await adapter.analyze(mockObservations, mockBrandContext);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Invalid JSON');
      }
    });

    it('should return error on schema validation failure', async () => {
      const invalidAnalysis = {
        ...validAnalysis,
        geoScore: { overall: 200 }, // > 100, invalid
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            { message: { content: JSON.stringify(invalidAnalysis) } },
          ],
        }),
      } as Response);

      const result = await adapter.analyze(mockObservations, mockBrandContext);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Schema validation failed');
      }
    });

    it('should handle network errors', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(
        new Error('ECONNREFUSED'),
      );

      const result = await adapter.analyze(mockObservations, mockBrandContext);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('ECONNREFUSED');
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Mistral API call failed',
        expect.objectContaining({ error: 'ECONNREFUSED' }),
      );
    });

    it('should handle timeout errors', async () => {
      const abortError = new DOMException(
        'The operation was aborted',
        'AbortError',
      );
      vi.mocked(global.fetch).mockRejectedValueOnce(abortError);

      const result = await adapter.analyze(mockObservations, mockBrandContext);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('timeout');
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Mistral API timeout',
        expect.objectContaining({ timeoutMs: 120_000 }),
      );
    });

    it('should not log the full prompt or observations', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(validAnalysis) } }],
          usage: {
            prompt_tokens: 1000,
            completion_tokens: 5000,
            total_tokens: 6000,
          },
        }),
      } as Response);

      await adapter.analyze(mockObservations, mockBrandContext);

      for (const call of mockLogger.info.mock.calls) {
        const logData = call[1] as Record<string, unknown>;
        expect(logData).not.toHaveProperty('prompt');
        expect(logData).not.toHaveProperty('observations');
        expect(logData).not.toHaveProperty('content');
      }
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfigService } from '@nestjs/config';

import { BriefAssemblerService } from './brief-assembler.service';
import { AuditBriefAssemblyError } from '../../domain/errors/audit.errors';
import { Project } from '../../../project/domain/entities/project.entity';
import { Prompt } from '../../../prompt/domain/entities/prompt.entity';
import { Scan } from '../../../scan/domain/entities/scan.entity';
import { SentimentScan } from '../../../sentiment/domain/entities/sentiment-scan.entity';
import type { ProjectRepository } from '../../../project/domain/repositories/project.repository';
import type { PromptRepository } from '../../../prompt/domain/repositories/prompt.repository';
import type { ScanRepository } from '../../../scan/domain/repositories/scan.repository';
import type { SentimentScanRepository } from '../../../sentiment/domain/repositories/sentiment-scan.repository';
import type { LLMProvider } from '@prisma/client';

const NOW = new Date('2026-01-15T12:00:00Z');
const _THIRTY_DAYS_AGO = new Date('2025-12-16T12:00:00Z');

function mockProject(
  overrides: Partial<{
    id: string;
    brandName: string;
    domain: string;
    brandVariants: string[];
  }> = {},
): Project {
  return Project.from({
    id: overrides.id ?? 'project-123',
    userId: 'user-123',
    name: 'Test Project',
    brandName: overrides.brandName ?? 'TestBrand',
    brandVariants: overrides.brandVariants ?? ['TB', 'Test Brand'],
    domain: overrides.domain ?? 'testbrand.com',
    brandContext: {
      businessType: 'SaaS',
      locality: 'France',
      mainOfferings: ['SEO monitoring', 'GEO optimization'],
      targetAudience: 'Digital marketers',
      extractedAt: '2026-01-01T00:00:00Z',
    },
    lastScannedAt: null,
    lastAutoScanAt: null,
    nextAutoScanAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function mockPrompt(
  overrides: Partial<{
    id: string;
    content: string;
    category: string | null;
  }> = {},
): Prompt {
  return Prompt.from({
    id: overrides.id ?? 'prompt-1',
    projectId: 'project-123',
    content:
      overrides.content ?? 'Quel est le meilleur outil SEO pour les PME ?',
    category: overrides.category ?? 'discovery',
    isActive: true,
    lastScannedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function mockScan(
  overrides: Partial<{
    id: string;
    promptId: string;
    executedAt: Date;
    results: {
      provider: LLMProvider;
      model: string;
      rawResponse: string;
      isCited: boolean;
      position: number | null;
      brandKeywords: string[];
      queryKeywords: string[];
      competitorMentions: { name: string; position: number; keywords: string[] }[];
      latencyMs: number;
      parseSuccess: boolean;
    }[];
  }> = {},
): Scan {
  return Scan.create({
    id: overrides.id ?? 'scan-1',
    promptId: overrides.promptId ?? 'prompt-1',
    executedAt: overrides.executedAt ?? NOW,
    results: overrides.results ?? [
      {
        provider: 'GPT' as LLMProvider,
        model: 'gpt-4',
        rawResponse: '{}',
        isCited: true,
        position: 3,
        brandKeywords: ['SEO'],
        queryKeywords: ['outil SEO'],
        competitorMentions: [
          { name: 'Competitor A', position: 1, keywords: ['seo', 'tool'] },
        ],
        latencyMs: 500,
        parseSuccess: true,
      },
      {
        provider: 'CLAUDE' as LLMProvider,
        model: 'claude-3',
        rawResponse: '{}',
        isCited: false,
        position: null,
        brandKeywords: [],
        queryKeywords: ['outil SEO'],
        competitorMentions: [
          {
            name: 'Competitor A',
            position: 2,
            keywords: ['seo', 'monitoring'],
          },
          { name: 'Competitor B', position: 1, keywords: ['seo'] },
        ],
        latencyMs: 600,
        parseSuccess: true,
      },
    ],
    createdAt: NOW,
  });
}

describe('BriefAssemblerService', () => {
  let service: BriefAssemblerService;
  let mockProjectRepo: Partial<ProjectRepository>;
  let mockPromptRepo: Partial<PromptRepository>;
  let mockScanRepo: Partial<ScanRepository>;
  let mockSentimentRepo: Partial<SentimentScanRepository>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    mockProjectRepo = {
      findById: vi.fn().mockResolvedValue(mockProject()),
    };

    mockPromptRepo = {
      findActiveByProjectId: vi
        .fn()
        .mockResolvedValue([
          mockPrompt({ id: 'prompt-1', content: 'Prompt A' }),
          mockPrompt({
            id: 'prompt-2',
            content: 'Prompt B',
            category: 'comparison',
          }),
        ]),
    };

    mockScanRepo = {
      findByProjectIdInRange: vi.fn().mockResolvedValue([
        mockScan({ id: 'scan-1', promptId: 'prompt-1' }),
        mockScan({
          id: 'scan-2',
          promptId: 'prompt-2',
          results: [
            {
              provider: 'GPT' as LLMProvider,
              model: 'gpt-4',
              rawResponse: '{}',
              isCited: true,
              position: 1,
              brandKeywords: ['SEO'],
              queryKeywords: [],
              competitorMentions: [],
              latencyMs: 400,
              parseSuccess: true,
            },
            {
              provider: 'CLAUDE' as LLMProvider,
              model: 'claude-3',
              rawResponse: '{}',
              isCited: true,
              position: 2,
              brandKeywords: ['SEO'],
              queryKeywords: [],
              competitorMentions: [],
              latencyMs: 500,
              parseSuccess: true,
            },
          ],
        }),
      ]),
    };

    mockSentimentRepo = {
      findLatestByProjectId: vi.fn().mockResolvedValue(null),
    };

    mockConfigService = {
      get: vi.fn().mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'API_URL') return 'https://api.coucou-ia.com';
        if (key === 'TWIN_CALLBACK_SECRET') return 'secret-token-123';
        return defaultValue ?? '';
      }),
    };

    service = new BriefAssemblerService(
      mockProjectRepo as ProjectRepository,
      mockPromptRepo as PromptRepository,
      mockScanRepo as ScanRepository,
      mockSentimentRepo as SentimentScanRepository,
      mockConfigService as ConfigService,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('assemble', () => {
    it('should return error when project not found', async () => {
      vi.mocked(mockProjectRepo.findById!).mockResolvedValue(null);

      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditBriefAssemblyError);
        expect(result.error.message).toContain('Projet introuvable');
      }
    });

    it('should return error when no active prompts', async () => {
      vi.mocked(mockPromptRepo.findActiveByProjectId!).mockResolvedValue([]);

      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditBriefAssemblyError);
        expect(result.error.message).toContain('Aucun prompt actif');
      }
    });

    it('should assemble brief with correct brand info', async () => {
      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.brand.name).toBe('TestBrand');
      expect(result.value.brand.domain).toBe('testbrand.com');
      expect(result.value.brand.variants).toEqual(['TB', 'Test Brand']);
      expect(result.value.brand.context.businessType).toBe('SaaS');
      expect(result.value.brand.context.offerings).toBe(
        'SEO monitoring, GEO optimization',
      );
    });

    it('should sort promptResults by citation rate ascending', async () => {
      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const promptResults = result.value.scanData.promptResults;
      expect(promptResults.length).toBe(2);

      // prompt-1 has 1 cited out of 2 (50%), prompt-2 has 2 cited out of 2 (100%)
      // Worst first → prompt-1 (50%) before prompt-2 (100%)
      expect(promptResults[0].prompt).toBe('Prompt A');
      expect(promptResults[1].prompt).toBe('Prompt B');
    });

    it('should aggregate stats by provider', async () => {
      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const byProvider = result.value.scanData.byProvider;

      // GPT: 2 scans, both cited → rate = 1.0, positions = [3, 1] → avg = 2.0
      expect(byProvider['GPT']).toBeDefined();
      expect(byProvider['GPT'].citationRate).toBe(1);
      expect(byProvider['GPT'].avgPosition).toBe(2);

      // CLAUDE: 2 scans, 1 cited → rate = 0.5, positions = [2] → avg = 2.0
      expect(byProvider['CLAUDE']).toBeDefined();
      expect(byProvider['CLAUDE'].citationRate).toBe(0.5);
      expect(byProvider['CLAUDE'].avgPosition).toBe(2);
    });

    it('should identify top 3 competitors by citation rate', async () => {
      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const competitors = result.value.competitors.primary;
      expect(competitors.length).toBeLessThanOrEqual(3);

      // Competitor A appears in both scans → higher rate
      expect(competitors[0].name).toBe('Competitor A');
      expect(competitors[0].citationRate).toBeGreaterThan(0);
    });

    it('should calculate trend as stable when scans are similar', async () => {
      const earlyDate = new Date('2025-12-20T12:00:00Z');
      const recentDate = new Date('2026-01-10T12:00:00Z');

      // Both scans have 50% citation rate → stable
      const sameRateResults = [
        {
          provider: 'GPT' as LLMProvider,
          model: 'gpt-4',
          rawResponse: '{}',
          isCited: true,
          position: 2,
          brandKeywords: [],
          queryKeywords: [],
          competitorMentions: [],
          latencyMs: 500,
          parseSuccess: true,
        },
        {
          provider: 'CLAUDE' as LLMProvider,
          model: 'claude-3',
          rawResponse: '{}',
          isCited: false,
          position: null,
          brandKeywords: [],
          queryKeywords: [],
          competitorMentions: [],
          latencyMs: 500,
          parseSuccess: true,
        },
      ];

      vi.mocked(mockScanRepo.findByProjectIdInRange!).mockResolvedValue([
        mockScan({
          id: 'scan-early',
          promptId: 'prompt-1',
          executedAt: earlyDate,
          results: sameRateResults,
        }),
        mockScan({
          id: 'scan-recent',
          promptId: 'prompt-1',
          executedAt: recentDate,
          results: sameRateResults,
        }),
      ]);

      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.scanData.summary.trend).toBe('stable');
    });

    it('should calculate trend as improving when recent scans are better', async () => {
      const earlyDate = new Date('2025-12-20T12:00:00Z');
      const recentDate = new Date('2026-01-10T12:00:00Z');

      vi.mocked(mockScanRepo.findByProjectIdInRange!).mockResolvedValue([
        // Early scan: not cited
        mockScan({
          id: 'scan-early',
          promptId: 'prompt-1',
          executedAt: earlyDate,
          results: [
            {
              provider: 'GPT' as LLMProvider,
              model: 'gpt-4',
              rawResponse: '{}',
              isCited: false,
              position: null,
              brandKeywords: [],
              queryKeywords: [],
              competitorMentions: [],
              latencyMs: 500,
              parseSuccess: true,
            },
          ],
        }),
        // Recent scan: cited
        mockScan({
          id: 'scan-recent',
          promptId: 'prompt-1',
          executedAt: recentDate,
          results: [
            {
              provider: 'GPT' as LLMProvider,
              model: 'gpt-4',
              rawResponse: '{}',
              isCited: true,
              position: 1,
              brandKeywords: [],
              queryKeywords: [],
              competitorMentions: [],
              latencyMs: 500,
              parseSuccess: true,
            },
          ],
        }),
      ]);

      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.scanData.summary.trend).toBe('improving');
    });

    it('should calculate trend as declining when recent scans are worse', async () => {
      const earlyDate = new Date('2025-12-20T12:00:00Z');
      const recentDate = new Date('2026-01-10T12:00:00Z');

      vi.mocked(mockScanRepo.findByProjectIdInRange!).mockResolvedValue([
        // Early scan: cited
        mockScan({
          id: 'scan-early',
          promptId: 'prompt-1',
          executedAt: earlyDate,
          results: [
            {
              provider: 'GPT' as LLMProvider,
              model: 'gpt-4',
              rawResponse: '{}',
              isCited: true,
              position: 1,
              brandKeywords: [],
              queryKeywords: [],
              competitorMentions: [],
              latencyMs: 500,
              parseSuccess: true,
            },
          ],
        }),
        // Recent scan: not cited
        mockScan({
          id: 'scan-recent',
          promptId: 'prompt-1',
          executedAt: recentDate,
          results: [
            {
              provider: 'GPT' as LLMProvider,
              model: 'gpt-4',
              rawResponse: '{}',
              isCited: false,
              position: null,
              brandKeywords: [],
              queryKeywords: [],
              competitorMentions: [],
              latencyMs: 500,
              parseSuccess: true,
            },
          ],
        }),
      ]);

      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.scanData.summary.trend).toBe('declining');
    });

    it('should include sentiment data when available', async () => {
      vi.mocked(
        mockSentimentRepo.findLatestByProjectId!,
      ).mockResolvedValue(
        SentimentScan.create({
          id: 'sentiment-1',
          projectId: 'project-123',
          scannedAt: NOW,
          globalScore: 72,
          results: {
            gpt: {
              s: 75,
              t: [
                { name: 'Innovation', sentiment: 'positive', weight: 80 },
                { name: 'Support', sentiment: 'negative', weight: 40 },
              ],
              kp: ['innovative', 'fast'],
              kn: ['expensive', 'complex'],
            },
          },
          createdAt: NOW,
        }),
      );

      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const sentiment = result.value.scanData.sentiment;
      expect(sentiment.score).toBe(72);
      expect(sentiment.themes).toContain('Innovation');
      expect(sentiment.themes).toContain('Support');
      expect(sentiment.positiveTerms).toContain('innovative');
      expect(sentiment.negativeTerms).toContain('expensive');
    });

    it('should use fallback sentiment when none exists', async () => {
      vi.mocked(
        mockSentimentRepo.findLatestByProjectId!,
      ).mockResolvedValue(null);

      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const sentiment = result.value.scanData.sentiment;
      expect(sentiment.score).toBe(0);
      expect(sentiment.themes).toEqual([]);
      expect(sentiment.positiveTerms).toEqual([]);
      expect(sentiment.negativeTerms).toEqual([]);
    });

    it('should build callback with correct URL and auth header', async () => {
      const result = await service.assemble('project-123', 'audit-456');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.callback.url).toBe(
        'https://api.coucou-ia.com/webhooks/twin',
      );
      expect(result.value.callback.authHeader).toBe(
        'Bearer secret-token-123',
      );
      expect(result.value.callback.auditId).toBe('audit-456');
    });

    it('should set outputFormat with schema v1, all sections, fr language', async () => {
      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.outputFormat.schema).toBe('audit_result_v1');
      expect(result.value.outputFormat.sections).toEqual([
        'geo_score',
        'site_audit',
        'competitor_benchmark',
        'action_plan',
        'external_presence',
      ]);
      expect(result.value.outputFormat.language).toBe('fr');
    });

    it('should handle unexpected errors gracefully', async () => {
      vi.mocked(mockProjectRepo.findById!).mockRejectedValue(
        new Error('Database connection lost'),
      );

      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AuditBriefAssemblyError);
        expect(result.error.message).toContain('Database connection lost');
      }
    });
  });
});

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

    it('should assemble TwinCrawlInput with correct brand info', async () => {
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

    it('should compute scanData with correct citation metrics', async () => {
      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const { scanData } = result.value;

      // 4 total results: scan-1 has GPT(cited) + CLAUDE(not cited),
      // scan-2 has GPT(cited) + CLAUDE(cited) → 3 cited out of 4
      expect(scanData.clientCitationRate).toBe(0.75);
      expect(scanData.totalQueriesTested).toBe(2);
      expect(scanData.clientMentionsCount).toBe(3);
      expect(scanData.positionsWhenCited).toEqual(
        expect.arrayContaining([3, 1, 2]),
      );
    });

    it('should classify queries as top-performing or not-cited', async () => {
      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const { scanData } = result.value;

      // Both prompts have at least one cited result
      expect(scanData.topPerformingQueries).toContain('Prompt A');
      expect(scanData.topPerformingQueries).toContain('Prompt B');
      expect(scanData.queriesNotCited).toEqual([]);
    });

    it('should put uncited prompts in queriesNotCited', async () => {
      vi.mocked(mockScanRepo.findByProjectIdInRange!).mockResolvedValue([
        mockScan({
          id: 'scan-1',
          promptId: 'prompt-1',
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

      expect(result.value.scanData.queriesNotCited).toContain('Prompt A');
    });

    it('should identify top competitors by mention frequency', async () => {
      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const competitors = result.value.competitors.primary;
      expect(competitors.length).toBeLessThanOrEqual(3);

      // Competitor A appears in scan-1 (2 mentions across providers)
      expect(competitors[0].name).toBe('Competitor A');
    });

    it('should set maxPagesPerCompetitor to 3', async () => {
      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.competitors.maxPagesPerCompetitor).toBe(3);
    });

    it('should derive sentiment label from score', async () => {
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
              t: [{ name: 'Innovation', sentiment: 'positive', weight: 80 }],
              kp: ['innovative'],
              kn: ['expensive'],
            },
          },
          createdAt: NOW,
        }),
      );

      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.scanData.averageSentiment).toBe('positive');
    });

    it('should use neutral sentiment when no sentiment scan exists', async () => {
      vi.mocked(
        mockSentimentRepo.findLatestByProjectId!,
      ).mockResolvedValue(null);

      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      // Default score 50 → neutral
      expect(result.value.scanData.averageSentiment).toBe('neutral');
    });

    it('should derive negative sentiment for low scores', async () => {
      vi.mocked(
        mockSentimentRepo.findLatestByProjectId!,
      ).mockResolvedValue(
        SentimentScan.create({
          id: 'sentiment-1',
          projectId: 'project-123',
          scannedAt: NOW,
          globalScore: 20,
          results: {},
          createdAt: NOW,
        }),
      );

      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.scanData.averageSentiment).toBe('negative');
    });

    it('should derive mixed sentiment for intermediate scores', async () => {
      vi.mocked(
        mockSentimentRepo.findLatestByProjectId!,
      ).mockResolvedValue(
        SentimentScan.create({
          id: 'sentiment-1',
          projectId: 'project-123',
          scannedAt: NOW,
          globalScore: 35,
          results: {},
          createdAt: NOW,
        }),
      );

      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.scanData.averageSentiment).toBe('mixed');
    });

    it('should build callback with correct URL and auditId', async () => {
      const result = await service.assemble('project-123', 'audit-456');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.callback.url).toBe(
        'https://api.coucou-ia.com/webhooks/twin/crawl-complete',
      );
      expect(result.value.callback.auditId).toBe('audit-456');
    });

    it('should set outputFormat to structured_observations', async () => {
      const result = await service.assemble('project-123', 'audit-123');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.outputFormat).toBe('structured_observations');
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

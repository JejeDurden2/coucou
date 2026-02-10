import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Plan, LLMProvider } from '@prisma/client';

import { GetHistoricalStatsUseCase } from './get-historical-stats.use-case';
import { Project } from '../../../project/domain/entities/project.entity';
import { Scan, type LLMResult } from '../../../scan';
import { Prompt } from '../../../prompt';
import type { ProjectRepository } from '../../../project/domain/repositories/project.repository';
import type { PromptRepository } from '../../../prompt/domain/repositories/prompt.repository';
import type { ScanRepository } from '../../../scan/domain/repositories/scan.repository';

function createMockScan(promptId: string, executedAt: Date, results: LLMResult[]): Scan {
  return Scan.create({
    id: `scan-${Date.now()}-${Math.random()}`,
    promptId,
    executedAt,
    results,
    createdAt: executedAt,
  });
}

function createMockResult(
  model: string,
  isCited: boolean,
  position: number | null,
  competitorMentions: Array<{ name: string; position: number; keywords: string[] }> = [],
): LLMResult {
  return {
    provider: model.startsWith('gpt') ? LLMProvider.CHATGPT : LLMProvider.CLAUDE,
    model,
    rawResponse: 'mock response',
    isCited,
    position,
    brandKeywords: isCited ? ['brand'] : [],
    queryKeywords: ['query'],
    competitorMentions,
    latencyMs: 100,
    parseSuccess: true,
  };
}

function createMockPrompt(id: string, content: string, category: string | null = null): Prompt {
  return Prompt.from({
    id,
    projectId: 'project-123',
    content,
    category,
    isActive: true,
    lastScannedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('GetHistoricalStatsUseCase', () => {
  let useCase: GetHistoricalStatsUseCase;
  let mockProjectRepository: Partial<ProjectRepository>;
  let mockPromptRepository: Partial<PromptRepository>;
  let mockScanRepository: Partial<ScanRepository>;

  const mockProject = Project.from({
    id: 'project-123',
    userId: 'user-123',
    name: 'Test Project',
    brandName: 'Test Brand',
    brandVariants: [],
    domain: 'test.com',
    brandContext: null,
    lastScannedAt: null,
    lastAutoScanAt: null,
    nextAutoScanAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    mockProjectRepository = {
      findById: vi.fn().mockResolvedValue(mockProject),
    };

    mockPromptRepository = {
      findByProjectId: vi.fn().mockResolvedValue([]),
    };

    mockScanRepository = {
      findByProjectIdInRange: vi.fn().mockResolvedValue([]),
    };

    useCase = new GetHistoricalStatsUseCase(
      mockProjectRepository as ProjectRepository,
      mockPromptRepository as PromptRepository,
      mockScanRepository as ScanRepository,
    );
  });

  describe('execute', () => {
    it('should return null for FREE plan users', async () => {
      const result = await useCase.execute('project-123', 'user-123', Plan.FREE);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeNull();
      }
    });

    it('should return enriched stats for SOLO plan users', async () => {
      const now = new Date();
      const prompts = [createMockPrompt('prompt-1', 'test prompt', 'Découverte')];
      const scans = [
        createMockScan('prompt-1', now, [
          createMockResult('gpt-4o', true, 2, [
            { name: 'Competitor A', position: 1, keywords: [] },
          ]),
        ]),
      ];

      (mockPromptRepository.findByProjectId as any).mockResolvedValue(prompts);
      (mockScanRepository.findByProjectIdInRange as any).mockResolvedValue(scans);

      const result = await useCase.execute('project-123', 'user-123', Plan.SOLO);

      expect(result.ok).toBe(true);
      if (result.ok && result.value) {
        expect(result.value.summary).toBeDefined();
        expect(result.value.modelBreakdown).toBeDefined();
        expect(result.value.promptBreakdown).toBeDefined();
        expect(result.value.competitorRanking).toBeDefined();
        expect(result.value.insight).toBeDefined();
      }
    });
  });

  describe('generateInsight', () => {
    it('should return positive insight when variation > 10%', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const _sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Current period: 80% citation rate (4/5 cited)
      const currentScans = [
        createMockScan('prompt-1', new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 1),
        ]),
        createMockScan('prompt-1', new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 2),
        ]),
        createMockScan('prompt-1', new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 3),
        ]),
        createMockScan('prompt-1', new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 4),
        ]),
        createMockScan('prompt-1', new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', false, null),
        ]),
      ];

      // Previous period: 40% citation rate (2/5 cited)
      const previousScans = [
        createMockScan('prompt-1', new Date(thirtyDaysAgo.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 1),
        ]),
        createMockScan('prompt-1', new Date(thirtyDaysAgo.getTime() - 10 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 2),
        ]),
        createMockScan('prompt-1', new Date(thirtyDaysAgo.getTime() - 15 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', false, null),
        ]),
        createMockScan('prompt-1', new Date(thirtyDaysAgo.getTime() - 20 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', false, null),
        ]),
        createMockScan('prompt-1', new Date(thirtyDaysAgo.getTime() - 25 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', false, null),
        ]),
      ];

      (mockPromptRepository.findByProjectId as any).mockResolvedValue([
        createMockPrompt('prompt-1', 'test'),
      ]);
      (mockScanRepository.findByProjectIdInRange as any)
        .mockResolvedValueOnce(currentScans) // current period
        .mockResolvedValueOnce(previousScans); // previous period

      const result = await useCase.execute('project-123', 'user-123', Plan.PRO, thirtyDaysAgo, now);

      expect(result.ok).toBe(true);
      if (result.ok && result.value) {
        expect(result.value.insight.type).toBe('positive');
        expect(result.value.insight.message).toContain('augmenté');
      }
    });

    it('should return warning insight when variation < -10%', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Current period: 20% citation rate (1/5 cited)
      const currentScans = [
        createMockScan('prompt-1', new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 1),
        ]),
        createMockScan('prompt-1', new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', false, null),
        ]),
        createMockScan('prompt-1', new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', false, null),
        ]),
        createMockScan('prompt-1', new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', false, null),
        ]),
        createMockScan('prompt-1', new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', false, null),
        ]),
      ];

      // Previous period: 80% citation rate (4/5 cited)
      const previousScans = [
        createMockScan('prompt-1', new Date(thirtyDaysAgo.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 1),
        ]),
        createMockScan('prompt-1', new Date(thirtyDaysAgo.getTime() - 10 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 2),
        ]),
        createMockScan('prompt-1', new Date(thirtyDaysAgo.getTime() - 15 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 3),
        ]),
        createMockScan('prompt-1', new Date(thirtyDaysAgo.getTime() - 20 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 4),
        ]),
        createMockScan('prompt-1', new Date(thirtyDaysAgo.getTime() - 25 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', false, null),
        ]),
      ];

      (mockPromptRepository.findByProjectId as any).mockResolvedValue([
        createMockPrompt('prompt-1', 'test'),
      ]);
      (mockScanRepository.findByProjectIdInRange as any)
        .mockResolvedValueOnce(currentScans)
        .mockResolvedValueOnce(previousScans);

      const result = await useCase.execute('project-123', 'user-123', Plan.PRO, thirtyDaysAgo, now);

      expect(result.ok).toBe(true);
      if (result.ok && result.value) {
        expect(result.value.insight.type).toBe('warning');
        expect(result.value.insight.message).toContain('diminué');
        expect(result.value.insight.ctaType).toBe('recommendations');
      }
    });

    it('should return neutral insight when variation is between -10% and 10%', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Current period: 50% citation rate
      const currentScans = [
        createMockScan('prompt-1', new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 1),
        ]),
        createMockScan('prompt-1', new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', false, null),
        ]),
      ];

      // Previous period: 50% citation rate
      const previousScans = [
        createMockScan('prompt-1', new Date(thirtyDaysAgo.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 1),
        ]),
        createMockScan('prompt-1', new Date(thirtyDaysAgo.getTime() - 10 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', false, null),
        ]),
      ];

      (mockPromptRepository.findByProjectId as any).mockResolvedValue([
        createMockPrompt('prompt-1', 'test'),
      ]);
      (mockScanRepository.findByProjectIdInRange as any)
        .mockResolvedValueOnce(currentScans)
        .mockResolvedValueOnce(previousScans);

      const result = await useCase.execute('project-123', 'user-123', Plan.PRO, thirtyDaysAgo, now);

      expect(result.ok).toBe(true);
      if (result.ok && result.value) {
        expect(result.value.insight.type).toBe('neutral');
        expect(result.value.insight.message).toContain('stable');
      }
    });

    it('should return neutral insight when no previous data', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const currentScans = [
        createMockScan('prompt-1', new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 1),
        ]),
      ];

      (mockPromptRepository.findByProjectId as any).mockResolvedValue([
        createMockPrompt('prompt-1', 'test'),
      ]);
      (mockScanRepository.findByProjectIdInRange as any)
        .mockResolvedValueOnce(currentScans)
        .mockResolvedValueOnce([]); // No previous data

      const result = await useCase.execute('project-123', 'user-123', Plan.PRO, thirtyDaysAgo, now);

      expect(result.ok).toBe(true);
      if (result.ok && result.value) {
        expect(result.value.insight.type).toBe('neutral');
        expect(result.value.summary.citationRate.variation).toBeNull();
      }
    });
  });

  describe('calculateSummary', () => {
    it('should calculate all metrics with variations', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const currentScans = [
        createMockScan('prompt-1', new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 2, [
            { name: 'Competitor A', position: 1, keywords: [] },
            { name: 'Competitor B', position: 3, keywords: [] },
          ]),
        ]),
        createMockScan('prompt-1', new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 1, [
            { name: 'Competitor A', position: 2, keywords: [] },
          ]),
        ]),
      ];

      const previousScans = [
        createMockScan('prompt-1', new Date(thirtyDaysAgo.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 3, [
            { name: 'Competitor A', position: 1, keywords: [] },
          ]),
        ]),
      ];

      (mockPromptRepository.findByProjectId as any).mockResolvedValue([
        createMockPrompt('prompt-1', 'test'),
      ]);
      (mockScanRepository.findByProjectIdInRange as any)
        .mockResolvedValueOnce(currentScans)
        .mockResolvedValueOnce(previousScans);

      const result = await useCase.execute('project-123', 'user-123', Plan.PRO, thirtyDaysAgo, now);

      expect(result.ok).toBe(true);
      if (result.ok && result.value) {
        const summary = result.value.summary;

        // Citation rate: 100% current, 100% previous
        expect(summary.citationRate.current).toBe(100);
        expect(summary.citationRate.previous).toBe(100);

        // Total scans: 2 current, 1 previous
        expect(summary.totalScans.current).toBe(2);
        expect(summary.totalScans.previous).toBe(1);
        expect(summary.totalScans.variation).toBe(100); // +100%

        // Competitors count: 2 current, 1 previous
        expect(summary.competitorsCount.current).toBe(2);
        expect(summary.competitorsCount.previous).toBe(1);
      }
    });
  });

  describe('calculateCompetitorRanking', () => {
    it('should calculate share of voice correctly', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // 3 mentions for A, 2 for B, 1 for C = 6 total
      // A: 50%, B: 33.3%, C: 16.7%
      const currentScans = [
        createMockScan('prompt-1', new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 2, [
            { name: 'Competitor A', position: 1, keywords: [] },
            { name: 'Competitor B', position: 3, keywords: [] },
          ]),
        ]),
        createMockScan('prompt-1', new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 1, [
            { name: 'Competitor A', position: 2, keywords: [] },
            { name: 'Competitor B', position: 4, keywords: [] },
            { name: 'Competitor C', position: 5, keywords: [] },
          ]),
        ]),
        createMockScan('prompt-1', new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 1, [
            { name: 'Competitor A', position: 3, keywords: [] },
          ]),
        ]),
      ];

      (mockPromptRepository.findByProjectId as any).mockResolvedValue([
        createMockPrompt('prompt-1', 'test'),
      ]);
      (mockScanRepository.findByProjectIdInRange as any)
        .mockResolvedValueOnce(currentScans)
        .mockResolvedValueOnce([]);

      const result = await useCase.execute('project-123', 'user-123', Plan.PRO, thirtyDaysAgo, now);

      expect(result.ok).toBe(true);
      if (result.ok && result.value) {
        const ranking = result.value.competitorRanking;

        expect(ranking.length).toBe(3);
        expect(ranking[0].name).toBe('Competitor A');
        expect(ranking[0].mentions).toBe(3);
        expect(ranking[0].shareOfVoice).toBe(50);

        expect(ranking[1].name).toBe('Competitor B');
        expect(ranking[1].mentions).toBe(2);
        expect(ranking[1].shareOfVoice).toBeCloseTo(33.3, 0);
      }
    });

    it('should limit to top 5 competitors', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const currentScans = [
        createMockScan('prompt-1', new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 2, [
            { name: 'A', position: 1, keywords: [] },
            { name: 'B', position: 2, keywords: [] },
            { name: 'C', position: 3, keywords: [] },
            { name: 'D', position: 4, keywords: [] },
            { name: 'E', position: 5, keywords: [] },
            { name: 'F', position: 6, keywords: [] },
            { name: 'G', position: 7, keywords: [] },
          ]),
        ]),
      ];

      (mockPromptRepository.findByProjectId as any).mockResolvedValue([
        createMockPrompt('prompt-1', 'test'),
      ]);
      (mockScanRepository.findByProjectIdInRange as any)
        .mockResolvedValueOnce(currentScans)
        .mockResolvedValueOnce([]);

      const result = await useCase.execute('project-123', 'user-123', Plan.PRO, thirtyDaysAgo, now);

      expect(result.ok).toBe(true);
      if (result.ok && result.value) {
        expect(result.value.competitorRanking.length).toBe(5);
      }
    });
  });

  describe('calculateModelBreakdown', () => {
    it('should group results by model with correct stats', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const currentScans = [
        createMockScan('prompt-1', new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 1),
          createMockResult('claude-sonnet-4-5', true, 2),
        ]),
        createMockScan('prompt-1', new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 2),
          createMockResult('claude-sonnet-4-5', false, null),
        ]),
      ];

      (mockPromptRepository.findByProjectId as any).mockResolvedValue([
        createMockPrompt('prompt-1', 'test'),
      ]);
      (mockScanRepository.findByProjectIdInRange as any)
        .mockResolvedValueOnce(currentScans)
        .mockResolvedValueOnce([]);

      const result = await useCase.execute('project-123', 'user-123', Plan.PRO, thirtyDaysAgo, now);

      expect(result.ok).toBe(true);
      if (result.ok && result.value) {
        const breakdown = result.value.modelBreakdown;

        // gpt-4o: 2/2 cited = 100%
        const gpt = breakdown.find((m) => m.model === 'gpt-4o');
        expect(gpt).toBeDefined();
        expect(gpt?.citationRate).toBe(100);
        expect(gpt?.scansCount).toBe(2);

        // claude-sonnet-4-5: 1/2 cited = 50%
        const claude = breakdown.find((m) => m.model === 'claude-sonnet-4-5');
        expect(claude).toBeDefined();
        expect(claude?.citationRate).toBe(50);
        expect(claude?.scansCount).toBe(2);
      }
    });
  });

  describe('calculatePromptBreakdown', () => {
    it('should group scans by prompt with correct stats', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const prompts = [
        createMockPrompt('prompt-1', 'First prompt', 'Découverte'),
        createMockPrompt('prompt-2', 'Second prompt', 'Comparaison'),
      ];

      const currentScans = [
        createMockScan('prompt-1', new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 1),
        ]),
        createMockScan('prompt-1', new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 2),
        ]),
        createMockScan('prompt-2', new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', false, null),
        ]),
      ];

      (mockPromptRepository.findByProjectId as any).mockResolvedValue(prompts);
      (mockScanRepository.findByProjectIdInRange as any)
        .mockResolvedValueOnce(currentScans)
        .mockResolvedValueOnce([]);

      const result = await useCase.execute('project-123', 'user-123', Plan.PRO, thirtyDaysAgo, now);

      expect(result.ok).toBe(true);
      if (result.ok && result.value) {
        const breakdown = result.value.promptBreakdown;

        expect(breakdown.length).toBe(2);

        // Sorted by citationRate desc
        expect(breakdown[0].promptId).toBe('prompt-1');
        expect(breakdown[0].promptText).toBe('First prompt');
        expect(breakdown[0].category).toBe('Découverte');
        expect(breakdown[0].citationRate).toBe(100);

        expect(breakdown[1].promptId).toBe('prompt-2');
        expect(breakdown[1].citationRate).toBe(0);
      }
    });
  });

  describe('plan limits for previous period', () => {
    it('should set variation to null when previous period is outside SOLO plan limits', async () => {
      const now = new Date();
      // 30 day period means previous period starts 60 days ago
      // SOLO plan only allows 30 days, so previous period should be inaccessible
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const currentScans = [
        createMockScan('prompt-1', new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), [
          createMockResult('gpt-4o', true, 1),
        ]),
      ];

      (mockPromptRepository.findByProjectId as any).mockResolvedValue([
        createMockPrompt('prompt-1', 'test'),
      ]);
      (mockScanRepository.findByProjectIdInRange as any)
        .mockResolvedValueOnce(currentScans)
        .mockResolvedValueOnce([]); // Empty because out of limit

      const result = await useCase.execute(
        'project-123',
        'user-123',
        Plan.SOLO,
        thirtyDaysAgo,
        now,
      );

      expect(result.ok).toBe(true);
      if (result.ok && result.value) {
        // SOLO plan limits previous period access, so variation should be null
        expect(result.value.summary.citationRate.previous).toBeNull();
        expect(result.value.summary.citationRate.variation).toBeNull();
      }
    });
  });
});

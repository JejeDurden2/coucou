import { Inject, Injectable } from '@nestjs/common';
import { LLMProvider } from '@prisma/client';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../../prompt';
import { SCAN_REPOSITORY, type ScanRepository, type LLMResult } from '../../../scan';
import type {
  CompetitorDto,
  CompetitorTrend,
  DashboardStatsDto,
  EnrichedCompetitorDto,
  PromptStatDto,
  ProviderBreakdownDto,
} from '../dto/dashboard.dto';

type GetDashboardStatsError = NotFoundError | ForbiddenError;

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(PROMPT_REPOSITORY)
    private readonly promptRepository: PromptRepository,
    @Inject(SCAN_REPOSITORY)
    private readonly scanRepository: ScanRepository,
  ) {}

  async execute(
    projectId: string,
    userId: string,
  ): Promise<Result<DashboardStatsDto, GetDashboardStatsError>> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }

    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('You do not have access to this project'));
    }

    const prompts = await this.promptRepository.findByProjectId(projectId);
    const scans = await this.scanRepository.findByProjectId(projectId, 200);

    // Calculate global score (% of scans where brand is cited by any LLM)
    const citedScans = scans.filter((s) => s.results.some((r) => r.isCited)).length;
    const globalScore = scans.length > 0 ? (citedScans / scans.length) * 100 : 0;

    // Calculate global average rank
    const allResults = scans.flatMap((s) => s.results);
    const averageRank = this.calculateAverageRank(allResults);

    // Calculate breakdown by provider
    const breakdown = this.calculateProviderBreakdown(allResults);

    // Calculate trend (last 7 days vs previous 7 days)
    const trend = this.calculateTrend(scans);

    // Aggregate competitors (simple version for backward compat)
    const topCompetitors = this.aggregateCompetitors(scans.flatMap((s) => s.results));

    // Aggregate enriched competitors with trends and provider breakdown
    const enrichedCompetitors = this.aggregateEnrichedCompetitors(scans);

    // Get per-prompt stats with latest scan results
    const promptStats = await this.getPromptStats(prompts, scans);

    const lastScan = scans.length > 0 ? scans[0] : null;

    return Result.ok({
      globalScore: Math.round(globalScore * 10) / 10,
      averageRank,
      breakdown,
      trend,
      topCompetitors,
      enrichedCompetitors,
      promptStats,
      totalScans: scans.length,
      lastScanAt: lastScan?.executedAt ?? null,
    });
  }

  private calculateAverageRank(results: LLMResult[]): number | null {
    const rankedResults = results.filter((r) => r.isCited && r.position !== null);
    if (rankedResults.length === 0) return null;

    const sum = rankedResults.reduce((acc, r) => acc + (r.position ?? 0), 0);
    return Math.round((sum / rankedResults.length) * 10) / 10;
  }

  private calculateProviderBreakdown(results: LLMResult[]): ProviderBreakdownDto[] {
    const providers = [LLMProvider.OPENAI, LLMProvider.ANTHROPIC];

    return providers.map((provider) => {
      const providerResults = results.filter((r) => r.provider === provider);
      const citedCount = providerResults.filter((r) => r.isCited).length;
      const citationRate =
        providerResults.length > 0 ? (citedCount / providerResults.length) * 100 : 0;
      const averageRank = this.calculateAverageRank(providerResults);

      return {
        provider,
        citationRate: Math.round(citationRate * 10) / 10,
        averageRank,
        totalScans: providerResults.length,
      };
    });
  }

  private calculateTrend(scans: Array<{ executedAt: Date; results: LLMResult[] }>): {
    current: number;
    previous: number;
    delta: number;
  } {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const currentPeriodScans = scans.filter((s) => s.executedAt >= sevenDaysAgo);
    const previousPeriodScans = scans.filter(
      (s) => s.executedAt >= fourteenDaysAgo && s.executedAt < sevenDaysAgo,
    );

    const currentRate = this.calculateCitationRate(currentPeriodScans);
    const previousRate = this.calculateCitationRate(previousPeriodScans);

    return {
      current: Math.round(currentRate * 10) / 10,
      previous: Math.round(previousRate * 10) / 10,
      delta: Math.round((currentRate - previousRate) * 10) / 10,
    };
  }

  private calculateCitationRate(scans: Array<{ results: LLMResult[] }>): number {
    if (scans.length === 0) return 0;
    const citedCount = scans.filter((s) => s.results.some((r) => r.isCited)).length;
    return (citedCount / scans.length) * 100;
  }

  private aggregateCompetitors(results: LLMResult[]): CompetitorDto[] {
    const competitorCounts = new Map<string, number>();

    for (const result of results) {
      for (const mention of result.competitorMentions) {
        const count = competitorCounts.get(mention.name) ?? 0;
        competitorCounts.set(mention.name, count + 1);
      }
    }

    return Array.from(competitorCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private aggregateEnrichedCompetitors(
    scans: Array<{ executedAt: Date; results: LLMResult[] }>,
  ): EnrichedCompetitorDto[] {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    interface CompetitorAggregation {
      name: string;
      totalMentions: number;
      positions: number[];
      openaiPositions: number[];
      anthropicPositions: number[];
      openaiMentions: number;
      anthropicMentions: number;
      allKeywords: string[];
      firstSeenAt: Date;
      lastSeenAt: Date;
      lastKeywords: string[];
      currentPeriodMentions: number;
      previousPeriodMentions: number;
    }

    const aggregations = new Map<string, CompetitorAggregation>();

    const updateAggregation = (
      name: string,
      scanDate: Date,
      provider: LLMProvider,
      position: number,
      keywords: string[],
      isCurrentPeriod: boolean,
      isPreviousPeriod: boolean,
    ): void => {
      const existing = aggregations.get(name);

      if (existing) {
        existing.totalMentions++;
        existing.positions.push(position);
        if (provider === LLMProvider.OPENAI) {
          existing.openaiPositions.push(position);
          existing.openaiMentions++;
        } else {
          existing.anthropicPositions.push(position);
          existing.anthropicMentions++;
        }
        existing.allKeywords.push(...keywords);
        if (scanDate < existing.firstSeenAt) existing.firstSeenAt = scanDate;
        if (scanDate > existing.lastSeenAt) {
          existing.lastSeenAt = scanDate;
          existing.lastKeywords = keywords;
        }
        if (isCurrentPeriod) existing.currentPeriodMentions++;
        if (isPreviousPeriod) existing.previousPeriodMentions++;
      } else {
        aggregations.set(name, {
          name,
          totalMentions: 1,
          positions: [position],
          openaiPositions: provider === LLMProvider.OPENAI ? [position] : [],
          anthropicPositions: provider === LLMProvider.ANTHROPIC ? [position] : [],
          openaiMentions: provider === LLMProvider.OPENAI ? 1 : 0,
          anthropicMentions: provider === LLMProvider.ANTHROPIC ? 1 : 0,
          allKeywords: [...keywords],
          firstSeenAt: scanDate,
          lastSeenAt: scanDate,
          lastKeywords: keywords,
          currentPeriodMentions: isCurrentPeriod ? 1 : 0,
          previousPeriodMentions: isPreviousPeriod ? 1 : 0,
        });
      }
    };

    for (const scan of scans) {
      const isCurrentPeriod = scan.executedAt >= sevenDaysAgo;
      const isPreviousPeriod = scan.executedAt >= fourteenDaysAgo && scan.executedAt < sevenDaysAgo;

      for (const result of scan.results) {
        for (const mention of result.competitorMentions) {
          updateAggregation(
            mention.name,
            scan.executedAt,
            result.provider,
            mention.position,
            mention.keywords,
            isCurrentPeriod,
            isPreviousPeriod,
          );
        }
      }
    }

    return Array.from(aggregations.values())
      .map((agg): EnrichedCompetitorDto => {
        const averagePosition =
          agg.positions.length > 0
            ? Math.round((agg.positions.reduce((a, b) => a + b, 0) / agg.positions.length) * 10) /
              10
            : null;

        const openaiAvgPosition =
          agg.openaiPositions.length > 0
            ? Math.round(
                (agg.openaiPositions.reduce((a, b) => a + b, 0) / agg.openaiPositions.length) * 10,
              ) / 10
            : null;

        const anthropicAvgPosition =
          agg.anthropicPositions.length > 0
            ? Math.round(
                (agg.anthropicPositions.reduce((a, b) => a + b, 0) /
                  agg.anthropicPositions.length) *
                  10,
              ) / 10
            : null;

        const trend = this.calculateCompetitorTrend(
          agg.currentPeriodMentions,
          agg.previousPeriodMentions,
          agg.firstSeenAt,
          sevenDaysAgo,
        );

        const trendPercentage = this.calculateTrendPercentage(
          agg.currentPeriodMentions,
          agg.previousPeriodMentions,
        );

        // Aggregate keywords by frequency
        const keywordCounts = new Map<string, number>();
        for (const kw of agg.allKeywords) {
          keywordCounts.set(kw, (keywordCounts.get(kw) ?? 0) + 1);
        }
        const keywords = Array.from(keywordCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([kw]) => kw);

        return {
          name: agg.name,
          totalMentions: agg.totalMentions,
          averagePosition,
          statsByProvider: {
            openai: { mentions: agg.openaiMentions, averagePosition: openaiAvgPosition },
            anthropic: { mentions: agg.anthropicMentions, averagePosition: anthropicAvgPosition },
          },
          trend,
          trendPercentage,
          keywords,
          firstSeenAt: agg.firstSeenAt,
          lastSeenAt: agg.lastSeenAt,
          lastContext: agg.lastKeywords.join(', ') || null,
        };
      })
      .sort((a, b) => b.totalMentions - a.totalMentions)
      .slice(0, 10);
  }

  private calculateCompetitorTrend(
    currentMentions: number,
    previousMentions: number,
    firstSeenAt: Date,
    sevenDaysAgo: Date,
  ): CompetitorTrend {
    // New competitor (first seen in last 7 days)
    if (firstSeenAt >= sevenDaysAgo) {
      return 'new';
    }

    // No previous data to compare
    if (previousMentions === 0 && currentMentions === 0) {
      return 'stable';
    }

    // Was not mentioned before, now mentioned
    if (previousMentions === 0 && currentMentions > 0) {
      return 'up';
    }

    // Calculate percentage change
    const change = ((currentMentions - previousMentions) / previousMentions) * 100;

    if (change > 10) return 'up';
    if (change < -10) return 'down';
    return 'stable';
  }

  private calculateTrendPercentage(
    currentMentions: number,
    previousMentions: number,
  ): number | null {
    if (previousMentions === 0) {
      return currentMentions > 0 ? 100 : null;
    }
    return Math.round(((currentMentions - previousMentions) / previousMentions) * 100);
  }

  private async getPromptStats(
    prompts: Array<{ id: string; content: string; category: string | null }>,
    scans: Array<{ promptId: string; executedAt: Date; results: LLMResult[] }>,
  ): Promise<PromptStatDto[]> {
    return prompts.map((prompt) => {
      const promptScans = scans.filter((s) => s.promptId === prompt.id);
      const latestScan = promptScans[0];

      const openaiResult = latestScan?.results.find((r) => r.provider === LLMProvider.OPENAI);
      const anthropicResult = latestScan?.results.find((r) => r.provider === LLMProvider.ANTHROPIC);

      return {
        promptId: prompt.id,
        content: prompt.content,
        category: prompt.category,
        lastScanAt: latestScan?.executedAt ?? null,
        openai: openaiResult
          ? { isCited: openaiResult.isCited, position: openaiResult.position }
          : null,
        anthropic: anthropicResult
          ? { isCited: anthropicResult.isCited, position: anthropicResult.position }
          : null,
      };
    });
  }
}

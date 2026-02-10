import { Inject, Injectable } from '@nestjs/common';
import { Plan } from '@prisma/client';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import { PROMPT_REPOSITORY, type PromptRepository, type Prompt } from '../../../prompt';
import { SCAN_REPOSITORY, type ScanRepository, type LLMResult, type Scan } from '../../../scan';
import type {
  AggregationLevel,
  CompetitorTrendDto,
  HistoricalStatsDto,
  HistoricalStatsSummaryDto,
  HistoricalModelBreakdownDto,
  HistoricalPromptBreakdownDto,
  HistoricalCompetitorRankingDto,
  HistoricalInsightDto,
  SimpleTrendDto,
  TimeSeriesPointDto,
} from '../dto/dashboard.dto';

type GetHistoricalStatsError = NotFoundError | ForbiddenError;

const PLAN_STATS_RETENTION: Record<Plan, number | null> = {
  [Plan.FREE]: null, // No access
  [Plan.SOLO]: 30,
  [Plan.PRO]: null, // Unlimited
};

const TOP_COMPETITORS_LIMIT = 5;
const DEFAULT_RANK_FOR_NOT_CITED = 7;

// ─── Generic helpers ───────────────────────────────────────────

/** Group items into a Map by a key function */
function groupBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const arr = map.get(key) ?? [];
    arr.push(item);
    map.set(key, arr);
  }
  return map;
}

/** Compute a metric for current period + nullable previous period */
function withComparison<T>(
  currentScans: Scan[],
  previousScans: Scan[],
  fn: (scans: Scan[]) => T,
): { current: T; previous: T | null } {
  return {
    current: fn(currentScans),
    previous: previousScans.length > 0 ? fn(previousScans) : null,
  };
}

/** Count competitor mentions across scans → Map<name, count> */
function countCompetitorMentions(scans: Scan[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const scan of scans) {
    for (const result of scan.results) {
      for (const mention of result.competitorMentions) {
        counts.set(mention.name, (counts.get(mention.name) ?? 0) + 1);
      }
    }
  }
  return counts;
}

/** Average rank for a set of LLMResults (returns null if no citations) */
function computeAverageRankForResults(results: LLMResult[]): number | null {
  if (results.length === 0) return null;
  if (!results.some((r) => r.isCited && r.position !== null)) return null;

  const sum = results.reduce(
    (acc, r) => acc + (r.isCited && r.position !== null ? r.position : DEFAULT_RANK_FOR_NOT_CITED),
    0,
  );
  return Math.round((sum / results.length) * 10) / 10;
}

/** Citation rate as percentage for a set of scans */
function computeCitationRate(scans: Scan[]): number {
  if (scans.length === 0) return 0;
  const citedCount = scans.filter((s) => s.results.some((r) => r.isCited)).length;
  return Math.round((citedCount / scans.length) * 100 * 10) / 10;
}

/** Citation rate as percentage for a set of LLMResults */
function computeResultCitationRate(results: LLMResult[]): number {
  if (results.length === 0) return 0;
  const citedCount = results.filter((r) => r.isCited).length;
  return Math.round((citedCount / results.length) * 100 * 10) / 10;
}

// ───────────────────────────────────────────────────────────────

@Injectable()
export class GetHistoricalStatsUseCase {
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
    plan: Plan,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Result<HistoricalStatsDto | null, GetHistoricalStatsError>> {
    if (plan === Plan.FREE) {
      return Result.ok(null);
    }

    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }

    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('You do not have access to this project'));
    }

    // Calculate date range
    const now = new Date();
    const requestedEnd = endDate ?? now;
    const requestedStart = startDate ?? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Apply plan limits
    const maxDays = PLAN_STATS_RETENTION[plan];
    const isLimited = maxDays !== null;

    let effectiveStart = requestedStart;
    if (isLimited) {
      const minAllowedDate = new Date(now.getTime() - maxDays * 24 * 60 * 60 * 1000);
      if (effectiveStart < minAllowedDate) {
        effectiveStart = minAllowedDate;
      }
    }

    const effectiveEnd = requestedEnd > now ? now : requestedEnd;

    // Calculate previous period
    const duration = effectiveEnd.getTime() - effectiveStart.getTime();
    const previousStart = new Date(effectiveStart.getTime() - duration);
    const previousEnd = effectiveStart;

    // Check if previous period is within plan limits
    const minAllowedDate = isLimited
      ? new Date(now.getTime() - maxDays! * 24 * 60 * 60 * 1000)
      : null;
    const hasPreviousPeriod = !isLimited || previousStart >= minAllowedDate!;

    // Fetch scans and prompts in parallel
    const [currentScans, previousScans, prompts] = await Promise.all([
      this.scanRepository.findByProjectIdInRange(projectId, effectiveStart, effectiveEnd),
      hasPreviousPeriod
        ? this.scanRepository.findByProjectIdInRange(projectId, previousStart, previousEnd)
        : Promise.resolve([]),
      this.promptRepository.findByProjectId(projectId),
    ]);

    // Calculate aggregation level based on date range
    const daysDiff = Math.ceil(
      (effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24),
    );
    const aggregation = this.getAggregationLevel(daysDiff);

    // Calculate time series data
    const citationRate = this.calculateCitationRateSeries(
      currentScans,
      effectiveStart,
      effectiveEnd,
      aggregation,
    );
    const averageRank = this.calculateAverageRankSeries(
      currentScans,
      effectiveStart,
      effectiveEnd,
      aggregation,
    );
    const rankByModel = this.calculateRankByModelSeries(
      currentScans,
      effectiveStart,
      effectiveEnd,
      aggregation,
    );
    const competitorTrends = this.calculateCompetitorTrends(
      currentScans,
      effectiveStart,
      effectiveEnd,
      aggregation,
    );

    // Calculate enriched data
    const summary = this.calculateSummary(currentScans, previousScans);
    const modelBreakdown = this.calculateModelBreakdown(currentScans, previousScans);
    const promptBreakdown = this.calculatePromptBreakdown(currentScans, previousScans, prompts);
    const competitorRanking = this.calculateCompetitorRanking(currentScans, previousScans);
    const insight = this.generateInsight(
      summary.citationRate.variation,
      summary.citationRate.current,
    );

    return Result.ok({
      dateRange: {
        start: requestedStart.toISOString().split('T')[0],
        end: requestedEnd.toISOString().split('T')[0],
      },
      effectiveDateRange: {
        start: effectiveStart.toISOString().split('T')[0],
        end: effectiveEnd.toISOString().split('T')[0],
      },
      planLimit: { maxDays, isLimited },
      aggregation,
      citationRate,
      averageRank,
      rankByModel,
      competitorTrends,
      summary,
      modelBreakdown,
      promptBreakdown,
      competitorRanking,
      insight,
    });
  }

  private getAggregationLevel(days: number): AggregationLevel {
    if (days <= 90) return 'day';
    if (days <= 365) return 'week';
    return 'month';
  }

  private generateDateKeys(
    startDate: Date,
    endDate: Date,
    aggregation: AggregationLevel,
  ): string[] {
    const keys: string[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      keys.push(this.getDateKey(current, aggregation));

      if (aggregation === 'day') {
        current.setDate(current.getDate() + 1);
      } else if (aggregation === 'week') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }

    return [...new Set(keys)];
  }

  private getDateKey(date: Date, aggregation: AggregationLevel): string {
    const isoDate = date.toISOString().split('T')[0];

    if (aggregation === 'day') return isoDate;

    if (aggregation === 'week') {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      return d.toISOString().split('T')[0];
    }

    return `${isoDate.substring(0, 7)}-01`;
  }

  private groupScansByPeriod(
    scans: Array<{ executedAt: Date; results: LLMResult[] }>,
    aggregation: AggregationLevel,
  ): Map<string, Array<{ executedAt: Date; results: LLMResult[] }>> {
    return groupBy(scans, (scan) => this.getDateKey(scan.executedAt, aggregation));
  }

  private calculateCitationRateSeries(
    scans: Array<{ executedAt: Date; results: LLMResult[] }>,
    startDate: Date,
    endDate: Date,
    aggregation: AggregationLevel,
  ): TimeSeriesPointDto[] {
    const dateKeys = this.generateDateKeys(startDate, endDate, aggregation);
    const grouped = this.groupScansByPeriod(scans, aggregation);

    return dateKeys
      .map((date) => {
        const periodScans = grouped.get(date) ?? [];
        if (periodScans.length === 0) return null;

        const citedCount = periodScans.filter((s) => s.results.some((r) => r.isCited)).length;
        const rate = (citedCount / periodScans.length) * 100;

        return { date, value: Math.round(rate * 10) / 10 };
      })
      .filter((p): p is TimeSeriesPointDto => p !== null);
  }

  private calculateAverageRankSeries(
    scans: Array<{ executedAt: Date; results: LLMResult[] }>,
    startDate: Date,
    endDate: Date,
    aggregation: AggregationLevel,
  ): TimeSeriesPointDto[] {
    const dateKeys = this.generateDateKeys(startDate, endDate, aggregation);
    const grouped = this.groupScansByPeriod(scans, aggregation);

    return dateKeys
      .map((date) => {
        const periodScans = grouped.get(date) ?? [];
        if (periodScans.length === 0) return null;

        const avgRank = computeAverageRankForResults(periodScans.flatMap((s) => s.results));
        if (avgRank === null) return null;

        return { date, value: avgRank };
      })
      .filter((p): p is TimeSeriesPointDto => p !== null);
  }

  private calculateRankByModelSeries(
    scans: Array<{ executedAt: Date; results: LLMResult[] }>,
    startDate: Date,
    endDate: Date,
    aggregation: AggregationLevel,
  ): Record<string, TimeSeriesPointDto[]> {
    const dateKeys = this.generateDateKeys(startDate, endDate, aggregation);
    const grouped = this.groupScansByPeriod(scans, aggregation);

    const models = new Set(scans.flatMap((s) => s.results.map((r) => r.model)));
    const rankByModel: Record<string, TimeSeriesPointDto[]> = {};

    for (const model of models) {
      const series: TimeSeriesPointDto[] = [];

      for (const date of dateKeys) {
        const periodScans = grouped.get(date) ?? [];
        if (periodScans.length === 0) continue;

        const modelResults = periodScans.flatMap((s) => s.results).filter((r) => r.model === model);
        const avgRank = computeAverageRankForResults(modelResults);
        if (avgRank === null) continue;

        series.push({ date, value: avgRank });
      }

      if (series.length > 0) {
        rankByModel[model] = series;
      }
    }

    return rankByModel;
  }

  private calculateCompetitorTrends(
    scans: Array<{ executedAt: Date; results: LLMResult[] }>,
    startDate: Date,
    endDate: Date,
    aggregation: AggregationLevel,
  ): CompetitorTrendDto[] {
    const dateKeys = this.generateDateKeys(startDate, endDate, aggregation);
    const grouped = this.groupScansByPeriod(scans, aggregation);

    const totalMentions = countCompetitorMentions(scans as Scan[]);

    const topCompetitors = Array.from(totalMentions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_COMPETITORS_LIMIT)
      .map(([name]) => name);

    return topCompetitors.map((competitorName) => {
      const timeSeries: TimeSeriesPointDto[] = [];

      for (const date of dateKeys) {
        const periodScans = grouped.get(date) ?? [];
        let mentions = 0;

        for (const scan of periodScans) {
          for (const result of scan.results) {
            for (const mention of result.competitorMentions) {
              if (mention.name === competitorName) mentions++;
            }
          }
        }

        if (mentions > 0 || periodScans.length > 0) {
          timeSeries.push({ date, value: mentions });
        }
      }

      return { name: competitorName, timeSeries };
    });
  }

  private calculateVariation(current: number, previous: number | null): number | null {
    if (previous === null || previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  }

  private calculateTrend(current: number, previous: number | null): SimpleTrendDto {
    if (previous === null || previous === 0) return 'stable';
    const variation = ((current - previous) / previous) * 100;
    if (variation > 5) return 'up';
    if (variation < -5) return 'down';
    return 'stable';
  }

  private calculateSummary(currentScans: Scan[], previousScans: Scan[]): HistoricalStatsSummaryDto {
    const citation = withComparison(currentScans, previousScans, computeCitationRate);
    const rank = withComparison(currentScans, previousScans, (scans) =>
      computeAverageRankForResults(scans.flatMap((s) => s.results)) ?? 0,
    );
    const totalScans = withComparison(
      currentScans,
      previousScans,
      (scans) => scans.length,
    );
    const competitors = withComparison(currentScans, previousScans, (scans) =>
      countCompetitorMentions(scans).size,
    );

    return {
      citationRate: { ...citation, variation: this.calculateVariation(citation.current, citation.previous) },
      averageRank: { ...rank, variation: this.calculateVariation(rank.current, rank.previous) },
      totalScans: { ...totalScans, variation: this.calculateVariation(totalScans.current, totalScans.previous) },
      competitorsCount: { ...competitors, variation: this.calculateVariation(competitors.current, competitors.previous) },
    };
  }

  private calculateModelBreakdown(
    currentScans: Scan[],
    previousScans: Scan[],
  ): HistoricalModelBreakdownDto[] {
    const currentByModel = groupBy(currentScans.flatMap((s) => s.results), (r) => r.model);
    const previousByModel = groupBy(previousScans.flatMap((s) => s.results), (r) => r.model);

    const breakdown: HistoricalModelBreakdownDto[] = [];

    for (const [model, results] of currentByModel.entries()) {
      const citationRate = computeResultCitationRate(results);
      const averageRank = computeAverageRankForResults(results);

      const prevResults = previousByModel.get(model);
      const prevCitationRate = prevResults && prevResults.length > 0
        ? computeResultCitationRate(prevResults)
        : null;

      breakdown.push({
        model,
        provider: results[0].provider,
        citationRate,
        averageRank,
        trend: this.calculateTrend(citationRate, prevCitationRate),
        scansCount: results.length,
      });
    }

    return breakdown.sort((a, b) => b.citationRate - a.citationRate);
  }

  private calculatePromptBreakdown(
    currentScans: Scan[],
    previousScans: Scan[],
    prompts: Prompt[],
  ): HistoricalPromptBreakdownDto[] {
    const promptMap = new Map(prompts.map((p) => [p.id, p]));
    const currentByPrompt = groupBy(currentScans, (s) => s.promptId);
    const previousByPrompt = groupBy(previousScans, (s) => s.promptId);

    const breakdown: HistoricalPromptBreakdownDto[] = [];

    for (const [promptId, scans] of currentByPrompt.entries()) {
      const prompt = promptMap.get(promptId);
      if (!prompt) continue;

      const citationRate = computeCitationRate(scans);
      const averageRank = computeAverageRankForResults(scans.flatMap((s) => s.results));

      const prevScans = previousByPrompt.get(promptId);
      const prevCitationRate = prevScans && prevScans.length > 0
        ? computeCitationRate(prevScans)
        : null;

      breakdown.push({
        promptId,
        promptText: prompt.content,
        category: prompt.category,
        citationRate,
        averageRank,
        trend: this.calculateTrend(citationRate, prevCitationRate),
      });
    }

    return breakdown.sort((a, b) => b.citationRate - a.citationRate);
  }

  private calculateCompetitorRanking(
    currentScans: Scan[],
    previousScans: Scan[],
  ): HistoricalCompetitorRankingDto[] {
    const mentions = countCompetitorMentions(currentScans);
    const prevMentions = countCompetitorMentions(previousScans);

    let totalMentions = 0;
    for (const count of mentions.values()) totalMentions += count;

    const ranking: HistoricalCompetitorRankingDto[] = [];

    for (const [name, count] of mentions.entries()) {
      ranking.push({
        name,
        mentions: count,
        shareOfVoice:
          totalMentions > 0 ? Math.round((count / totalMentions) * 100 * 10) / 10 : 0,
        trend: this.calculateTrend(count, prevMentions.get(name) ?? null),
      });
    }

    return ranking.sort((a, b) => b.mentions - a.mentions).slice(0, TOP_COMPETITORS_LIMIT);
  }

  private generateInsight(
    citationVariation: number | null,
    _currentCitationRate: number,
  ): HistoricalInsightDto {
    if (citationVariation === null) {
      return {
        type: 'neutral',
        message: 'Pas assez de données pour comparer avec la période précédente',
      };
    }

    if (citationVariation > 10) {
      return {
        type: 'positive',
        message: `Votre visibilité a augmenté de ${Math.abs(citationVariation).toFixed(0)}% sur cette période`,
      };
    }

    if (citationVariation < -10) {
      return {
        type: 'warning',
        message: `Votre visibilité a diminué de ${Math.abs(citationVariation).toFixed(0)}%. Consultez nos recommandations.`,
        ctaType: 'recommendations',
      };
    }

    return {
      type: 'neutral',
      message: 'Votre visibilité est stable sur cette période',
    };
  }
}

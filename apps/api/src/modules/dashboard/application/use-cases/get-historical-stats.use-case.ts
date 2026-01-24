import { Inject, Injectable } from '@nestjs/common';
import { Plan } from '@prisma/client';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
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
    // FREE users cannot access stats
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

    // Calculate new enriched data
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
      planLimit: {
        maxDays,
        isLimited,
      },
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

    return [...new Set(keys)]; // Remove duplicates
  }

  private getDateKey(date: Date, aggregation: AggregationLevel): string {
    const isoDate = date.toISOString().split('T')[0];

    if (aggregation === 'day') {
      return isoDate;
    }

    if (aggregation === 'week') {
      // Get Monday of the week
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      return d.toISOString().split('T')[0];
    }

    // Month: YYYY-MM-01
    return `${isoDate.substring(0, 7)}-01`;
  }

  private groupScansByPeriod(
    scans: Array<{ executedAt: Date; results: LLMResult[] }>,
    aggregation: AggregationLevel,
  ): Map<string, Array<{ executedAt: Date; results: LLMResult[] }>> {
    const grouped = new Map<string, Array<{ executedAt: Date; results: LLMResult[] }>>();

    for (const scan of scans) {
      const key = this.getDateKey(scan.executedAt, aggregation);
      const existing = grouped.get(key) ?? [];
      existing.push(scan);
      grouped.set(key, existing);
    }

    return grouped;
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

        return {
          date,
          value: Math.round(rate * 10) / 10,
        };
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

        const allResults = periodScans.flatMap((s) => s.results);
        const hasCitation = allResults.some((r) => r.isCited && r.position !== null);
        if (!hasCitation) return null;

        const sum = allResults.reduce((acc, r) => {
          if (r.isCited && r.position !== null) {
            return acc + r.position;
          }
          return acc + DEFAULT_RANK_FOR_NOT_CITED;
        }, 0);

        return {
          date,
          value: Math.round((sum / allResults.length) * 10) / 10,
        };
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

    // Get all unique models
    const models = new Set<string>();
    for (const scan of scans) {
      for (const result of scan.results) {
        models.add(result.model);
      }
    }

    const rankByModel: Record<string, TimeSeriesPointDto[]> = {};

    for (const model of models) {
      const series: TimeSeriesPointDto[] = [];

      for (const date of dateKeys) {
        const periodScans = grouped.get(date) ?? [];
        if (periodScans.length === 0) continue;

        const modelResults = periodScans.flatMap((s) => s.results).filter((r) => r.model === model);
        if (modelResults.length === 0) continue;

        const hasCitation = modelResults.some((r) => r.isCited && r.position !== null);
        if (!hasCitation) continue;

        const sum = modelResults.reduce((acc, r) => {
          if (r.isCited && r.position !== null) {
            return acc + r.position;
          }
          return acc + DEFAULT_RANK_FOR_NOT_CITED;
        }, 0);

        series.push({
          date,
          value: Math.round((sum / modelResults.length) * 10) / 10,
        });
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

    // Count total mentions per competitor across all scans
    const totalMentions = new Map<string, number>();
    for (const scan of scans) {
      for (const result of scan.results) {
        for (const mention of result.competitorMentions) {
          const count = totalMentions.get(mention.name) ?? 0;
          totalMentions.set(mention.name, count + 1);
        }
      }
    }

    // Get top 5 competitors
    const topCompetitors = Array.from(totalMentions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_COMPETITORS_LIMIT)
      .map(([name]) => name);

    // Build time series for each top competitor
    return topCompetitors.map((competitorName) => {
      const timeSeries: TimeSeriesPointDto[] = [];

      for (const date of dateKeys) {
        const periodScans = grouped.get(date) ?? [];
        let mentions = 0;

        for (const scan of periodScans) {
          for (const result of scan.results) {
            for (const mention of result.competitorMentions) {
              if (mention.name === competitorName) {
                mentions++;
              }
            }
          }
        }

        if (mentions > 0 || periodScans.length > 0) {
          timeSeries.push({ date, value: mentions });
        }
      }

      return {
        name: competitorName,
        timeSeries,
      };
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
    // Citation rate
    const currentCitationRate = this.computeCitationRate(currentScans);
    const previousCitationRate =
      previousScans.length > 0 ? this.computeCitationRate(previousScans) : null;

    // Average rank
    const currentAvgRank = this.computeAverageRank(currentScans);
    const previousAvgRank =
      previousScans.length > 0 ? this.computeAverageRank(previousScans) : null;

    // Total scans
    const currentTotalScans = currentScans.length;
    const previousTotalScans = previousScans.length > 0 ? previousScans.length : null;

    // Competitors count
    const currentCompetitors = this.countUniqueCompetitors(currentScans);
    const previousCompetitors =
      previousScans.length > 0 ? this.countUniqueCompetitors(previousScans) : null;

    return {
      citationRate: {
        current: currentCitationRate,
        previous: previousCitationRate,
        variation: this.calculateVariation(currentCitationRate, previousCitationRate),
      },
      averageRank: {
        current: currentAvgRank ?? 0,
        previous: previousAvgRank,
        variation: this.calculateVariation(currentAvgRank ?? 0, previousAvgRank),
      },
      totalScans: {
        current: currentTotalScans,
        previous: previousTotalScans,
        variation: this.calculateVariation(currentTotalScans, previousTotalScans),
      },
      competitorsCount: {
        current: currentCompetitors,
        previous: previousCompetitors,
        variation: this.calculateVariation(currentCompetitors, previousCompetitors),
      },
    };
  }

  private computeCitationRate(scans: Scan[]): number {
    if (scans.length === 0) return 0;
    const citedCount = scans.filter((s) => s.results.some((r) => r.isCited)).length;
    return Math.round((citedCount / scans.length) * 100 * 10) / 10;
  }

  private computeAverageRank(scans: Scan[]): number | null {
    const allResults = scans.flatMap((s) => s.results);
    if (allResults.length === 0) return null;

    const hasCitation = allResults.some((r) => r.isCited && r.position !== null);
    if (!hasCitation) return null;

    const sum = allResults.reduce((acc, r) => {
      if (r.isCited && r.position !== null) {
        return acc + r.position;
      }
      return acc + DEFAULT_RANK_FOR_NOT_CITED;
    }, 0);

    return Math.round((sum / allResults.length) * 10) / 10;
  }

  private countUniqueCompetitors(scans: Scan[]): number {
    const competitors = new Set<string>();
    for (const scan of scans) {
      for (const result of scan.results) {
        for (const mention of result.competitorMentions) {
          competitors.add(mention.name);
        }
      }
    }
    return competitors.size;
  }

  private calculateModelBreakdown(
    currentScans: Scan[],
    previousScans: Scan[],
  ): HistoricalModelBreakdownDto[] {
    // Group by model for current period
    const modelMap = new Map<string, LLMResult[]>();
    for (const scan of currentScans) {
      for (const result of scan.results) {
        const existing = modelMap.get(result.model) ?? [];
        existing.push(result);
        modelMap.set(result.model, existing);
      }
    }

    // Group by model for previous period
    const prevModelMap = new Map<string, LLMResult[]>();
    for (const scan of previousScans) {
      for (const result of scan.results) {
        const existing = prevModelMap.get(result.model) ?? [];
        existing.push(result);
        prevModelMap.set(result.model, existing);
      }
    }

    const breakdown: HistoricalModelBreakdownDto[] = [];
    for (const [model, results] of modelMap.entries()) {
      const citedCount = results.filter((r) => r.isCited).length;
      const citationRate = Math.round((citedCount / results.length) * 100 * 10) / 10;

      // Calculate average rank
      const hasCitation = results.some((r) => r.isCited && r.position !== null);
      let averageRank: number | null = null;
      if (hasCitation) {
        const sum = results.reduce((acc, r) => {
          if (r.isCited && r.position !== null) return acc + r.position;
          return acc + DEFAULT_RANK_FOR_NOT_CITED;
        }, 0);
        averageRank = Math.round((sum / results.length) * 10) / 10;
      }

      // Calculate trend from previous period
      const prevResults = prevModelMap.get(model);
      let prevCitationRate: number | null = null;
      if (prevResults && prevResults.length > 0) {
        const prevCited = prevResults.filter((r) => r.isCited).length;
        prevCitationRate = (prevCited / prevResults.length) * 100;
      }

      breakdown.push({
        model,
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
    // Create a map of prompts by ID
    const promptMap = new Map(prompts.map((p) => [p.id, p]));

    // Group scans by promptId for current period
    const scansByPrompt = new Map<string, Scan[]>();
    for (const scan of currentScans) {
      const existing = scansByPrompt.get(scan.promptId) ?? [];
      existing.push(scan);
      scansByPrompt.set(scan.promptId, existing);
    }

    // Group scans by promptId for previous period
    const prevScansByPrompt = new Map<string, Scan[]>();
    for (const scan of previousScans) {
      const existing = prevScansByPrompt.get(scan.promptId) ?? [];
      existing.push(scan);
      prevScansByPrompt.set(scan.promptId, existing);
    }

    const breakdown: HistoricalPromptBreakdownDto[] = [];
    for (const [promptId, scans] of scansByPrompt.entries()) {
      const prompt = promptMap.get(promptId);
      if (!prompt) continue;

      const citationRate = this.computeCitationRate(scans);
      const averageRank = this.computeAverageRank(scans);

      // Calculate trend from previous period
      const prevScans = prevScansByPrompt.get(promptId);
      let prevCitationRate: number | null = null;
      if (prevScans && prevScans.length > 0) {
        prevCitationRate = this.computeCitationRate(prevScans);
      }

      breakdown.push({
        promptId,
        promptText: prompt.content,
        category: prompt.category,
        citationRate,
        averageRank,
        trend: this.calculateTrend(citationRate, prevCitationRate),
      });
    }

    // Sort by citationRate descending
    return breakdown.sort((a, b) => b.citationRate - a.citationRate);
  }

  private calculateCompetitorRanking(
    currentScans: Scan[],
    previousScans: Scan[],
  ): HistoricalCompetitorRankingDto[] {
    // Count mentions per competitor for current period
    const competitorMentions = new Map<string, number>();
    let totalMentions = 0;
    for (const scan of currentScans) {
      for (const result of scan.results) {
        for (const mention of result.competitorMentions) {
          const count = competitorMentions.get(mention.name) ?? 0;
          competitorMentions.set(mention.name, count + 1);
          totalMentions++;
        }
      }
    }

    // Count mentions per competitor for previous period
    const prevCompetitorMentions = new Map<string, number>();
    for (const scan of previousScans) {
      for (const result of scan.results) {
        for (const mention of result.competitorMentions) {
          const count = prevCompetitorMentions.get(mention.name) ?? 0;
          prevCompetitorMentions.set(mention.name, count + 1);
        }
      }
    }

    // Build ranking
    const ranking: HistoricalCompetitorRankingDto[] = [];
    for (const [name, mentions] of competitorMentions.entries()) {
      const shareOfVoice =
        totalMentions > 0 ? Math.round((mentions / totalMentions) * 100 * 10) / 10 : 0;

      const prevMentions = prevCompetitorMentions.get(name) ?? null;
      const trend = this.calculateTrend(mentions, prevMentions);

      ranking.push({
        name,
        mentions,
        shareOfVoice,
        trend,
      });
    }

    // Sort by mentions descending and take top 5
    return ranking.sort((a, b) => b.mentions - a.mentions).slice(0, TOP_COMPETITORS_LIMIT);
  }

  private generateInsight(
    citationVariation: number | null,
    currentCitationRate: number,
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

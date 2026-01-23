import { Inject, Injectable } from '@nestjs/common';
import { Plan } from '@prisma/client';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
import { SCAN_REPOSITORY, type ScanRepository, type LLMResult } from '../../../scan';
import type {
  AggregationLevel,
  CompetitorTrendDto,
  HistoricalStatsDto,
  TimeSeriesPointDto,
} from '../dto/dashboard.dto';

type GetHistoricalStatsError = NotFoundError | ForbiddenError;

const PLAN_STATS_RETENTION: Record<Plan, number | null> = {
  [Plan.FREE]: null, // No access
  [Plan.SOLO]: 30,
  [Plan.PRO]: null, // Unlimited
};

@Injectable()
export class GetHistoricalStatsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
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

    // Fetch scans in range
    const scans = await this.scanRepository.findByProjectIdInRange(
      projectId,
      effectiveStart,
      effectiveEnd,
    );

    // Calculate aggregation level based on date range
    const daysDiff = Math.ceil(
      (effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24),
    );
    const aggregation = this.getAggregationLevel(daysDiff);

    // Calculate time series data
    const citationRate = this.calculateCitationRateSeries(
      scans,
      effectiveStart,
      effectiveEnd,
      aggregation,
    );
    const averageRank = this.calculateAverageRankSeries(
      scans,
      effectiveStart,
      effectiveEnd,
      aggregation,
    );
    const rankByModel = this.calculateRankByModelSeries(
      scans,
      effectiveStart,
      effectiveEnd,
      aggregation,
    );
    const competitorTrends = this.calculateCompetitorTrends(
      scans,
      effectiveStart,
      effectiveEnd,
      aggregation,
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
    const DEFAULT_RANK_FOR_NOT_CITED = 7;
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
    const DEFAULT_RANK_FOR_NOT_CITED = 7;
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
      .slice(0, 5)
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
}

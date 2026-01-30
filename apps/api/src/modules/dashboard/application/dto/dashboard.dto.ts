import type { LLMProvider } from '@prisma/client';

export interface ProviderBreakdownDto {
  provider: LLMProvider;
  citationRate: number;
  averageRank: number | null;
  totalScans: number;
}

export interface ModelBreakdownDto {
  model: string;
  provider: LLMProvider;
  citationRate: number;
  averageRank: number | null;
  totalScans: number;
}

export interface ModelResultDto {
  model: string;
  provider: LLMProvider;
  isCited: boolean;
  position: number | null;
}

export interface TrendDto {
  current: number;
  previous: number;
  delta: number;
}

export type CompetitorTrend = 'up' | 'down' | 'stable' | 'new';

export interface CompetitorModelStatsDto {
  model: string;
  mentions: number;
  averagePosition: number | null;
}

export interface CompetitorDto {
  name: string;
  count: number;
}

export interface EnrichedCompetitorDto {
  name: string;
  totalMentions: number;
  averagePosition: number | null;
  previousAveragePosition: number | null;
  statsByModel: CompetitorModelStatsDto[];
  trend: CompetitorTrend;
  trendPercentage: number | null;
  keywords: string[];
  firstSeenAt: Date;
  lastSeenAt: Date;
  lastContext: string | null;
}

export interface PromptStatDto {
  promptId: string;
  content: string;
  category: string | null;
  lastScanAt: Date | null;
  modelResults: ModelResultDto[];
}

export interface TimeSeriesPointDto {
  date: string;
  value: number;
}

export interface TimeSeriesTrendsDto {
  citationRate: TimeSeriesPointDto[];
  averageRank: TimeSeriesPointDto[];
  mentionCount: TimeSeriesPointDto[];
}

export interface DashboardStatsDto {
  globalScore: number;
  averageRank: number | null;
  breakdown: ProviderBreakdownDto[];
  modelBreakdown: ModelBreakdownDto[];
  trend: TrendDto;
  trends: TimeSeriesTrendsDto;
  topCompetitors: CompetitorDto[];
  enrichedCompetitors: EnrichedCompetitorDto[];
  promptStats: PromptStatDto[];
  totalScans: number;
  lastScanAt: Date | null;
}

// Historical Stats DTOs

export type AggregationLevel = 'day' | 'week' | 'month';

export interface CompetitorTrendDto {
  name: string;
  timeSeries: TimeSeriesPointDto[];
}

export interface MetricWithVariationDto {
  current: number;
  previous: number | null;
  variation: number | null;
}

export interface HistoricalStatsSummaryDto {
  citationRate: MetricWithVariationDto;
  averageRank: MetricWithVariationDto;
  totalScans: MetricWithVariationDto;
  competitorsCount: MetricWithVariationDto;
}

export type SimpleTrendDto = 'up' | 'down' | 'stable';

export interface HistoricalModelBreakdownDto {
  model: string;
  provider: LLMProvider;
  citationRate: number;
  averageRank: number | null;
  trend: SimpleTrendDto;
  scansCount: number;
}

export interface HistoricalPromptBreakdownDto {
  promptId: string;
  promptText: string;
  category: string | null;
  citationRate: number;
  averageRank: number | null;
  trend: SimpleTrendDto;
}

export interface HistoricalCompetitorRankingDto {
  name: string;
  mentions: number;
  shareOfVoice: number;
  trend: SimpleTrendDto;
}

export type InsightTypeDto = 'positive' | 'warning' | 'neutral';

export interface HistoricalInsightDto {
  type: InsightTypeDto;
  message: string;
  ctaType?: 'recommendations' | 'prompts';
}

export interface HistoricalStatsDto {
  dateRange: { start: string; end: string };
  effectiveDateRange: { start: string; end: string };
  planLimit: { maxDays: number | null; isLimited: boolean };
  aggregation: AggregationLevel;
  citationRate: TimeSeriesPointDto[];
  averageRank: TimeSeriesPointDto[];
  rankByModel: Record<string, TimeSeriesPointDto[]>;
  competitorTrends: CompetitorTrendDto[];
  summary: HistoricalStatsSummaryDto;
  modelBreakdown: HistoricalModelBreakdownDto[];
  promptBreakdown: HistoricalPromptBreakdownDto[];
  competitorRanking: HistoricalCompetitorRankingDto[];
  insight: HistoricalInsightDto;
}

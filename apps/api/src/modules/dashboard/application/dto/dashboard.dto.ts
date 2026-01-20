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

export interface HistoricalStatsDto {
  dateRange: { start: string; end: string };
  effectiveDateRange: { start: string; end: string };
  planLimit: { maxDays: number | null; isLimited: boolean };
  aggregation: AggregationLevel;
  citationRate: TimeSeriesPointDto[];
  averageRank: TimeSeriesPointDto[];
  rankByModel: Record<string, TimeSeriesPointDto[]>;
  competitorTrends: CompetitorTrendDto[];
}

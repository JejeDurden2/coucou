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

export interface CompetitorProviderStats {
  mentions: number;
  averagePosition: number | null;
}

export interface CompetitorStatsByProvider {
  openai: CompetitorProviderStats;
  anthropic: CompetitorProviderStats;
}

export interface CompetitorDto {
  name: string;
  count: number;
}

export interface EnrichedCompetitorDto {
  name: string;
  totalMentions: number;
  averagePosition: number | null;
  statsByProvider: CompetitorStatsByProvider;
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

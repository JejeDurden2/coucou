import type { LLMProvider } from '@prisma/client';

export interface ProviderBreakdownDto {
  provider: LLMProvider;
  citationRate: number;
  averageRank: number | null;
  totalScans: number;
}

export interface TrendDto {
  current: number;
  previous: number;
  delta: number;
}

export type CompetitorTrend = 'up' | 'down' | 'stable' | 'new';

export interface CompetitorMentionsByProvider {
  openai: number;
  anthropic: number;
}

export interface CompetitorDto {
  name: string;
  count: number;
}

export interface EnrichedCompetitorDto {
  name: string;
  totalMentions: number;
  averagePosition: number | null;
  mentionsByProvider: CompetitorMentionsByProvider;
  trend: CompetitorTrend;
  trendPercentage: number | null;
  firstSeenAt: Date;
  lastSeenAt: Date;
  lastContext: string | null;
}

export interface PromptStatDto {
  promptId: string;
  content: string;
  category: string | null;
  lastScanAt: Date | null;
  openai: { isCited: boolean; position: number | null } | null;
  anthropic: { isCited: boolean; position: number | null } | null;
}

export interface DashboardStatsDto {
  globalScore: number;
  averageRank: number | null;
  breakdown: ProviderBreakdownDto[];
  trend: TrendDto;
  topCompetitors: CompetitorDto[];
  enrichedCompetitors: EnrichedCompetitorDto[];
  promptStats: PromptStatDto[];
  totalScans: number;
  lastScanAt: Date | null;
}

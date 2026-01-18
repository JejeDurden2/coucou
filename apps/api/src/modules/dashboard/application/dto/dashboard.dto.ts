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

export interface CompetitorDto {
  name: string;
  count: number;
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
  promptStats: PromptStatDto[];
  totalScans: number;
  lastScanAt: Date | null;
}

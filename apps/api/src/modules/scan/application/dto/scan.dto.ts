import type { LLMProvider } from '@prisma/client';

export interface CompetitorDto {
  name: string;
  position: number;
  keywords: string[];
}

export interface LLMResultDto {
  provider: LLMProvider;
  model: string;
  isCited: boolean;
  position: number | null;
  brandKeywords: string[];
  queryKeywords: string[];
  competitors: CompetitorDto[];
  latencyMs: number;
  parseSuccess: boolean;
}

export interface ProviderErrorDto {
  provider: string;
  error: string;
}

export interface ScanResponseDto {
  id: string;
  promptId: string;
  executedAt: Date;
  results: LLMResultDto[];
  isCitedByAny: boolean;
  citationRate: number;
  wasSanitized?: boolean;
  skippedReason?: string;
  providerErrors?: ProviderErrorDto[];
}

export interface ScanHistoryDto {
  scans: ScanResponseDto[];
  total: number;
}

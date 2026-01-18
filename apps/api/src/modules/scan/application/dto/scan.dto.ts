import type { LLMProvider } from '@prisma/client';

export interface LLMResultDto {
  provider: LLMProvider;
  model: string;
  isCited: boolean;
  citationContext: string | null;
  position: number | null;
  competitors: string[];
  latencyMs: number;
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

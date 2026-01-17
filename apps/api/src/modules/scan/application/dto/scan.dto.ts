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

export interface ScanResponseDto {
  id: string;
  promptId: string;
  executedAt: Date;
  results: LLMResultDto[];
  isCitedByAny: boolean;
  citationRate: number;
}

export interface ScanHistoryDto {
  scans: ScanResponseDto[];
  total: number;
}

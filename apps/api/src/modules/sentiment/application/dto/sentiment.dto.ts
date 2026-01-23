import type { SentimentScanResults } from '@coucou-ia/shared';

export interface SentimentScanDto {
  id: string;
  projectId: string;
  scannedAt: Date;
  globalScore: number;
  results: SentimentScanResults;
  createdAt: Date;
}

export interface LatestSentimentResponseDto {
  scan: SentimentScanDto | null;
  nextScanDate: Date;
}

export interface SentimentHistoryPointDto {
  date: Date;
  score: number;
}

export interface SentimentHistoryDto {
  scans: SentimentHistoryPointDto[];
}

import type { SentimentScanResults } from '@coucou-ia/shared';

import type { SentimentScan } from '../entities/sentiment-scan.entity';

export const SENTIMENT_SCAN_REPOSITORY = Symbol('SENTIMENT_SCAN_REPOSITORY');

export interface CreateSentimentScanData {
  projectId: string;
  scannedAt: Date;
  globalScore: number;
  results: SentimentScanResults;
}

export interface SentimentScanRepository {
  save(data: CreateSentimentScanData): Promise<SentimentScan>;
  findLatestByProjectId(projectId: string): Promise<SentimentScan | null>;
  findHistoryByProjectId(projectId: string, since: Date): Promise<SentimentScan[]>;
}

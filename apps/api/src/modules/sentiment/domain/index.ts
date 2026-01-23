export { SentimentScan } from './entities/sentiment-scan.entity';
export type { SentimentScanProps } from './entities/sentiment-scan.entity';
export { SENTIMENT_SCAN_REPOSITORY } from './repositories/sentiment-scan.repository';
export type {
  SentimentScanRepository,
  CreateSentimentScanData,
} from './repositories/sentiment-scan.repository';
export { SentimentParseError, AllSentimentProvidersFailedError } from './errors/sentiment.errors';
export type { SentimentProviderFailure } from './errors/sentiment.errors';

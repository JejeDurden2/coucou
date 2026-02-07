import type { SentimentResult } from '@coucou-ia/shared';

import type { Result } from '../../../../common';
import type { SentimentParseError } from '../../domain';

export const SENTIMENT_ANALYZER = Symbol('SENTIMENT_ANALYZER');

export interface SentimentAnalysisInput {
  brandName: string;
  brandVariants: string[];
  domain: string;
  brandContext: {
    businessType: string;
    targetAudience: string;
  } | null;
}

export interface SentimentAnalyzerPort {
  analyze(input: SentimentAnalysisInput): Promise<Result<SentimentResult, SentimentParseError>>;
}

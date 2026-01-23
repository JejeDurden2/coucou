import { DomainError } from '../../../../common';

export interface SentimentProviderFailure {
  provider: string;
  error: string;
}

export class SentimentParseError extends DomainError {
  readonly code = 'SENTIMENT_PARSE_ERROR';
  readonly statusCode = 500;

  constructor(provider: string, rawResponse: string) {
    super(`Failed to parse sentiment response from ${provider}`, {
      provider,
      rawResponse: rawResponse.substring(0, 200),
    });
  }
}

export class AllSentimentProvidersFailedError extends DomainError {
  readonly code = 'ALL_SENTIMENT_PROVIDERS_FAILED';
  readonly statusCode = 503;

  constructor(public readonly failures: SentimentProviderFailure[]) {
    super("Tous les fournisseurs LLM ont échoué pour l'analyse sentiment", {
      failures: failures.map((f) => ({ provider: f.provider, error: f.error })),
    });
  }
}

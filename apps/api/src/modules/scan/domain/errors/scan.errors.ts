import { DomainError } from '../../../../common';

export interface ProviderFailure {
  provider: string;
  error: string;
}

export class AllProvidersFailedError extends DomainError {
  readonly code = 'ALL_PROVIDERS_FAILED';
  readonly statusCode = 503;

  constructor(public readonly failures: ProviderFailure[]) {
    super('Tous les fournisseurs LLM ont échoué', {
      failures: failures.map((f) => ({ provider: f.provider, error: f.error })),
    });
  }
}

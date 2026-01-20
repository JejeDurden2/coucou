import { DomainError } from '../../../../common';

export class BrandContextExtractionError extends DomainError {
  readonly code = 'BRAND_CONTEXT_EXTRACTION_FAILED';
  readonly statusCode = 502;

  constructor(url: string) {
    super(`Impossible d'analyser le site ${url}`);
  }
}

export class PromptGenerationError extends DomainError {
  readonly code = 'PROMPT_GENERATION_FAILED';
  readonly statusCode = 502;

  constructor(reason: string) {
    super(`Échec de la génération des prompts: ${reason}`);
  }
}

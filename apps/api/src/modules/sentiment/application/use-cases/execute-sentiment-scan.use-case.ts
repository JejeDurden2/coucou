import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { z } from 'zod';
import type { SentimentResult, SentimentScanResults } from '@coucou-ia/shared';

import { ForbiddenError, NotFoundError, Result, withSpan } from '../../../../common';
import { LoggerService } from '../../../../common/logger';
import { AnthropicClientService } from '../../../../common/infrastructure/anthropic/anthropic-client.service';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import type { LLMQueryOptions, LLMResponse } from '../../../scan';
import {
  AllSentimentProvidersFailedError,
  SENTIMENT_SCAN_REPOSITORY,
  SentimentParseError,
  SentimentScan,
  type SentimentProviderFailure,
  type SentimentScanRepository,
} from '../../domain';
import { GPT52LLMAdapter } from '../../../scan/infrastructure/adapters/gpt52-llm.adapter';

const SentimentResultSchema = z.object({
  s: z.number().min(0).max(100),
  t: z.array(z.string()).min(1).max(10),
  kp: z.array(z.string()).min(1).max(10),
  kn: z.array(z.string()).min(1).max(10),
});

const SENTIMENT_SYSTEM_PROMPT = `Tu es un analyste senior en réputation de marque. Évalue la perception RÉELLE de la marque selon ces critères:

SCORING STRICT (évite les scores neutres 65-75):
- 85-100: Marque iconique, leader incontesté, forte communauté (Apple, Nike, Patagonia)
- 70-84: Bonne réputation, quelques critiques mineures
- 50-69: Perception mitigée, controverses ou problèmes connus
- 30-49: Réputation dégradée, scandales ou critiques majeures
- 0-29: Crise réputationnelle grave

FACTEURS À ANALYSER:
1. Notoriété et reconnaissance dans le domaine
2. Qualité perçue des produits/services
3. Controverses, scandales ou bad buzz récents
4. Engagement et satisfaction client
5. Position vs concurrents

IMPORTANT: Sois PRÉCIS et DIFFÉRENCIÉ. Utilise les résultats de ta recherche web pour étayer ton analyse.

Réponds uniquement en JSON valide, sans markdown, sans backticks, sans texte avant ou après.
Format JSON: {"s":score,"t":["theme1","theme2","theme3"],"kp":["positif1","positif2","positif3"],"kn":["negatif1","negatif2","negatif3"]}`;

type ExecuteSentimentScanError = NotFoundError | ForbiddenError | AllSentimentProvidersFailedError;

interface LLMQueryResult {
  provider: 'gpt' | 'claude';
  result?: SentimentResult;
  error?: string;
}

const CLAUDE_SENTIMENT_MODEL = 'claude-sonnet-4-5-20250929';

const SENTIMENT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    s: { type: 'number', minimum: 0, maximum: 100 },
    t: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 10 },
    kp: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 10 },
    kn: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 10 },
  },
  required: ['s', 't', 'kp', 'kn'],
  additionalProperties: false,
} as const;

@Injectable()
export class ExecuteSentimentScanUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SENTIMENT_SCAN_REPOSITORY)
    private readonly sentimentRepository: SentimentScanRepository,
    @Inject(forwardRef(() => GPT52LLMAdapter))
    private readonly gpt52Adapter: GPT52LLMAdapter,
    private readonly anthropicClient: AnthropicClientService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ExecuteSentimentScanUseCase.name);
  }

  async execute(
    projectId: string,
    userId: string,
  ): Promise<Result<SentimentScan, ExecuteSentimentScanError>> {
    return withSpan(
      'sentiment-module',
      'ExecuteSentimentScanUseCase.execute',
      { 'sentiment.projectId': projectId, 'sentiment.userId': userId },
      async () => {
        const project = await this.projectRepository.findById(projectId);

        if (!project) {
          return Result.err(new NotFoundError('Project', projectId));
        }

        if (!project.belongsTo(userId)) {
          return Result.err(new ForbiddenError("Vous n'avez pas accès à ce projet"));
        }

        const prompt = this.buildPrompt(
          project.brandName,
          project.brandVariants,
          project.domain,
          project.brandContext,
        );

        this.logger.info('Executing sentiment scan', { projectId });

        const gptOptions: LLMQueryOptions = {
          systemPrompt: SENTIMENT_SYSTEM_PROMPT,
        };

        const [gptResult, claudeResult] = await Promise.all([
          this.queryGptWithRetry(prompt, gptOptions),
          this.queryClaudeWithRetry(prompt),
        ]);

        const successes: LLMQueryResult[] = [gptResult, claudeResult].filter((r) => r.result);
        const failures: SentimentProviderFailure[] = [gptResult, claudeResult]
          .filter((r) => r.error)
          .map((r) => ({ provider: r.provider, error: r.error! }));

        if (successes.length === 0) {
          this.logger.error('All LLM providers failed for sentiment scan', { projectId, failures });
          return Result.err(new AllSentimentProvidersFailedError(failures));
        }

        if (failures.length > 0) {
          this.logger.warn('Partial LLM failures for sentiment scan', {
            projectId,
            failedProviders: failures.map((f) => f.provider),
          });
        }

        const globalScore = this.calculateGlobalScore(successes);
        const results = this.buildResults(gptResult, claudeResult);

        const scan = await this.sentimentRepository.save({
          projectId,
          scannedAt: new Date(),
          globalScore,
          results,
        });

        this.logger.info('Sentiment scan completed', { scanId: scan.id, projectId });

        return Result.ok(scan);
      },
    );
  }

  private buildPrompt(
    brandName: string,
    brandVariants: string[],
    domain: string,
    brandContext: { businessType: string; targetAudience: string } | null,
  ): string {
    const variantsStr =
      brandVariants.length > 0 ? ` (aussi connue comme: ${brandVariants.join(', ')})` : '';
    const contextStr = brandContext
      ? `\nContexte business: ${brandContext.businessType}, audience cible: ${brandContext.targetAudience}.`
      : '';

    return `Marque: "${brandName}"${variantsStr}
Domaine: ${domain}${contextStr}

Évalue cette marque selon:
1. Est-elle connue/reconnue dans son domaine? (si inconnue = score bas 40-55)
2. A-t-elle des controverses ou bad buzz connus?
3. Quelle est sa réputation qualité?
4. Comment se positionne-t-elle vs la concurrence?

JSON uniquement: {"s":score,"t":[themes],"kp":[positifs],"kn":[négatifs]}`;
  }

  private async queryGptWithRetry(
    prompt: string,
    options: LLMQueryOptions,
  ): Promise<LLMQueryResult> {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.gpt52Adapter.query(prompt, options);
        const parsed = this.parseGptResponse(response);
        return { provider: 'gpt', result: parsed };
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (error instanceof SentimentParseError && !isLastAttempt) {
          this.logger.warn('Parse error from gpt, retrying', { attempt, maxRetries });
          continue;
        }

        this.logger.error('GPT failed', { attempt, error: errorMessage });
        return { provider: 'gpt', error: errorMessage };
      }
    }

    return { provider: 'gpt', error: 'Max retries exceeded' };
  }

  private async queryClaudeWithRetry(prompt: string): Promise<LLMQueryResult> {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.anthropicClient.createMessage({
          model: CLAUDE_SENTIMENT_MODEL,
          maxTokens: 8196,
          temperature: 0,
          system: SENTIMENT_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
          webSearch: true,
          outputFormat: {
            type: 'json_schema',
            schema: SENTIMENT_JSON_SCHEMA,
          },
        });

        // With structured outputs, response.text is guaranteed valid JSON matching the schema
        const parsed: unknown = JSON.parse(response.text);
        const validated = SentimentResultSchema.safeParse(parsed);

        if (!validated.success) {
          throw new Error(`Schema validation failed: ${validated.error.message}`);
        }

        return { provider: 'claude', result: validated.data };
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (!isLastAttempt) {
          this.logger.warn('Parse/API error from claude, retrying', { attempt, maxRetries });
          await new Promise((r) => setTimeout(r, 5000));
          continue;
        }

        this.logger.error('Claude failed', { attempt, error: errorMessage });
        return { provider: 'claude', error: errorMessage };
      }
    }

    return { provider: 'claude', error: 'Max retries exceeded' };
  }

  private parseGptResponse(response: LLMResponse): SentimentResult {
    const content = response.content.trim();

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new SentimentParseError(response.provider, content);
    }

    try {
      const parsed: unknown = JSON.parse(jsonMatch[0]);
      const validated = SentimentResultSchema.safeParse(parsed);

      if (!validated.success) {
        throw new SentimentParseError(response.provider, content);
      }

      return validated.data;
    } catch (error) {
      if (error instanceof SentimentParseError) {
        throw error;
      }
      throw new SentimentParseError(response.provider, content);
    }
  }

  private calculateGlobalScore(successes: LLMQueryResult[]): number {
    const scores = successes.map((s) => s.result!.s);
    return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
  }

  private buildResults(
    gptResult: LLMQueryResult,
    claudeResult: LLMQueryResult,
  ): SentimentScanResults {
    const defaultResult: SentimentResult = { s: 0, t: [], kp: [], kn: [] };

    return {
      gpt: gptResult.result ?? defaultResult,
      claude: claudeResult.result ?? defaultResult,
    };
  }
}

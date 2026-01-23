import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { z } from 'zod';
import type { SentimentResult, SentimentScanResults } from '@coucou-ia/shared';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
import type { LLMPort, LLMQueryOptions, LLMResponse } from '../../../scan';
import {
  AllSentimentProvidersFailedError,
  SENTIMENT_SCAN_REPOSITORY,
  SentimentParseError,
  SentimentScan,
  type SentimentProviderFailure,
  type SentimentScanRepository,
} from '../../domain';
import { GPT52LLMAdapter } from '../../../scan/infrastructure/adapters/gpt52-llm.adapter';
import { ClaudeSonnetLLMAdapter } from '../../../scan/infrastructure/adapters/claude-sonnet-llm.adapter';

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

Réponds UNIQUEMENT en JSON minifié:
{"s":score,"t":["theme1","theme2","theme3"],"kp":["positif1","positif2","positif3"],"kn":["negatif1","negatif2","negatif3"]}

IMPORTANT: Sois PRÉCIS et DIFFÉRENCIÉ. Une marque inconnue ≠ 70%. Une startup récente = 40-55%. Un leader = 80+%.`;

type ExecuteSentimentScanError = NotFoundError | ForbiddenError | AllSentimentProvidersFailedError;

interface LLMQueryResult {
  provider: 'gpt' | 'claude';
  result?: SentimentResult;
  error?: string;
}

@Injectable()
export class ExecuteSentimentScanUseCase {
  private readonly logger = new Logger(ExecuteSentimentScanUseCase.name);

  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SENTIMENT_SCAN_REPOSITORY)
    private readonly sentimentRepository: SentimentScanRepository,
    @Inject(forwardRef(() => GPT52LLMAdapter))
    private readonly gpt52Adapter: GPT52LLMAdapter,
    @Inject(forwardRef(() => ClaudeSonnetLLMAdapter))
    private readonly claudeSonnetAdapter: ClaudeSonnetLLMAdapter,
  ) {}

  async execute(
    projectId: string,
    userId: string,
  ): Promise<Result<SentimentScan, ExecuteSentimentScanError>> {
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

    this.logger.log(`Executing sentiment scan for project ${projectId}`);

    const queryOptions: LLMQueryOptions = {
      systemPrompt: SENTIMENT_SYSTEM_PROMPT,
    };

    const [gptResult, claudeResult] = await Promise.all([
      this.queryWithRetry(this.gpt52Adapter, prompt, 'gpt', queryOptions),
      this.queryWithRetry(this.claudeSonnetAdapter, prompt, 'claude', queryOptions),
    ]);

    const successes: LLMQueryResult[] = [gptResult, claudeResult].filter((r) => r.result);
    const failures: SentimentProviderFailure[] = [gptResult, claudeResult]
      .filter((r) => r.error)
      .map((r) => ({ provider: r.provider, error: r.error! }));

    if (successes.length === 0) {
      this.logger.error(`All LLM providers failed for sentiment scan on project ${projectId}`);
      return Result.err(new AllSentimentProvidersFailedError(failures));
    }

    if (failures.length > 0) {
      this.logger.warn(
        `Partial LLM failures for sentiment scan: ${failures.map((f) => f.provider).join(', ')}`,
      );
    }

    const globalScore = this.calculateGlobalScore(successes);
    const results = this.buildResults(gptResult, claudeResult);

    const scan = await this.sentimentRepository.save({
      projectId,
      scannedAt: new Date(),
      globalScore,
      results,
    });

    this.logger.log(`Sentiment scan ${scan.id} completed for project ${projectId}`);

    return Result.ok(scan);
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

  private async queryWithRetry(
    adapter: LLMPort,
    prompt: string,
    provider: 'gpt' | 'claude',
    options?: LLMQueryOptions,
  ): Promise<LLMQueryResult> {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await adapter.query(prompt, options);
        const parsed = this.parseResponse(response);
        return { provider, result: parsed };
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (error instanceof SentimentParseError && !isLastAttempt) {
          this.logger.warn(
            `Parse error from ${provider}, retrying (attempt ${attempt}/${maxRetries})`,
          );
          continue;
        }

        this.logger.error(`${provider} failed after ${attempt} attempts: ${errorMessage}`);
        return { provider, error: errorMessage };
      }
    }

    return { provider, error: 'Max retries exceeded' };
  }

  private parseResponse(response: LLMResponse): SentimentResult {
    const content = response.content.trim();

    // Extract JSON from response (might be wrapped in markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new SentimentParseError(response.provider, content);
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);
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
    // Default empty result for failed providers
    const defaultResult: SentimentResult = { s: 0, t: [], kp: [], kn: [] };

    return {
      gpt: gptResult.result ?? defaultResult,
      claude: claudeResult.result ?? defaultResult,
    };
  }
}

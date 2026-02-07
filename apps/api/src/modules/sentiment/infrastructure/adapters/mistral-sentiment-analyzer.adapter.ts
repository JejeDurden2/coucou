import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import type { SentimentResult } from '@coucou-ia/shared';

import { Result } from '../../../../common';
import { LoggerService } from '../../../../common/logger';
import type { LLMPort } from '../../../scan/application/ports/llm.port';
import { SentimentParseError } from '../../domain';
import type {
  SentimentAnalyzerPort,
  SentimentAnalysisInput,
} from '../../application/ports/sentiment-analyzer.port';

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

IMPORTANT: Sois PRÉCIS et DIFFÉRENCIÉ. Ne donne pas un score neutre par défaut.

Réponds uniquement en JSON valide, sans markdown, sans backticks, sans texte avant ou après.
Format JSON: {"s":score,"t":["theme1","theme2","theme3"],"kp":["positif1","positif2","positif3"],"kn":["negatif1","negatif2","negatif3"]}`;

@Injectable()
export class MistralSentimentAnalyzer implements SentimentAnalyzerPort {
  constructor(
    private readonly mistralAdapter: LLMPort,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MistralSentimentAnalyzer.name);
  }

  async analyze(
    input: SentimentAnalysisInput,
  ): Promise<Result<SentimentResult, SentimentParseError>> {
    const prompt = this.buildPrompt(input);

    this.logger.info('Analyzing sentiment via Mistral', {
      brandName: input.brandName,
    });

    try {
      const response = await this.mistralAdapter.query(prompt, {
        systemPrompt: SENTIMENT_SYSTEM_PROMPT,
      });

      return this.parseResponse(response.content);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Mistral API call failed', {
        error: errorMessage,
        brandName: input.brandName,
      });
      return Result.err(new SentimentParseError('mistral', errorMessage));
    }
  }

  private buildPrompt(input: SentimentAnalysisInput): string {
    const variantsStr =
      input.brandVariants.length > 0
        ? ` (aussi connue comme: ${input.brandVariants.join(', ')})`
        : '';
    const contextStr = input.brandContext
      ? `\nContexte business: ${input.brandContext.businessType}, audience cible: ${input.brandContext.targetAudience}.`
      : '';

    return `Marque: "${input.brandName}"${variantsStr}
Domaine: ${input.domain}${contextStr}

Évalue cette marque selon:
1. Est-elle connue/reconnue dans son domaine? (si inconnue = score bas 40-55)
2. A-t-elle des controverses ou bad buzz connus?
3. Quelle est sa réputation qualité?
4. Comment se positionne-t-elle vs la concurrence?

JSON uniquement: {"s":score,"t":[themes],"kp":[positifs],"kn":[négatifs]}`;
  }

  private parseResponse(content: string): Result<SentimentResult, SentimentParseError> {
    const trimmed = content.trim();

    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      this.logger.warn('No JSON found in Mistral response', {
        responsePreview: trimmed.substring(0, 200),
      });
      return Result.err(new SentimentParseError('mistral', trimmed));
    }

    try {
      const parsed: unknown = JSON.parse(jsonMatch[0]);
      const validated = SentimentResultSchema.safeParse(parsed);

      if (!validated.success) {
        this.logger.warn('Zod validation failed for Mistral sentiment', {
          zodError: validated.error.message,
          responsePreview: trimmed.substring(0, 200),
        });
        return Result.err(new SentimentParseError('mistral', trimmed));
      }

      this.logger.info('Successfully parsed Mistral sentiment', { score: validated.data.s });
      return Result.ok(validated.data);
    } catch {
      this.logger.warn('JSON parse failed for Mistral sentiment', {
        responsePreview: trimmed.substring(0, 200),
      });
      return Result.err(new SentimentParseError('mistral', trimmed));
    }
  }
}

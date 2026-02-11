import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import type { SentimentResult, ThemeWithMetadata } from '@coucou-ia/shared';

import { Result } from '../../../../common';
import { LoggerService } from '../../../../common/logger';
import type { LLMPort } from '../../../scan/application/ports/llm.port';
import { SentimentParseError } from '../../domain';
import type {
  SentimentAnalyzerPort,
  SentimentAnalysisInput,
} from '../../application/ports/sentiment-analyzer.port';

const ThemeWithMetadataSchema = z.object({
  n: z.string().min(1),
  s: z.enum(['positive', 'negative', 'neutral']),
  w: z.number().min(0).max(100),
});

const SentimentResultSchema = z.object({
  s: z.number().min(0).max(100),
  t: z.array(ThemeWithMetadataSchema).min(1).max(10),
  kp: z.array(z.string()).min(1).max(10),
  kn: z.array(z.string()).min(1).max(10),
});

const SENTIMENT_SYSTEM_PROMPT = `Tu es un analyste senior en réputation de marque spécialisé sur le marché FRANÇAIS. Évalue la perception RÉELLE de la marque du point de vue des consommateurs français.

CONTEXTE GÉOGRAPHIQUE:
Tu évalues UNIQUEMENT la perception sur le marché français:
- Réputation et notoriété en France spécifiquement
- Avis et retours des clients français
- Positionnement vs les concurrents présents en France
- Controverses ou bad buzz dans la sphère francophone

SCORING STRICT (évite les scores neutres 65-75):
- 85-100: Marque iconique en France, leader incontesté, forte communauté (ex: Decathlon, Blablacar)
- 70-84: Bonne réputation en France, quelques critiques mineures
- 50-69: Perception mitigée auprès des Français, controverses ou problèmes connus
- 30-49: Réputation dégradée en France, scandales ou critiques majeures
- 0-29: Crise réputationnelle grave sur le marché français

FACTEURS À ANALYSER:
1. Notoriété et reconnaissance en France dans son domaine
2. Qualité perçue des produits/services par les clients français
3. Controverses, scandales ou bad buzz récents en France
4. Engagement et satisfaction des clients français
5. Position vs concurrents sur le marché français

THÈMES ENRICHIS:
Pour chaque thème, fournis:
- n: nom du thème (ex: "qualité", "prix", "support")
- s: sentiment ("positive", "negative", "neutral")
- w: poids d'importance 0-100 (basé sur la fréquence/prominence dans les mentions françaises)

IMPORTANT: Sois PRÉCIS et DIFFÉRENCIÉ. Ne donne pas un score neutre par défaut.

Réponds uniquement en JSON valide, sans markdown, sans backticks, sans texte avant ou après.
Format JSON: {"s":score,"t":[{"n":"theme1","s":"positive","w":85},{"n":"theme2","s":"negative","w":60}],"kp":["positif1","positif2"],"kn":["negatif1","negatif2"]}`;

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

    const contextParts: string[] = [];
    if (input.brandContext) {
      contextParts.push(
        `Contexte business: ${input.brandContext.businessType}, audience cible: ${input.brandContext.targetAudience}.`,
      );
      if (input.brandContext.mainOfferings.length > 0) {
        contextParts.push(`Offres principales: ${input.brandContext.mainOfferings.join(', ')}.`);
      }
      const locality = input.brandContext.locality ?? 'France (national)';
      contextParts.push(`Localité: ${locality}.`);
    }

    const contextStr = contextParts.length > 0 ? `\n${contextParts.join('\n')}` : '';

    return `Marque: "${input.brandName}"${variantsStr}
Domaine: ${input.domain}
Marché: France${contextStr}

Évalue cette marque du point de vue des consommateurs FRANÇAIS:
1. Est-elle connue/reconnue en France dans son domaine? (si inconnue en France = score bas 40-55)
2. A-t-elle des controverses ou bad buzz connus en France?
3. Quelle est sa réputation qualité auprès des clients français?
4. Comment se positionne-t-elle vs la concurrence sur le marché français?

JSON uniquement: {"s":score,"t":[{"n":"theme","s":"positive|negative|neutral","w":poids}],"kp":[positifs],"kn":[négatifs]}`;
  }

  private transformThemes(
    rawThemes: Array<{ n: string; s: string; w: number }>,
  ): ThemeWithMetadata[] {
    return rawThemes.map((t) => ({
      name: t.n,
      sentiment: t.s as 'positive' | 'negative' | 'neutral',
      weight: t.w,
    }));
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
      return Result.ok({
        ...validated.data,
        t: this.transformThemes(validated.data.t),
      });
    } catch {
      this.logger.warn('JSON parse failed for Mistral sentiment', {
        responsePreview: trimmed.substring(0, 200),
      });
      return Result.err(new SentimentParseError('mistral', trimmed));
    }
  }
}

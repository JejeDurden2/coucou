import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { LoggerService } from '../../../../common/logger';
import { WebScraperService } from '../../../../common/infrastructure/web-scraper/web-scraper.service';
import type { LLMPort } from '../../../scan/application/ports/llm.port';
import type {
  BrandAnalyzerPort,
  BrandContext,
  GeneratedPrompt,
} from '../../application/ports/brand-analyzer.port';

const BrandContextSchema = z.object({
  businessType: z.string(),
  locality: z.string().nullable(),
  mainOfferings: z.array(z.string()),
  targetAudience: z.string(),
});

const GeneratedPromptsSchema = z.array(
  z.object({
    content: z.string(),
    category: z.string(),
  }),
);

const CONTEXT_EXTRACTION_SYSTEM = `Tu es un extracteur de données structurées. Tu réponds TOUJOURS en JSON valide, sans markdown, sans explication, sans texte autour. Uniquement le JSON.`;

function buildContextExtractionPrompt(siteContent: string, brandName: string): string {
  return `Voici le contenu textuel du site de la marque "${brandName}":

---
${siteContent}
---

À partir de ce contenu, extrais les informations clés de la marque.
Ne fais pas de recherche web — base-toi uniquement sur le contenu fourni ci-dessus.

Format de réponse attendu (JSON uniquement):
{
  "businessType": "type d'activité en 3-5 mots",
  "locality": "ville/quartier si commerce local, null si national/international",
  "mainOfferings": ["3-5 produits/services principaux"],
  "targetAudience": "description de la cible en une phrase"
}`;
}

function buildPromptGenerationPrompt(ctx: BrandContext, brandName: string, count: number): string {
  return `Génère exactement ${count} prompts de recherche pour tracker la visibilité de "${brandName}" dans les réponses des LLMs (ChatGPT, Claude, etc).

Contexte de la marque:
- Activité: ${ctx.businessType}
- Localité: ${ctx.locality ?? 'France (national)'}
- Offres principales: ${ctx.mainOfferings.join(', ')}
- Cible: ${ctx.targetAudience}

Réponds UNIQUEMENT en JSON valide (sans markdown, sans \`\`\`):
[{"content": "question complète", "category": "catégorie"}, ...]

Règles IMPORTANTES:
- Chaque prompt doit être une question complète en français, comme un utilisateur la poserait à ChatGPT
- ${ctx.locality ? `Inclure la localité "${ctx.locality}" dans les questions pertinentes` : 'Inclure "en France" quand c\'est pertinent'}
- NE JAMAIS mentionner le nom "${brandName}" dans les questions
- Catégories possibles: "Découverte", "Comparaison", "Intention d'achat", "Local"
- Questions avec une vraie intention utilisateur (pas génériques)
- Varier les formulations et les angles`;
}

@Injectable()
export class MistralBrandAnalyzerAdapter implements BrandAnalyzerPort {
  constructor(
    private readonly llmAdapter: LLMPort,
    private readonly webScraper: WebScraperService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MistralBrandAnalyzerAdapter.name);
  }

  async extractContext(url: string, brandName: string): Promise<BrandContext> {
    this.logger.info('Extracting brand context', { brandName, url });

    const siteContent = await this.webScraper.fetchContent(url);

    const response = await this.llmAdapter.query(
      buildContextExtractionPrompt(siteContent, brandName),
      { systemPrompt: CONTEXT_EXTRACTION_SYSTEM },
    );

    this.logger.debug('Raw brand context response', {
      brandName,
      responsePreview: response.content.slice(0, 500),
    });

    const parsed = this.parseJson(response.content, BrandContextSchema);

    this.logger.info('Successfully extracted brand context', { brandName });
    return parsed;
  }

  async generatePrompts(
    context: BrandContext,
    brandName: string,
    count: number,
  ): Promise<GeneratedPrompt[]> {
    this.logger.info('Generating prompts', { brandName, count });

    const response = await this.llmAdapter.query(
      buildPromptGenerationPrompt(context, brandName, count),
    );

    const parsed = this.parseJson(response.content, GeneratedPromptsSchema);

    this.logger.info('Successfully generated prompts', {
      brandName,
      promptsCount: parsed.length,
    });
    return parsed;
  }

  private parseJson<T>(text: string, schema: z.ZodSchema<T>): T {
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*|\s*```$/gi, '')
      .trim();

    const jsonStart = cleaned.indexOf('{');
    const arrayStart = cleaned.indexOf('[');

    let startIndex: number;
    if (jsonStart === -1 && arrayStart === -1) {
      throw new Error('No JSON found in LLM response');
    } else if (jsonStart === -1) {
      startIndex = arrayStart;
    } else if (arrayStart === -1) {
      startIndex = jsonStart;
    } else {
      startIndex = Math.min(jsonStart, arrayStart);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned.slice(startIndex));
    } catch (error) {
      this.logger.error('JSON parse failed', { responsePreview: text.slice(0, 300) });
      throw error;
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      this.logger.error('JSON validation failed', { error: result.error.message });
      throw new Error(`Invalid JSON structure: ${result.error.message}`);
    }

    return result.data;
  }
}

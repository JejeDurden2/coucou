import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';

import { AnthropicClientService } from '../../../../common/infrastructure/anthropic/anthropic-client.service';
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

const CONTEXT_EXTRACTION_PROMPT = (url: string, brandName: string): string => `
Lis le site ${url} de la marque "${brandName}" et extrais-en les informations clés.

Consulte directement cette URL pour comprendre l'activité, les offres et la cible de la marque.
Ne fais pas de recherche web générale — base-toi uniquement sur le contenu du site.

Format de réponse attendu (JSON uniquement):
{
  "businessType": "type d'activité en 3-5 mots",
  "locality": "ville/quartier si commerce local, null si national/international",
  "mainOfferings": ["3-5 produits/services principaux"],
  "targetAudience": "description de la cible en une phrase"
}
`;

const PROMPT_GENERATION_PROMPT = (ctx: BrandContext, brandName: string, count: number): string => `
Génère exactement ${count} prompts de recherche pour tracker la visibilité de "${brandName}" dans les réponses des LLMs (ChatGPT, Claude, etc).

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
- Varier les formulations et les angles
`;

@Injectable()
export class ClaudeBrandAnalyzerAdapter implements BrandAnalyzerPort {
  private readonly logger = new Logger(ClaudeBrandAnalyzerAdapter.name);

  constructor(private readonly anthropicClient: AnthropicClientService) {}

  async extractContext(url: string, brandName: string): Promise<BrandContext> {
    this.logger.log(`Extracting brand context for ${brandName} from ${url}`);

    const response = await this.anthropicClient.createMessage({
      model: 'claude-sonnet-4-5-20250929',
      maxTokens: 1024,
      temperature: 0,
      system: CONTEXT_EXTRACTION_SYSTEM,
      messages: [{ role: 'user', content: CONTEXT_EXTRACTION_PROMPT(url, brandName) }],
      webSearch: true
    });

    this.logger.debug(
      `Raw brand context response for ${brandName}: ${response.text.slice(0, 500)}`,
    );

    const parsed = this.anthropicClient.extractJson(response.text, BrandContextSchema);

    this.logger.log(`Successfully extracted brand context for ${brandName}`);
    return parsed;
  }

  async generatePrompts(
    context: BrandContext,
    brandName: string,
    count: number,
  ): Promise<GeneratedPrompt[]> {
    this.logger.log(`Generating ${count} prompts for ${brandName}`);

    const response = await this.anthropicClient.createMessage({
      model: 'claude-haiku-4-5-20251001',
      maxTokens: 1024,
      temperature: 0,
      messages: [{ role: 'user', content: PROMPT_GENERATION_PROMPT(context, brandName, count) }],
    });

    const parsed = this.anthropicClient.extractJson(response.text, GeneratedPromptsSchema);

    this.logger.log(`Successfully generated ${parsed.length} prompts for ${brandName}`);
    return parsed;
  }
}

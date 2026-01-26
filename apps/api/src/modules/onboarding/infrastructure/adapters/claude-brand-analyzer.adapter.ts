import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';

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

const AnthropicResponseSchema = z.object({
  content: z.array(
    z.object({
      type: z.string(),
      text: z.string().optional(),
    }),
  ),
});

const CONTEXT_EXTRACTION_PROMPT = (url: string, brandName: string): string => `
Analyse le site ${url} pour la marque "${brandName}".

Utilise web_search pour trouver des informations sur ce site et cette marque.

Réponds UNIQUEMENT en JSON valide (sans markdown, sans \`\`\`):
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

Exemples de bons prompts:
- "Quel est le meilleur restaurant italien à Lyon pour un dîner romantique ?"
- "Quelle agence SEO recommandes-tu pour une startup B2B en France ?"
- "Quelles sont les alternatives à Notion pour la gestion de projet ?"
`;

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 60_000,
} as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class ClaudeBrandAnalyzerAdapter implements BrandAnalyzerPort {
  private readonly logger = new Logger(ClaudeBrandAnalyzerAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  async extractContext(url: string, brandName: string): Promise<BrandContext> {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') ?? '';

    this.logger.log(`Extracting brand context for ${brandName} from ${url}`);

    const response = await this.callWithRetry(
      () =>
        fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-beta': 'web-search-2025-03-05',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            tools: [{ type: 'web_search_20250305', name: 'web_search' }],
            messages: [
              {
                role: 'user',
                content: CONTEXT_EXTRACTION_PROMPT(url, brandName),
              },
            ],
          }),
        }),
      'context extraction',
    );

    const data = await response.json();
    const textContent = this.extractTextContent(data);
    const jsonContent = this.extractJson(textContent);

    const parsed = BrandContextSchema.safeParse(jsonContent);
    if (!parsed.success) {
      this.logger.error('Invalid brand context format from Anthropic response');
      throw new Error('Invalid response format from brand context extraction');
    }

    this.logger.log(`Successfully extracted brand context for ${brandName}`);
    return parsed.data;
  }

  async generatePrompts(
    context: BrandContext,
    brandName: string,
    count: number,
  ): Promise<GeneratedPrompt[]> {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') ?? '';

    this.logger.log(`Generating ${count} prompts for ${brandName}`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: PROMPT_GENERATION_PROMPT(context, brandName, count),
          },
        ],
      }),
    });

    if (!response.ok) {
      this.logger.error(`Anthropic API error during prompt generation: status ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const textContent = this.extractTextContent(data);
    const jsonContent = this.extractJson(textContent);

    const parsed = GeneratedPromptsSchema.safeParse(jsonContent);
    if (!parsed.success) {
      this.logger.error('Invalid prompts format from Anthropic response');
      throw new Error('Invalid response format from prompt generation');
    }

    this.logger.log(`Successfully generated ${parsed.data.length} prompts for ${brandName}`);
    return parsed.data;
  }

  private extractTextContent(data: unknown): string {
    const result = AnthropicResponseSchema.safeParse(data);
    if (!result.success) {
      throw new Error('Invalid Anthropic response format');
    }

    const textBlock = result.data.content.find((block) => block.type === 'text');
    return textBlock?.text ?? '';
  }

  private extractJson(text: string): unknown {
    // Remove potential markdown code blocks
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    // Try to find JSON object or array
    const jsonStart = cleaned.indexOf('{');
    const arrayStart = cleaned.indexOf('[');

    let startIndex: number;
    if (jsonStart === -1 && arrayStart === -1) {
      throw new Error('No JSON found in response');
    } else if (jsonStart === -1) {
      startIndex = arrayStart;
    } else if (arrayStart === -1) {
      startIndex = jsonStart;
    } else {
      startIndex = Math.min(jsonStart, arrayStart);
    }

    const jsonString = cleaned.slice(startIndex);

    try {
      return JSON.parse(jsonString);
    } catch {
      throw new Error('Failed to parse JSON from Anthropic response');
    }
  }
}

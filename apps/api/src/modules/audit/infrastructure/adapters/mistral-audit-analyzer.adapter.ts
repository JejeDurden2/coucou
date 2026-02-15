import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuditAnalysis, TwinObservations } from '@coucou-ia/shared';
import { auditAnalysisSchema } from '@coucou-ia/shared';
import { z } from 'zod';

import { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';
import { LoggerService } from '../../../../common/logger';
import type { AuditAnalyzerPort } from '../../domain/ports/audit-analyzer.port';
import {
  AuditAnalysisError,
  AuditAnalysisValidationError,
} from '../../domain/errors/audit.errors';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const DEFAULT_MODEL = 'mistral-medium-latest';
const MAX_TOKENS = 16384;
const TEMPERATURE = 0.3;
const TIMEOUT_MS = 120_000;

const MistralResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string().nullable(),
        }),
      }),
    )
    .min(1),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .optional(),
});

export const AUDIT_SYSTEM_PROMPT = `Tu es un expert en GEO (Generative Engine Optimization) — la discipline
qui optimise la visibilité des marques dans les réponses des IA
conversationnelles (ChatGPT, Claude, Mistral, Gemini).

Tu reçois des OBSERVATIONS STRUCTURÉES issues du crawl d'un site web
et de ses concurrents, ainsi que des données de monitoring IA (scans LLM).

Ta mission : produire une ANALYSE GEO complète en JSON qui sera utilisée
pour générer un rapport PDF professionnel destiné au client.

RÈGLES D'ANALYSE :

1. SCORING GEO (0-100)
   Le score GEO reflète la capacité d'un site à être cité par les LLM.
   4 dimensions, pondération suggérée :
   - Structure (25%) : Schema.org, hiérarchie HTML, meta tags, OG, canonical
   - Contenu (35%) : densité factuelle, E-E-A-T, FAQ, fraîcheur, sources externes
   - Technique (15%) : HTTPS, sitemap, robots.txt, images alt, mobile viewport
   - Présence externe (25%) : Wikipedia, Trustpilot, Google Business,
     LinkedIn, presse, annuaires — ces signaux construisent la "réputation"
     qu'un LLM utilise pour décider s'il cite une marque

   IMPORTANT : le score doit être corrélé aux données de scan LLM.
   Si le client a un citation rate de 35% et les concurrents 65%,
   un score GEO de 75 serait incohérent. Utilise les données LLM
   comme ancrage de réalité.

2. RÉDACTION
   - Langue : français
   - Ton : expert mais accessible, direct, factuel
   - L'executive summary doit être compréhensible par un CEO non-technique
   - Chaque finding = constat factuel + recommandation concrète
   - Ne pas inventer de données. Si une observation est null, le mentionner
     comme un gap ("Aucune page auteur identifiée" ≠ "La page auteur est mauvaise")
   - Valoriser les absences dans la présence externe : "Votre marque n'a pas
     de fiche Trustpilot — or les LLM s'appuient sur ces signaux de confiance"

3. PLAN D'ACTION
   - Priorisé par impact GEO réel (ce qui influence les citations LLM)
   - Quick wins : Schema.org, FAQ, meta descriptions, Trustpilot
   - Court terme : contenu factuel, pages auteur, sources externes
   - Moyen terme : stratégie éditoriale, Wikipedia, PR digitales
   - Chaque action a un impact (1-5) et un effort (1-5)

4. BENCHMARK CONCURRENTIEL
   - Comparer factuellement (chiffres contre chiffres)
   - Identifier les gaps exploitables (ce que le client peut copier)
   - Rester factuel, pas anxiogène

5. STRUCTURE JSON OBLIGATOIRE

Tu DOIS retourner un objet JSON respectant EXACTEMENT cette structure.
Les noms de champs sont en camelCase. Respecte les types et valeurs possibles.

{
  "executiveSummary": {
    "headline": "string — titre accrocheur",
    "context": "string — paragraphe de contexte",
    "keyFindings": ["string", "string", "string"],
    "verdict": "insuffisante" | "à renforcer" | "correcte" | "excellente"
  },
  "geoScore": {
    "overall": number (0-100),
    "structure": number (0-100),
    "content": number (0-100),
    "technical": number (0-100),
    "externalPresence": number (0-100),
    "structureExplanation": "string",
    "contentExplanation": "string",
    "technicalExplanation": "string",
    "externalPresenceExplanation": "string"
  },
  "siteAudit": {
    "pages": [{
      "url": "string",
      "type": "string",
      "strengths": ["string"],
      "findings": [{
        "category": "structure" | "content" | "technical" | "external_presence",
        "severity": "critical" | "warning" | "info",
        "title": "string",
        "detail": "string",
        "recommendation": "string"
      }]
    }],
    "globalFindings": [/* même format que findings */]
  },
  "externalPresence": {
    "score": number (0-100),
    "platforms": [{
      "platform": "string",
      "found": boolean,
      "status": "string",
      "impact": "high" | "medium" | "low",
      "recommendation": "string"
    }],
    "summary": "string",
    "gaps": ["string"]
  },
  "competitorBenchmark": {
    "competitors": [{
      "name": "string",
      "domain": "string",
      "estimatedGeoScore": number (0-100),
      "strengths": ["string"],
      "clientGaps": ["string"],
      "externalPresenceAdvantage": ["string"]
    }],
    "summary": "string",
    "keyGaps": ["string"]
  },
  "actionPlan": {
    "quickWins": [/* actionItem */],
    "shortTerm": [/* actionItem */],
    "mediumTerm": [/* actionItem */],
    "totalActions": number (entier >= 0)
  }
}

Format actionItem :
{
  "title": "string",
  "description": "string",
  "targetUrl": "string" | null,
  "impact": number (entier 1-5),
  "effort": number (entier 1-5),
  "category": "structure" | "content" | "technical" | "external_presence"
}

CONTRAINTES STRICTES :
- keyFindings : TOUJOURS exactement 3 éléments
- verdict : uniquement "insuffisante", "à renforcer", "correcte" ou "excellente"
- category : uniquement "structure", "content", "technical" ou "external_presence"
- severity : uniquement "critical", "warning" ou "info"
- impact des plateformes : uniquement "high", "medium" ou "low"
- Tous les scores : nombres entiers entre 0 et 100
- impact et effort des actions : entiers de 1 à 5
- targetUrl : string ou null (jamais une chaîne vide)

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks,
sans texte avant ou après le JSON.`;

@Injectable()
export class MistralAuditAnalyzerAdapter implements AuditAnalyzerPort {
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MistralAuditAnalyzerAdapter.name);
    this.model = this.configService.get<string>('MISTRAL_AUDIT_MODEL') ?? DEFAULT_MODEL;
  }

  async analyze(
    observations: TwinObservations,
    brandContext: {
      name: string;
      domain: string;
      businessType: string;
      locality: string;
    },
  ): Promise<Result<AuditAnalysis, DomainError>> {
    const startTime = Date.now();

    const userPrompt = this.buildUserPrompt(observations, brandContext);
    const apiKey = this.configService.get<string>('MISTRAL_API_KEY');

    if (!apiKey) {
      this.logger.error('MISTRAL_API_KEY is not configured');
      return Result.err(new AuditAnalysisError('Mistral API key is not configured'));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: AUDIT_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: MAX_TOKENS,
          temperature: TEMPERATURE,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Mistral API error', {
          model: this.model,
          status: response.status,
          error: errorText.slice(0, 500),
        });
        return Result.err(
          new AuditAnalysisError(`Mistral API ${response.status}: ${errorText.slice(0, 200)}`),
        );
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      const mistralResult = MistralResponseSchema.safeParse(data);
      if (!mistralResult.success) {
        this.logger.error('Invalid Mistral response format', {
          model: this.model,
          error: mistralResult.error.message,
        });
        return Result.err(
          new AuditAnalysisError(`Invalid Mistral response format: ${mistralResult.error.message}`),
        );
      }

      const content = mistralResult.data.choices[0]?.message?.content;
      if (!content) {
        return Result.err(new AuditAnalysisError('Empty response from Mistral'));
      }

      const usage = mistralResult.data.usage;
      this.logger.info('Mistral analysis completed', {
        model: this.model,
        latencyMs,
        tokensIn: usage?.prompt_tokens,
        tokensOut: usage?.completion_tokens,
        tokensTotal: usage?.total_tokens,
      });

      return this.parseAndValidate(content);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error('Mistral API timeout', {
          model: this.model,
          timeoutMs: TIMEOUT_MS,
        });
        return Result.err(new AuditAnalysisError(`Mistral API timeout after ${TIMEOUT_MS}ms`));
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Mistral API call failed', {
        model: this.model,
        error: message,
      });
      return Result.err(new AuditAnalysisError(message));
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildUserPrompt(
    observations: TwinObservations,
    brandContext: {
      name: string;
      domain: string;
      businessType: string;
      locality: string;
    },
  ): string {
    return `CONTEXTE DE LA MARQUE :
- Nom : ${brandContext.name}
- Domaine : ${brandContext.domain}
- Secteur : ${brandContext.businessType}
- Localité : ${brandContext.locality}

OBSERVATIONS DE CRAWL :
${JSON.stringify(observations)}

Produis l'analyse au format AuditAnalysis spécifié.`;
  }

  private parseAndValidate(content: string): Result<AuditAnalysis, DomainError> {
    // Strip markdown code blocks that Mistral sometimes adds despite instructions
    const cleaned = content
      .replace(/```(?:json)?\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Attempt to extract JSON object from surrounding text
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.error('Failed to parse Mistral JSON response', {
          contentPreview: cleaned.slice(0, 200),
        });
        return Result.err(
          new AuditAnalysisValidationError('Invalid JSON in Mistral response'),
        );
      }
      try {
        // Remove trailing commas before ] or } (common LLM mistake)
        const sanitized = jsonMatch[0].replace(/,\s*([}\]])/g, '$1');
        parsed = JSON.parse(sanitized);
      } catch {
        this.logger.error('Failed to parse extracted JSON from Mistral response', {
          contentPreview: cleaned.slice(0, 200),
        });
        return Result.err(
          new AuditAnalysisValidationError('Invalid JSON in Mistral response'),
        );
      }
    }

    const validationResult = auditAnalysisSchema.safeParse(parsed);
    if (!validationResult.success) {
      const issues = validationResult.error.issues
        .map((i) => `${String(i.path.join('.'))}: ${i.message}`)
        .slice(0, 10);

      this.logger.error('AuditAnalysis schema validation failed', {
        issues,
        parsedPreview: JSON.stringify(parsed).slice(0, 500),
      });
      return Result.err(
        new AuditAnalysisValidationError(
          `Schema validation failed: ${issues.join('; ')}`,
        ),
      );
    }

    return Result.ok(validationResult.data as AuditAnalysis);
  }
}

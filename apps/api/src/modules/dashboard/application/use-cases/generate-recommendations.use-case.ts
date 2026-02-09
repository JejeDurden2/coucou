import { Inject, Injectable } from '@nestjs/common';
import { LLMProvider } from '@prisma/client';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import type { BrandContext } from '../../../project/domain/entities/project.entity';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../../prompt';
import { SCAN_REPOSITORY, type ScanRepository, type LLMResult } from '../../../scan';
import type {
  RecommendationDto,
  RecommendationsResponseDto,
  RecommendationSeverity,
} from '../dto/recommendation.dto';
import {
  GEO_STATS,
  GEO_SOURCES,
  PLATFORM_PROFILES,
  IMPACT_EFFORT_DEFAULTS,
  getPlatformCounterTip,
  ALL_PROMPT_CATEGORIES,
  HIGH_INTENT_CATEGORIES,
  type RecommendationSource,
} from '../constants/geo-research.constants';

type GenerateRecommendationsError = NotFoundError | ForbiddenError;

// ============================================
// Interfaces
// ============================================

interface ScanWithResults {
  promptId: string;
  executedAt: Date;
  results: LLMResult[];
}

interface ModelBreakdown {
  model: string;
  provider: LLMProvider;
  citationRate: number;
  totalScans: number;
}

interface ProviderBreakdown {
  provider: LLMProvider;
  citationRate: number;
  totalResults: number;
}

interface EnrichedCompetitor {
  name: string;
  totalMentions: number;
  trend: 'up' | 'down' | 'stable' | 'new';
  trendPercentage: number | null;
  firstSeenAt: Date;
}

interface PromptInfo {
  id: string;
  content: string;
  category: string | null;
}

interface RecommendationContext {
  brandName: string;
  domain: string;
  brandContext: BrandContext | null;
  prompts: PromptInfo[];
  scans: ScanWithResults[];
  modelBreakdown: ModelBreakdown[];
  providerBreakdown: ProviderBreakdown[];
  enrichedCompetitors: EnrichedCompetitor[];
  currentYear: number;
}

// ============================================
// Use Case
// ============================================

@Injectable()
export class GenerateRecommendationsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(PROMPT_REPOSITORY)
    private readonly promptRepository: PromptRepository,
    @Inject(SCAN_REPOSITORY)
    private readonly scanRepository: ScanRepository,
  ) {}

  async execute(
    projectId: string,
    userId: string,
  ): Promise<Result<RecommendationsResponseDto, GenerateRecommendationsError>> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }

    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('You do not have access to this project'));
    }

    const prompts = await this.promptRepository.findByProjectId(projectId);
    const scans = await this.scanRepository.findByProjectId(projectId, 200);

    let idCounter = 1;
    const generateId = (): string => `rec_${idCounter++}`;

    const modelBreakdown = this.calculateModelBreakdown(scans);
    const providerBreakdown = this.calculateProviderBreakdown(scans);
    const enrichedCompetitors = this.aggregateEnrichedCompetitors(scans);

    const ctx: RecommendationContext = {
      brandName: project.brandName,
      domain: project.domain,
      brandContext: project.brandContext,
      prompts: prompts.map((p) => ({ id: p.id, content: p.content, category: p.category })),
      scans,
      modelBreakdown,
      providerBreakdown,
      enrichedCompetitors,
      currentYear: new Date().getFullYear(),
    };

    // Existing analyses (improved)
    const citationRateRec = this.analyzeCitationRate(ctx, generateId);
    const competitorRecs = this.analyzeCompetitorDominance(ctx, generateId);
    const weakPromptRecs = this.analyzeWeakPrompts(ctx, generateId);
    const keywordGapRec = this.analyzeKeywordGaps(ctx, generateId);
    const modelDisparityRec = this.analyzeModelDisparity(ctx, generateId);
    const positionTrendRec = this.analyzePositionTrend(ctx, generateId);
    const emergingCompetitorRecs = this.detectEmergingCompetitors(ctx, generateId);
    const improvementRec = this.generateImprovementSuggestion(ctx, generateId);

    // New GEO 2026 analyses
    const platformRecs = this.analyzePlatformOptimization(ctx, generateId);
    const freshnessRec = this.analyzeContentFreshness(ctx, generateId);
    const structureRec = this.analyzeContentStructure(ctx, generateId);
    const eeatRec = this.analyzeEEATSignals(ctx, generateId);
    const categoryGapRec = this.analyzePromptCategoryGap(ctx, generateId);
    const tripleThreatRec = this.analyzeTripleThreat(ctx, generateId);

    const recommendations: RecommendationDto[] = [
      citationRateRec,
      ...competitorRecs,
      ...weakPromptRecs,
      keywordGapRec,
      modelDisparityRec,
      positionTrendRec,
      ...emergingCompetitorRecs,
      improvementRec,
      ...platformRecs,
      freshnessRec,
      structureRec,
      eeatRec,
      categoryGapRec,
      tripleThreatRec,
    ].filter((rec): rec is RecommendationDto => rec !== null);

    const severityOrder: Record<RecommendationSeverity, number> = {
      critical: 0,
      warning: 1,
      info: 2,
    };
    const impactOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

    recommendations.sort((a, b) => {
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (sevDiff !== 0) return sevDiff;
      const aImpact = (a.metadata?.impact as string) ?? 'medium';
      const bImpact = (b.metadata?.impact as string) ?? 'medium';
      return (impactOrder[aImpact] ?? 1) - (impactOrder[bImpact] ?? 1);
    });

    return Result.ok({
      recommendations,
      generatedAt: new Date(),
    });
  }

  // ============================================
  // Helper Methods (contextual data extraction)
  // ============================================

  private getCitationRate(scans: ScanWithResults[]): number {
    if (scans.length === 0) return 0;
    const citedScans = scans.filter((s) => s.results.some((r) => r.isCited)).length;
    return (citedScans / scans.length) * 100;
  }

  private getWeakestPrompt(ctx: RecommendationContext): PromptInfo | null {
    let best: (PromptInfo & { scanCount: number }) | null = null;

    for (const prompt of ctx.prompts) {
      const promptScans = ctx.scans.filter((s) => s.promptId === prompt.id);
      if (promptScans.length < 3) continue;
      const cited = promptScans.filter((s) => s.results.some((r) => r.isCited)).length;
      if (cited === 0 && (!best || promptScans.length > best.scanCount)) {
        best = { ...prompt, scanCount: promptScans.length };
      }
    }

    return best;
  }

  private getTopCompetitor(ctx: RecommendationContext): { name: string; rate: number } | null {
    const totalResults = ctx.scans.flatMap((s) => s.results).length;
    if (totalResults === 0) return null;

    const counts = new Map<string, number>();
    for (const scan of ctx.scans) {
      for (const result of scan.results) {
        for (const mention of result.competitorMentions) {
          counts.set(mention.name, (counts.get(mention.name) ?? 0) + 1);
        }
      }
    }

    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return null;
    return { name: sorted[0][0], rate: Math.round((sorted[0][1] / totalResults) * 100) };
  }

  private getCompetitorKeywords(ctx: RecommendationContext, competitorName: string): string[] {
    const keywordCounts = new Map<string, number>();
    for (const scan of ctx.scans) {
      for (const result of scan.results) {
        for (const mention of result.competitorMentions) {
          if (mention.name === competitorName) {
            for (const kw of mention.keywords) {
              keywordCounts.set(kw, (keywordCounts.get(kw) ?? 0) + 1);
            }
          }
        }
      }
    }
    return Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([kw]) => kw);
  }

  private getCompetitorsOnPrompt(
    ctx: RecommendationContext,
    promptId: string,
  ): Array<{ name: string; position: number }> {
    const mentions = new Map<string, number[]>();
    const promptScans = ctx.scans.filter((s) => s.promptId === promptId);
    for (const scan of promptScans) {
      for (const result of scan.results) {
        for (const mention of result.competitorMentions) {
          const existing = mentions.get(mention.name) ?? [];
          existing.push(mention.position);
          mentions.set(mention.name, existing);
        }
      }
    }
    return Array.from(mentions.entries())
      .map(([name, positions]) => ({
        name,
        position: Math.round(positions.reduce((a, b) => a + b, 0) / positions.length),
      }))
      .sort((a, b) => a.position - b.position)
      .slice(0, 3);
  }

  private getCompetitorDominantProvider(
    ctx: RecommendationContext,
    competitorName: string,
  ): LLMProvider | null {
    const providerCounts = new Map<LLMProvider, number>();
    for (const scan of ctx.scans) {
      for (const result of scan.results) {
        for (const mention of result.competitorMentions) {
          if (mention.name === competitorName) {
            providerCounts.set(result.provider, (providerCounts.get(result.provider) ?? 0) + 1);
          }
        }
      }
    }
    if (providerCounts.size === 0) return null;
    return Array.from(providerCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }

  private getUncoveredCategories(ctx: RecommendationContext): string[] {
    const usedCategories = new Set(ctx.prompts.map((p) => p.category).filter(Boolean));
    return ALL_PROMPT_CATEGORIES.filter((c) => !usedCategories.has(c));
  }

  private getCitationRateByCategory(
    ctx: RecommendationContext,
    category: string,
  ): { rate: number; scanCount: number } {
    const categoryPromptIds = new Set(
      ctx.prompts.filter((p) => p.category === category).map((p) => p.id),
    );
    const categoryScans = ctx.scans.filter((s) => categoryPromptIds.has(s.promptId));
    if (categoryScans.length === 0) return { rate: 0, scanCount: 0 };
    const cited = categoryScans.filter((s) => s.results.some((r) => r.isCited)).length;
    return { rate: (cited / categoryScans.length) * 100, scanCount: categoryScans.length };
  }

  private isMainOffering(keyword: string, brandContext: BrandContext | null): boolean {
    if (!brandContext?.mainOfferings) return false;
    const kwLower = keyword.toLowerCase();
    return brandContext.mainOfferings.some(
      (o) => o.toLowerCase().includes(kwLower) || kwLower.includes(o.toLowerCase()),
    );
  }

  private buildSources(...keys: (keyof typeof GEO_SOURCES)[]): RecommendationSource[] {
    return keys.map((key) => ({ claim: '', ...GEO_SOURCES[key] }));
  }

  // ============================================
  // Data Computation
  // ============================================

  private calculateModelBreakdown(scans: ScanWithResults[]): ModelBreakdown[] {
    const modelMap = new Map<string, { results: LLMResult[]; provider: LLMProvider }>();

    for (const scan of scans) {
      for (const r of scan.results) {
        const existing = modelMap.get(r.model);
        if (existing) {
          existing.results.push(r);
        } else {
          modelMap.set(r.model, { results: [r], provider: r.provider });
        }
      }
    }

    return Array.from(modelMap.entries()).map(([model, data]) => {
      const citedCount = data.results.filter((r) => r.isCited).length;
      const citationRate = data.results.length > 0 ? (citedCount / data.results.length) * 100 : 0;

      return {
        model,
        provider: data.provider,
        citationRate: Math.round(citationRate * 10) / 10,
        totalScans: data.results.length,
      };
    });
  }

  private calculateProviderBreakdown(scans: ScanWithResults[]): ProviderBreakdown[] {
    const providerMap = new Map<LLMProvider, { cited: number; total: number }>();

    for (const scan of scans) {
      for (const r of scan.results) {
        const existing = providerMap.get(r.provider);
        if (existing) {
          existing.total++;
          if (r.isCited) existing.cited++;
        } else {
          providerMap.set(r.provider, { cited: r.isCited ? 1 : 0, total: 1 });
        }
      }
    }

    return Array.from(providerMap.entries()).map(([provider, data]) => ({
      provider,
      citationRate: data.total > 0 ? Math.round((data.cited / data.total) * 1000) / 10 : 0,
      totalResults: data.total,
    }));
  }

  private aggregateEnrichedCompetitors(scans: ScanWithResults[]): EnrichedCompetitor[] {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    interface CompetitorAgg {
      name: string;
      totalMentions: number;
      firstSeenAt: Date;
      currentPeriodMentions: number;
      previousPeriodMentions: number;
    }

    const aggregations = new Map<string, CompetitorAgg>();

    for (const scan of scans) {
      const isCurrentPeriod = scan.executedAt >= sevenDaysAgo;
      const isPreviousPeriod = scan.executedAt >= fourteenDaysAgo && scan.executedAt < sevenDaysAgo;

      for (const result of scan.results) {
        for (const mention of result.competitorMentions) {
          const existing = aggregations.get(mention.name);

          if (existing) {
            existing.totalMentions++;
            if (scan.executedAt < existing.firstSeenAt) {
              existing.firstSeenAt = scan.executedAt;
            }
            if (isCurrentPeriod) existing.currentPeriodMentions++;
            if (isPreviousPeriod) existing.previousPeriodMentions++;
          } else {
            aggregations.set(mention.name, {
              name: mention.name,
              totalMentions: 1,
              firstSeenAt: scan.executedAt,
              currentPeriodMentions: isCurrentPeriod ? 1 : 0,
              previousPeriodMentions: isPreviousPeriod ? 1 : 0,
            });
          }
        }
      }
    }

    return Array.from(aggregations.values()).map((agg) => {
      let trend: 'up' | 'down' | 'stable' | 'new';
      let trendPercentage: number | null = null;

      if (agg.firstSeenAt >= sevenDaysAgo) {
        trend = 'new';
      } else if (agg.previousPeriodMentions === 0) {
        trend = agg.currentPeriodMentions > 0 ? 'up' : 'stable';
        trendPercentage = agg.currentPeriodMentions > 0 ? 100 : null;
      } else {
        const change =
          ((agg.currentPeriodMentions - agg.previousPeriodMentions) / agg.previousPeriodMentions) *
          100;
        trendPercentage = Math.round(change);
        if (change > 10) {
          trend = 'up';
        } else if (change < -10) {
          trend = 'down';
        } else {
          trend = 'stable';
        }
      }

      return {
        name: agg.name,
        totalMentions: agg.totalMentions,
        trend,
        trendPercentage,
        firstSeenAt: agg.firstSeenAt,
      };
    });
  }

  // ============================================
  // Existing Analyses (Improved)
  // ============================================

  private analyzeCitationRate(
    ctx: RecommendationContext,
    generateId: () => string,
  ): RecommendationDto | null {
    if (ctx.scans.length === 0) return null;

    const citationRate = this.getCitationRate(ctx.scans);
    const weakestPrompt = this.getWeakestPrompt(ctx);
    const topCompetitor = this.getTopCompetitor(ctx);

    if (citationRate < 20) {
      const actionItems: string[] = [
        `Ajoutez 1 statistique vérifiable tous les 150-200 mots sur les pages clés de ${ctx.domain} — c'est la stratégie GEO la plus efficace (${GEO_STATS.PRINCETON_TRIPLE_BOOST} de citations, Source : Princeton University 2024)`,
      ];

      if (weakestPrompt) {
        actionItems.push(
          `Créez une page dédiée répondant au prompt « ${weakestPrompt.content.slice(0, 60)}... » — vous avez 0% de citation sur cette requête. Placez la réponse dans les 40-60 premiers mots.`,
        );
      }

      if (ctx.brandContext?.mainOfferings?.[0]) {
        actionItems.push(
          `Créez une FAQ structurée sur « ${ctx.brandContext.mainOfferings[0]} » avec schema markup FAQ — les FAQ avec schema génèrent jusqu'à ${GEO_STATS.FAQ_SCHEMA_BOOST} de citations supplémentaires (Source : Semrush 2025)`,
        );
      } else {
        actionItems.push(
          `Créez une page FAQ structurée répondant directement aux questions de vos prompts avec schema markup FAQ — jusqu'à ${GEO_STATS.FAQ_SCHEMA_BOOST} de citations supplémentaires (Source : Semrush 2025)`,
        );
      }

      if (topCompetitor) {
        actionItems.push(
          `${topCompetitor.name} est cité ${topCompetitor.rate}% du temps contre ${Math.round(citationRate)}% pour vous. Analysez ses pages et créez du contenu avec des données plus récentes et des sources plus fiables.`,
        );
      } else {
        actionItems.push(
          `Publiez un tableau comparatif objectif de votre offre vs concurrents avec des critères mesurables — les comparatifs obtiennent ${GEO_STATS.ORIGINAL_DATA_BOOST} plus de citations`,
        );
      }

      actionItems.push(
        `Ajoutez le schema markup Organization, FAQ et Article sur vos pages principales de ${ctx.domain} — le schema augmente de ${GEO_STATS.SCHEMA_MARKUP_BOOST} les chances d'apparition dans les réponses IA (Source : AIOSEO 2025)`,
      );

      const defaults = IMPACT_EFFORT_DEFAULTS.low_citation_critical;
      return {
        id: generateId(),
        type: 'low_citation',
        severity: 'critical',
        title: 'Visibilité critique',
        description: `${ctx.brandName} n'apparaît que dans ${Math.round(citationRate)}% des réponses IA. La moyenne des marques actives en GEO se situe autour de 40-50%.`,
        actionItems,
        relatedPromptIds: weakestPrompt ? [weakestPrompt.id] : undefined,
        metadata: {
          citationRate: Math.round(citationRate),
          weakestPromptId: weakestPrompt?.id,
          topCompetitor: topCompetitor?.name,
          topCompetitorRate: topCompetitor?.rate,
          ...defaults,
          sources: this.buildSources('PRINCETON', 'SEMRUSH_2025', 'AIOSEO'),
        },
      };
    }

    if (citationRate < 50) {
      const uncitedPrompts = ctx.prompts.filter((p) => {
        const promptScans = ctx.scans.filter((s) => s.promptId === p.id);
        if (promptScans.length < 3) return false;
        return !promptScans.some((s) => s.results.some((r) => r.isCited));
      });

      const actionItems: string[] = [
        `Reformulez les introductions de vos pages clés sur ${ctx.domain} : la réponse directe doit apparaître dans les 40-60 premiers mots de chaque section (les IA extraient des passages de 75-225 mots)`,
      ];

      if (uncitedPrompts.length > 0) {
        actionItems.push(
          `Vous avez 0% de citation sur « ${uncitedPrompts[0].content.slice(0, 50)}... » — créez du contenu Q&A reprenant exactement cette formulation comme titre H2`,
        );
      } else {
        actionItems.push(
          `Créez du contenu au format Q&A qui reprend les formulations exactes de vos prompts comme titres H2`,
        );
      }

      actionItems.push(
        `Citez vos sources avec liens directs (études, rapports sectoriels) sur chaque page — les contenus avec sources externes gagnent 20-30% de citations supplémentaires (Source : Princeton University 2024)`,
      );

      if (ctx.brandContext?.businessType) {
        actionItems.push(
          `Vérifiez la page Wikipedia de la catégorie « ${ctx.brandContext.businessType} » — ChatGPT s'appuie sur Wikipedia pour ${GEO_STATS.WIKIPEDIA_CHATGPT_SHARE} de ses sources. Assurez-vous que ${ctx.brandName} y est mentionné (Source : Datos/Semrush 2025)`,
        );
      } else {
        actionItems.push(
          `Vérifiez les pages Wikipedia pertinentes de votre secteur — ChatGPT y puise ${GEO_STATS.WIKIPEDIA_CHATGPT_SHARE} de ses sources (Source : Datos/Semrush 2025)`,
        );
      }

      const defaults = IMPACT_EFFORT_DEFAULTS.low_citation_warning;
      return {
        id: generateId(),
        type: 'low_citation',
        severity: 'warning',
        title: 'Visibilité à améliorer',
        description: `${ctx.brandName} apparaît dans ${Math.round(citationRate)}% des réponses IA. Avec les bonnes optimisations, vous pouvez atteindre 50%+ en quelques semaines.`,
        actionItems,
        relatedPromptIds:
          uncitedPrompts.length > 0 ? uncitedPrompts.slice(0, 2).map((p) => p.id) : undefined,
        metadata: {
          citationRate: Math.round(citationRate),
          uncitedPromptCount: uncitedPrompts.length,
          ...defaults,
          sources: this.buildSources('PRINCETON', 'DATOS_SEMRUSH'),
        },
      };
    }

    return null;
  }

  private analyzeCompetitorDominance(
    ctx: RecommendationContext,
    generateId: () => string,
  ): RecommendationDto[] {
    const competitorCounts = new Map<string, number>();
    let brandCitations = 0;

    for (const scan of ctx.scans) {
      for (const result of scan.results) {
        if (result.isCited) brandCitations++;
        for (const mention of result.competitorMentions) {
          competitorCounts.set(mention.name, (competitorCounts.get(mention.name) ?? 0) + 1);
        }
      }
    }

    const totalResults = ctx.scans.flatMap((s) => s.results).length;
    if (totalResults === 0) return [];
    const brandRate = (brandCitations / totalResults) * 100;
    const sortedCompetitors = Array.from(competitorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const defaults = IMPACT_EFFORT_DEFAULTS.competitor_dominance;

    return sortedCompetitors
      .filter(([, count]) => {
        const competitorRate = (count / totalResults) * 100;
        return competitorRate > brandRate * 2 && competitorRate > 30;
      })
      .map(([competitor, count]) => {
        const competitorRate = (count / totalResults) * 100;
        const competitorKeywords = this.getCompetitorKeywords(ctx, competitor);
        const dominantProvider = this.getCompetitorDominantProvider(ctx, competitor);
        const dominantProviderName = dominantProvider
          ? (PLATFORM_PROFILES[dominantProvider]?.displayName ?? dominantProvider)
          : null;

        const actionItems: string[] = [];

        if (competitorKeywords.length > 0) {
          actionItems.push(
            `Analysez les contenus de ${competitor} sur les thématiques « ${competitorKeywords.slice(0, 3).join('", "')} » — ce sont les mots-clés sur lesquels ils dominent`,
          );
        } else {
          actionItems.push(
            `Analysez les pages de ${competitor} qui apparaissent dans les réponses IA`,
          );
        }

        actionItems.push(
          `Créez du contenu avec des données plus récentes (${ctx.currentYear}) que ${competitor} sur ces thématiques — les IA privilégient la fraîcheur des informations`,
        );

        if (ctx.brandContext?.businessType) {
          actionItems.push(
            `Publiez une étude de cas chiffrée dans le domaine « ${ctx.brandContext.businessType} » démontrant vos résultats concrets (les IA citent ${GEO_STATS.ORIGINAL_DATA_BOOST} plus les contenus avec données originales, Source : Detailed.com 2025)`,
          );
        } else {
          actionItems.push(
            `Publiez des études de cas chiffrées démontrant vos résultats concrets — les IA citent ${GEO_STATS.ORIGINAL_DATA_BOOST} plus les contenus avec données originales (Source : Detailed.com 2025)`,
          );
        }

        if (dominantProvider) {
          actionItems.push(
            `${competitor} est particulièrement fort sur ${dominantProviderName} — ${getPlatformCounterTip(dominantProvider, ctx.brandName)}`,
          );
        }

        actionItems.push(
          `Obtenez des mentions presse et des citations sur des sites tiers — les mentions de marque ont une corrélation de ${GEO_STATS.BRAND_MENTIONS_CORRELATION} avec les citations IA, 3x plus que les backlinks (Source : Seer Interactive 2025)`,
        );

        return {
          id: generateId(),
          type: 'competitor_dominance' as const,
          severity: 'warning' as const,
          title: `${competitor} domine les réponses IA`,
          description: `${competitor} est cité dans ${Math.round(competitorRate)}% des réponses contre ${Math.round(brandRate)}% pour ${ctx.brandName}. Cet écart de ${Math.round(competitorRate - brandRate)} points nécessite une action ciblée.`,
          actionItems,
          metadata: {
            competitor,
            competitorRate: Math.round(competitorRate),
            brandRate: Math.round(brandRate),
            competitorKeywords: competitorKeywords.slice(0, 5),
            dominantProvider,
            ...defaults,
            sources: this.buildSources('DETAILED', 'SEER_INTERACTIVE'),
          },
        };
      });
  }

  private analyzeWeakPrompts(
    ctx: RecommendationContext,
    generateId: () => string,
  ): RecommendationDto[] {
    const recommendations: RecommendationDto[] = [];
    const defaults = IMPACT_EFFORT_DEFAULTS.prompt_weakness;

    for (const prompt of ctx.prompts) {
      const promptScans = ctx.scans.filter((s) => s.promptId === prompt.id);

      if (promptScans.length < 3) continue;

      const citedCount = promptScans.filter((s) => s.results.some((r) => r.isCited)).length;
      const citationRate = (citedCount / promptScans.length) * 100;

      if (citationRate === 0) {
        const competitorsOnPrompt = this.getCompetitorsOnPrompt(ctx, prompt.id);

        const actionItems: string[] = [
          `Créez une page dédiée sur ${ctx.domain} avec « ${prompt.content.slice(0, 60)}... » comme titre H1 et un paragraphe de réponse directe de 75-225 mots`,
        ];

        if (prompt.category === 'Comparaison') {
          actionItems.push(
            `Pour ce type de requête comparative, créez un tableau « ${ctx.brandName} vs alternatives » avec des critères objectifs et mesurables`,
          );
        } else if (prompt.category === "Intention d'achat") {
          actionItems.push(
            `Pour cette requête d'achat, ajoutez une page avec tarifs clairs, garanties et témoignages chiffrés — les IA recommandent les marques transparentes sur leurs offres`,
          );
        } else if (prompt.category === 'Local' && ctx.brandContext?.locality) {
          actionItems.push(
            `Pour cette requête locale, créez du contenu géolocalisé mentionnant ${ctx.brandContext.locality} avec des informations pratiques (adresse, horaires, zone de service)`,
          );
        } else {
          actionItems.push(
            `Rédigez un paragraphe d'introduction de 40-60 mots répondant directement et factuellement à cette question`,
          );
        }

        actionItems.push(
          `Incluez 3-5 statistiques vérifiables avec sources citées sur cette page (stratégie « triple renfort » de Princeton : ${GEO_STATS.PRINCETON_TRIPLE_BOOST} de citations)`,
        );

        if (competitorsOnPrompt.length > 0) {
          actionItems.push(
            `Sur ce prompt, ${competitorsOnPrompt[0].name} est cité en position #${competitorsOnPrompt[0].position}. Analysez son contenu et proposez une réponse plus complète et plus récente.`,
          );
        } else {
          actionItems.push(
            `Ajoutez le schema FAQ avec cette question et votre réponse structurée — les FAQ avec schema génèrent jusqu'à ${GEO_STATS.FAQ_SCHEMA_BOOST} de citations supplémentaires (Source : Semrush 2025)`,
          );
        }

        recommendations.push({
          id: generateId(),
          type: 'prompt_weakness',
          severity: 'warning',
          title: `Aucune citation sur « ${prompt.content.slice(0, 40)}... »`,
          description: `${ctx.brandName} n'est jamais cité pour cette requête sur ${promptScans.length} analyses. Ce prompt représente une opportunité manquée que vos concurrents exploitent peut-être.`,
          actionItems,
          relatedPromptIds: [prompt.id],
          metadata: {
            promptContent: prompt.content.slice(0, 100),
            promptCategory: prompt.category,
            scanCount: promptScans.length,
            competitorsOnPrompt: competitorsOnPrompt.slice(0, 3),
            ...defaults,
            sources: this.buildSources('PRINCETON', 'SEMRUSH_2025'),
          },
        });
      }
    }

    return recommendations.slice(0, 3);
  }

  private analyzeKeywordGaps(
    ctx: RecommendationContext,
    generateId: () => string,
  ): RecommendationDto | null {
    if (ctx.scans.length < 5) return null;

    const competitorKeywords = new Map<string, number>();
    const brandKeywords = new Set<string>();

    for (const scan of ctx.scans) {
      for (const result of scan.results) {
        if (result.isCited) {
          for (const kw of result.brandKeywords) {
            brandKeywords.add(kw.toLowerCase());
          }
        }
        for (const competitor of result.competitorMentions) {
          for (const keyword of competitor.keywords) {
            const key = keyword.toLowerCase();
            if (!brandKeywords.has(key)) {
              competitorKeywords.set(key, (competitorKeywords.get(key) ?? 0) + 1);
            }
          }
        }
      }
    }

    const gaps = Array.from(competitorKeywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (gaps.length === 0) return null;

    const defaults = IMPACT_EFFORT_DEFAULTS.keyword_gap;

    const actionItems = gaps.map(([keyword, count]) => {
      if (this.isMainOffering(keyword, ctx.brandContext)) {
        return `PRIORITAIRE — Créez du contenu approfondi (+1 500 mots) sur « ${keyword} » : c'est l'une de vos offres principales mais ${count} mentions concurrents sans vous (Source : Semrush 2025 — contenu long = ${GEO_STATS.LONG_CONTENT_BOOST} de citations)`;
      }
      return `Créez un article structuré (H1/H2/H3) sur « ${keyword} » (${count} mentions concurrents) — visez 1 500+ mots avec statistiques et sources citées`;
    });

    return {
      id: generateId(),
      type: 'keyword_gap',
      severity: 'warning',
      title: `${gaps.length} opportunités de mots-clés détectées`,
      description: `Vos concurrents sont cités sur ${gaps.length} thématiques où ${ctx.brandName} est absent. Voici les mots-clés prioritaires classés par nombre de mentions concurrents.`,
      actionItems,
      metadata: {
        keywords: gaps.map((g) => g[0]),
        keywordCounts: gaps.map((g) => g[1]),
        matchesOfferings: gaps
          .filter((g) => this.isMainOffering(g[0], ctx.brandContext))
          .map((g) => g[0]),
        ...defaults,
        sources: this.buildSources('SEMRUSH_2025'),
      },
    };
  }

  private analyzeModelDisparity(
    ctx: RecommendationContext,
    generateId: () => string,
  ): RecommendationDto | null {
    if (ctx.modelBreakdown.length < 2) return null;

    const sorted = [...ctx.modelBreakdown].sort((a, b) => b.citationRate - a.citationRate);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    const gap = best.citationRate - worst.citationRate;
    if (gap < 20) return null;

    const bestDisplayName = PLATFORM_PROFILES[best.provider]?.displayName ?? best.model;
    const worstDisplayName = PLATFORM_PROFILES[worst.provider]?.displayName ?? worst.model;

    const actionItems: string[] = [];

    if (worst.provider === LLMProvider.CHATGPT) {
      actionItems.push(
        `ChatGPT dépend fortement de Wikipedia (${GEO_STATS.WIKIPEDIA_CHATGPT_SHARE} des sources) et des résultats de recherche (score SERP : 63/100) — vérifiez que ${ctx.brandName} est mentionné sur les pages Wikipedia de votre secteur (Source : Datos/Semrush 2025)`,
        `Optimisez les balises title et meta description de ${ctx.domain} — ChatGPT les utilise pour évaluer la pertinence`,
        `Ajoutez des références à des sources institutionnelles (.gouv, .edu, rapports officiels) sur vos pages stratégiques`,
      );
    } else if (worst.provider === LLMProvider.CLAUDE) {
      actionItems.push(
        `Claude a le plus haut standard de fiabilité (95/100) et la plus faible dépendance aux SERP (55/100) — investissez dans la qualité et la profondeur du contenu plutôt que dans le SEO technique (Source : Semrush 2025)`,
        `Structurez vos contenus avec des raisonnements étape par étape et des données fact-checkées — Claude valorise la rigueur analytique`,
        `Créez des guides de +1 500 mots sur ${ctx.brandContext?.mainOfferings?.[0] ?? 'vos sujets clés'} avec des tableaux récapitulatifs et des données vérifiables`,
      );
    } else {
      actionItems.push(
        `Assurez-vous que vos pages stratégiques sur ${ctx.domain} sont en français natif de qualité — Mistral est optimisé pour le contenu francophone`,
        `Renforcez votre présence sur les sources et annuaires francophones de votre secteur`,
        `Ajoutez du contenu structuré en français avec des listes et des tableaux comparatifs`,
      );
    }

    actionItems.push(
      `Assurez-vous que les pages de ${ctx.domain} sont accessibles aux crawlers IA (pas de blocage robots.txt pour GPTBot, ClaudeBot, etc.)`,
    );

    const defaults = IMPACT_EFFORT_DEFAULTS.model_disparity;

    return {
      id: generateId(),
      type: 'model_disparity',
      severity: 'info',
      title: `Écart de visibilité : ${bestDisplayName} vs ${worstDisplayName}`,
      description: `${bestDisplayName} vous cite ${best.citationRate}% du temps, mais ${worstDisplayName} seulement ${worst.citationRate}%. Cet écart de ${Math.round(gap)} points suggère que votre contenu n'est pas optimisé pour les critères de ${worstDisplayName}.`,
      actionItems,
      metadata: {
        bestModel: best.model,
        bestModelDisplayName: bestDisplayName,
        bestRate: best.citationRate,
        worstModel: worst.model,
        worstModelDisplayName: worstDisplayName,
        worstProvider: worst.provider,
        gap: Math.round(gap),
        ...defaults,
        sources: this.buildSources('DATOS_SEMRUSH', 'SEMRUSH_2025'),
      },
    };
  }

  private analyzePositionTrend(
    ctx: RecommendationContext,
    generateId: () => string,
  ): RecommendationDto | null {
    if (ctx.scans.length < 14) return null;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentScans = ctx.scans.filter((s) => s.executedAt >= sevenDaysAgo);
    const olderScans = ctx.scans.filter(
      (s) => s.executedAt >= fourteenDaysAgo && s.executedAt < sevenDaysAgo,
    );

    if (recentScans.length < 3 || olderScans.length < 3) return null;

    const DEFAULT_RANK = 7;

    const calculateAvgRank = (scanList: ScanWithResults[]): number | null => {
      const allResults = scanList.flatMap((s) => s.results);
      const hasCitation = allResults.some((r) => r.isCited && r.position !== null);
      if (!hasCitation) return null;

      const sum = allResults.reduce((acc, r) => {
        if (r.isCited && r.position !== null) return acc + r.position;
        return acc + DEFAULT_RANK;
      }, 0);
      return sum / allResults.length;
    };

    const recentAvg = calculateAvgRank(recentScans);
    const olderAvg = calculateAvgRank(olderScans);

    if (recentAvg === null || olderAvg === null) return null;

    if (recentAvg > olderAvg + 0.5) {
      const growingCompetitors = ctx.enrichedCompetitors
        .filter((c) => c.trend === 'up')
        .map((c) => c.name)
        .slice(0, 3);

      const actionItems: string[] = [
        `Mettez à jour immédiatement vos pages stratégiques sur ${ctx.domain} avec des données de ${ctx.currentYear} — les pages non rafraîchies depuis 60-90 jours perdent ${GEO_STATS.FRESHNESS_RETENTION} leur visibilité IA (Source : Zyppy 2025)`,
      ];

      if (growingCompetitors.length > 0) {
        actionItems.push(
          `Concurrents en progression cette semaine : ${growingCompetitors.join(', ')} — vérifiez s'ils ont publié du nouveau contenu ou obtenu de la couverture presse`,
        );
      } else {
        actionItems.push(
          `Vérifiez si de nouveaux concurrents ont publié du contenu récent sur les thématiques de vos prompts`,
        );
      }

      actionItems.push(
        `Ajoutez des statistiques récentes (${ctx.currentYear}) et des études de cas avec des résultats datés sur vos pages principales`,
        `Vérifiez que vos pages sont toujours accessibles aux crawlers IA (GPTBot, ClaudeBot) — un blocage technique peut expliquer une baisse soudaine`,
      );

      const defaults = IMPACT_EFFORT_DEFAULTS.position_drop;

      return {
        id: generateId(),
        type: 'position_drop',
        severity: 'warning',
        title: `Baisse de positionnement : #${olderAvg.toFixed(1)} → #${recentAvg.toFixed(1)}`,
        description: `Votre rang moyen a reculé de ${(recentAvg - olderAvg).toFixed(1)} places cette semaine. Cette baisse peut être liée à du contenu concurrent plus récent ou à un manque de fraîcheur de vos pages.`,
        actionItems,
        metadata: {
          previousRank: Math.round(olderAvg * 10) / 10,
          currentRank: Math.round(recentAvg * 10) / 10,
          rankDelta: Math.round((recentAvg - olderAvg) * 10) / 10,
          growingCompetitors,
          ...defaults,
          sources: this.buildSources('ZYPPY'),
        },
      };
    }

    return null;
  }

  private detectEmergingCompetitors(
    ctx: RecommendationContext,
    generateId: () => string,
  ): RecommendationDto[] {
    const emerging = ctx.enrichedCompetitors.filter(
      (c) => c.trend === 'new' || (c.trend === 'up' && (c.trendPercentage ?? 0) >= 30),
    );

    const defaults = IMPACT_EFFORT_DEFAULTS.emerging_competitor;

    return emerging.slice(0, 2).map((competitor) => {
      const competitorKeywords = this.getCompetitorKeywords(ctx, competitor.name);

      const actionItems: string[] = [];

      if (competitorKeywords.length > 0) {
        actionItems.push(
          `Analysez le positionnement de ${competitor.name} : il apparaît sur les mots-clés « ${competitorKeywords.slice(0, 3).join('", "')} »`,
        );
      } else {
        actionItems.push(
          `Analysez le positionnement de ${competitor.name} : quels contenus les font apparaître ?`,
        );
      }

      if (competitor.trend === 'new') {
        actionItems.push(
          `Vérifiez si ${competitor.name} a récemment publié du contenu, obtenu de la couverture presse ou lancé une campagne — les nouveaux entrants qui apparaissent soudainement ont souvent une stratégie GEO active`,
        );
      } else {
        actionItems.push(
          `${competitor.name} progresse de +${competitor.trendPercentage}% par semaine — identifiez les 2-3 pages de leur site qui sont probablement citées et créez du contenu supérieur`,
        );
      }

      actionItems.push(
        `Différenciez ${ctx.brandName} sur les thématiques où ${competitor.name} est présent : créez du contenu avec des données plus récentes, des études de cas plus détaillées et des sources plus fiables`,
      );

      if (ctx.brandContext?.mainOfferings?.[0]) {
        actionItems.push(
          `Assurez-vous que ${ctx.brandName} est clairement positionné sur « ${ctx.brandContext.mainOfferings[0]} » — publiez du contenu qui démontre votre expertise unique par rapport à ${competitor.name}`,
        );
      }

      return {
        id: generateId(),
        type: 'emerging_competitor' as const,
        severity: 'info' as const,
        title:
          competitor.trend === 'new'
            ? `Nouveau concurrent : ${competitor.name}`
            : `${competitor.name} en hausse (+${competitor.trendPercentage}%)`,
        description:
          competitor.trend === 'new'
            ? `${competitor.name} est apparu pour la première fois dans les réponses IA cette semaine avec ${competitor.totalMentions} mentions. Surveillez son évolution et analysez quel contenu le fait apparaître.`
            : `${competitor.name} a progressé de ${competitor.trendPercentage}% cette semaine (${competitor.totalMentions} mentions au total). Cette croissance rapide peut indiquer une stratégie de contenu active.`,
        actionItems,
        metadata: {
          competitor: competitor.name,
          trend: competitor.trend,
          trendPercentage: competitor.trendPercentage,
          totalMentions: competitor.totalMentions,
          competitorKeywords: competitorKeywords.slice(0, 5),
          ...defaults,
          sources: [],
        },
      };
    });
  }

  private generateImprovementSuggestion(
    ctx: RecommendationContext,
    generateId: () => string,
  ): RecommendationDto | null {
    if (ctx.scans.length === 0) return null;

    const citationRate = this.getCitationRate(ctx.scans);
    if (citationRate < 70) return null;

    const uncoveredCategories = this.getUncoveredCategories(ctx);
    const defaults = IMPACT_EFFORT_DEFAULTS.improvement;

    const actionItems: string[] = [
      `Maintenez la fraîcheur : mettez à jour vos contenus clés sur ${ctx.domain} au minimum tous les 60-90 jours pour conserver votre avantage (Source : Zyppy 2025)`,
    ];

    if (uncoveredCategories.length > 0) {
      actionItems.push(
        `Élargissez votre couverture : ajoutez des prompts dans la catégorie « ${uncoveredCategories[0]} » pour identifier de nouvelles opportunités`,
      );
    } else {
      actionItems.push(
        `Élargissez votre couverture : ajoutez des prompts sur des requêtes adjacentes à vos thématiques actuelles`,
      );
    }

    actionItems.push(
      `Publiez des études originales avec vos propres données — le contenu original avec données propriétaires obtient ${GEO_STATS.ORIGINAL_DATA_BOOST} plus de citations (Source : Detailed.com 2025)`,
    );

    if (ctx.brandContext?.targetAudience) {
      actionItems.push(
        `Créez du contenu avancé pour ${ctx.brandContext.targetAudience} : guides experts, benchmarks sectoriels, rapports de tendances ${ctx.currentYear}`,
      );
    } else {
      actionItems.push(
        `Surveillez les nouvelles questions sur Reddit, Quora et les forums de votre secteur — les IA de type Perplexity s'appuient fortement sur Reddit (${GEO_STATS.REDDIT_PERPLEXITY_SHARE} des sources, Source : Datos/Semrush 2025)`,
      );
    }

    return {
      id: generateId(),
      type: 'improvement',
      severity: 'info',
      title: `Excellente visibilité : ${Math.round(citationRate)}% de citations`,
      description: `${ctx.brandName} apparaît dans ${Math.round(citationRate)}% des réponses IA. Vous faites partie des marques les mieux positionnées. L'objectif est maintenant de maintenir cette position et d'élargir votre couverture.`,
      actionItems,
      metadata: {
        citationRate: Math.round(citationRate),
        uncoveredCategories,
        ...defaults,
        sources: this.buildSources('ZYPPY', 'DETAILED', 'DATOS_SEMRUSH'),
      },
    };
  }

  // ============================================
  // New GEO 2026 Analyses
  // ============================================

  private analyzePlatformOptimization(
    ctx: RecommendationContext,
    generateId: () => string,
  ): RecommendationDto[] {
    if (ctx.providerBreakdown.length < 2) return [];

    const sorted = [...ctx.providerBreakdown].sort((a, b) => b.citationRate - a.citationRate);
    const best = sorted[0];
    const defaults = IMPACT_EFFORT_DEFAULTS.platform_optimization;

    return sorted
      .filter((p) => best.citationRate - p.citationRate > 15 && p.provider !== best.provider)
      .slice(0, 2)
      .map((worst) => {
        const gap = best.citationRate - worst.citationRate;
        const severity: RecommendationSeverity = gap > 25 ? 'warning' : 'info';
        const bestName = PLATFORM_PROFILES[best.provider]?.displayName ?? best.provider;
        const worstName = PLATFORM_PROFILES[worst.provider]?.displayName ?? worst.provider;

        const actionItems: string[] = [];

        if (worst.provider === LLMProvider.CHATGPT) {
          actionItems.push(
            `ChatGPT s'appuie sur Wikipedia pour ${GEO_STATS.WIKIPEDIA_CHATGPT_SHARE} de ses sources — vérifiez et complétez les pages Wikipedia de votre secteur d'activité (Source : Datos/Semrush 2025)`,
            `ChatGPT dépend modérément des résultats de recherche (score SERP : 63/100) — optimisez vos balises title et meta description sur ${ctx.domain}`,
            `Structurez vos pages avec des titres H2 clairs et des réponses directes en début de paragraphe — ChatGPT ne cite des sources que lorsque la navigation web est active`,
            `Ajoutez des références à des sources institutionnelles et académiques sur vos pages clés`,
          );
        } else if (worst.provider === LLMProvider.CLAUDE) {
          actionItems.push(
            `Claude valorise la profondeur d'analyse (score : 94/100) et la fiabilité (95/100) — créez des guides complets de +1 500 mots sur ${ctx.brandContext?.mainOfferings?.[0] ?? 'vos offres principales'} (Source : Semrush 2025)`,
            `Claude a la plus faible dépendance aux résultats de recherche (score SERP : 55/100) — misez sur la qualité intrinsèque du contenu plutôt que le SEO traditionnel`,
            `Structurez vos contenus en étapes numérotées avec des données vérifiables à chaque point — Claude privilégie les raisonnements étape par étape`,
            `Ajoutez des tableaux comparatifs et des données chiffrées vérifiables — Claude vérifie la cohérence des informations avant de les citer`,
          );
        } else {
          actionItems.push(
            `Mistral est optimisé pour le contenu francophone — vérifiez que vos pages stratégiques sur ${ctx.domain} sont rédigées dans un français impeccable et idiomatique`,
            `Renforcez votre présence sur les sources francophones et européennes (annuaires sectoriels, presse spécialisée française)`,
            `Créez du contenu approfondi en français sur « ${ctx.brandContext?.mainOfferings?.[0] ?? 'vos offres'} » — les modèles Mistral ont été entraînés avec un accent sur les données francophones`,
            `Assurez-vous que votre fiche Google Business Profile et vos profils sur les annuaires français sont à jour et complets`,
          );
        }

        return {
          id: generateId(),
          type: 'platform_optimization' as const,
          severity,
          title: `Optimisation ${worstName} requise`,
          description: `${ctx.brandName} est cité ${best.citationRate}% du temps sur ${bestName}, mais seulement ${worst.citationRate}% sur ${worstName}. Chaque plateforme IA a des critères de sélection différents.`,
          actionItems,
          metadata: {
            worstProvider: worst.provider,
            bestProvider: best.provider,
            worstRate: worst.citationRate,
            bestRate: best.citationRate,
            gap: Math.round(gap * 10) / 10,
            ...defaults,
            sources: this.buildSources('DATOS_SEMRUSH', 'SEMRUSH_2025'),
          },
        };
      });
  }

  private analyzeContentFreshness(
    ctx: RecommendationContext,
    generateId: () => string,
  ): RecommendationDto | null {
    if (ctx.scans.length === 0) return null;

    const sortedScans = [...ctx.scans].sort(
      (a, b) => b.executedAt.getTime() - a.executedAt.getTime(),
    );
    const lastScan = sortedScans[0];
    const daysSinceLastScan = Math.round(
      (Date.now() - lastScan.executedAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    const defaults = IMPACT_EFFORT_DEFAULTS.content_freshness;

    // Trigger A: Stale data
    if (daysSinceLastScan > 60) {
      const severity: RecommendationSeverity = daysSinceLastScan > 90 ? 'critical' : 'warning';

      const actionItems: string[] = [
        `Mettez à jour les pages stratégiques de ${ctx.domain} avec des données de ${ctx.currentYear} — les pages rafraîchies tous les 60-90 jours conservent ${GEO_STATS.FRESHNESS_RETENTION} mieux leur visibilité IA (Source : Zyppy 2025)`,
        `Ajoutez une date « Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} » visible sur chaque page importante (signal de fraîcheur pour les IA)`,
        `Actualisez vos statistiques et chiffres clés — remplacez les données antérieures à 12 mois par des sources récentes`,
      ];

      if (ctx.brandContext?.mainOfferings?.[0]) {
        actionItems.push(
          `Publiez un article récent sur « ${ctx.brandContext.mainOfferings[0]} » intégrant les tendances ${ctx.currentYear} de votre secteur`,
        );
      }

      return {
        id: generateId(),
        type: 'content_freshness',
        severity,
        title: 'Contenu obsolète détecté',
        description: `Votre dernière analyse date de ${daysSinceLastScan} jours. Les pages non mises à jour perdent ${GEO_STATS.FRESHNESS_RETENTION} plus de visibilité IA (Source : Zyppy 2025). Vos concurrents publient probablement du contenu plus récent.`,
        actionItems,
        metadata: {
          daysSinceLastScan,
          declineType: 'stale',
          ...defaults,
          sources: this.buildSources('ZYPPY'),
        },
      };
    }

    // Trigger B: Declining citation rate
    if (ctx.scans.length >= 9) {
      const third = Math.floor(ctx.scans.length / 3);
      const oldestThird = sortedScans.slice(third * 2);
      const middleThird = sortedScans.slice(third, third * 2);
      const newestThird = sortedScans.slice(0, third);

      const rateOld = this.getCitationRate(oldestThird);
      const rateMiddle = this.getCitationRate(middleThird);
      const rateNew = this.getCitationRate(newestThird);

      const totalDecline = rateOld - rateNew;

      if (rateOld > rateMiddle && rateMiddle > rateNew && totalDecline >= 10) {
        const severity: RecommendationSeverity = totalDecline > 20 ? 'critical' : 'warning';

        const actionItems: string[] = [
          `Mettez à jour les pages stratégiques de ${ctx.domain} avec des données de ${ctx.currentYear} — les pages rafraîchies tous les 60-90 jours conservent ${GEO_STATS.FRESHNESS_RETENTION} mieux leur visibilité IA (Source : Zyppy 2025)`,
          `Ajoutez une date « Dernière mise à jour » visible sur chaque page importante (signal de fraîcheur pour les IA)`,
          `Actualisez vos statistiques et chiffres clés — remplacez les données antérieures à 12 mois par des sources récentes`,
        ];

        return {
          id: generateId(),
          type: 'content_freshness',
          severity,
          title: 'Baisse progressive de visibilité',
          description: `Votre taux de citation a baissé de ${Math.round(rateOld)}% à ${Math.round(rateNew)}% sur les dernières analyses. Cette tendance à la baisse peut indiquer que votre contenu perd en fraîcheur face aux concurrents.`,
          actionItems,
          metadata: {
            rateStart: Math.round(rateOld),
            rateEnd: Math.round(rateNew),
            totalDecline: Math.round(totalDecline),
            declineType: 'declining',
            ...defaults,
            sources: this.buildSources('ZYPPY'),
          },
        };
      }
    }

    return null;
  }

  private analyzeContentStructure(
    ctx: RecommendationContext,
    generateId: () => string,
  ): RecommendationDto | null {
    const citationRate = this.getCitationRate(ctx.scans);
    if (citationRate <= 30 || ctx.scans.length < 10) return null;

    const citedResults = ctx.scans
      .flatMap((s) => s.results)
      .filter((r) => r.isCited && r.position !== null);
    if (citedResults.length < 5) return null;

    const avgPosition =
      citedResults.reduce((sum, r) => sum + (r.position ?? 0), 0) / citedResults.length;
    if (avgPosition <= 3.0) return null;

    const defaults = IMPACT_EFFORT_DEFAULTS.content_structure;

    return {
      id: generateId(),
      type: 'content_structure',
      severity: 'info',
      title: 'Positionnement faible malgré une bonne visibilité',
      description: `${ctx.brandName} apparaît dans ${Math.round(citationRate)}% des réponses, mais en position moyenne #${avgPosition.toFixed(1)}. Votre contenu est trouvé par les IA mais n'est pas assez bien structuré pour être cité en premier.`,
      actionItems: [
        `Restructurez vos pages clés avec une hiérarchie H1 → H2 → H3 claire — les contenus bien structurés obtiennent ${GEO_STATS.CONTENT_STRUCTURE_BOOST} plus de citations (Source : Wired Impact 2025)`,
        `Front-loadez vos réponses : placez la réponse directe à chaque question dans les 40-60 premiers mots de chaque section`,
        `Découpez votre contenu en paragraphes auto-suffisants de 75-225 mots — les IA extraient des passages individuels, pas des pages entières`,
        `Ajoutez des listes à puces, des tableaux et des encadrés récapitulatifs — le contenu avec un formatage clair a 28-40% plus de chances d'être cité`,
        `Créez une section FAQ avec schema markup sur vos pages principales — les FAQ structurées génèrent jusqu'à ${GEO_STATS.FAQ_SCHEMA_BOOST} de citations supplémentaires (Source : Semrush 2025)`,
      ],
      metadata: {
        citationRate: Math.round(citationRate),
        averagePosition: Math.round(avgPosition * 10) / 10,
        ...defaults,
        sources: this.buildSources('WIRED_IMPACT', 'SEMRUSH_2025'),
      },
    };
  }

  private analyzeEEATSignals(
    ctx: RecommendationContext,
    generateId: () => string,
  ): RecommendationDto | null {
    // Need at least some prompts in high-intent categories
    const highIntentPrompts = ctx.prompts.filter((p) =>
      HIGH_INTENT_CATEGORIES.includes(p.category as (typeof HIGH_INTENT_CATEGORIES)[number]),
    );

    if (highIntentPrompts.length < 2) return null;

    // Check high-intent citation rate
    const highIntentScans = ctx.scans.filter((s) =>
      highIntentPrompts.some((p) => p.id === s.promptId),
    );
    if (highIntentScans.length < 3) return null;

    const highIntentRate = this.getCitationRate(highIntentScans);
    if (highIntentRate > 0) return null; // Only trigger if 0% on high-intent

    // Check if cited on at least one other category
    const otherScans = ctx.scans.filter((s) => !highIntentPrompts.some((p) => p.id === s.promptId));
    const otherRate = this.getCitationRate(otherScans);
    if (otherRate === 0) return null; // Brand not known at all — different problem

    const defaults = IMPACT_EFFORT_DEFAULTS.eeat_signal;

    const actionItems: string[] = [
      `Ajoutez des signaux E-E-A-T sur vos pages clés : auteur expert identifié, date de publication et de mise à jour, sources citées — les marques avec un framework E-E-A-T complet voient ${GEO_STATS.EEAT_BOOST} plus de citations IA (Source : AIOSEO/Semrush 2025)`,
    ];

    if (ctx.brandContext?.mainOfferings?.[0]) {
      actionItems.push(
        `Publiez des études de cas chiffrées sur « ${ctx.brandContext.mainOfferings[0]} » avec des résultats vérifiables (chiffre d'affaires, pourcentages, durées)`,
      );
    }

    if (ctx.brandContext?.targetAudience) {
      actionItems.push(
        `Créez des témoignages clients détaillés de ${ctx.brandContext.targetAudience} avec des métriques concrètes (pas uniquement des avis qualitatifs)`,
      );
    }

    actionItems.push(
      `Ajoutez le schema markup Organization, Author et Review sur ${ctx.domain} — le schema markup augmente de ${GEO_STATS.SCHEMA_MARKUP_BOOST} les chances d'apparaître dans les réponses IA (Source : AIOSEO 2025)`,
      `Obtenez des mentions dans des articles de presse spécialisée — la couverture presse a la plus forte corrélation (${GEO_STATS.PRESS_COVERAGE_CORRELATION}) avec les citations IA, devant les backlinks (${GEO_STATS.BACKLINKS_CORRELATION}) (Source : Seer Interactive 2025)`,
      `Publiez un tableau comparatif objectif « ${ctx.brandName} vs alternatives » sur ${ctx.domain} avec des critères vérifiables`,
    );

    return {
      id: generateId(),
      type: 'eeat_signal',
      severity: 'warning',
      title: "Signaux de confiance insuffisants pour les requêtes d'achat",
      description: `${ctx.brandName} n'est jamais cité sur les requêtes de type « Comparaison » et « Intention d'achat », mais apparaît sur les requêtes de découverte. Les IA ne vous considèrent pas encore comme une source fiable pour les décisions d'achat.`,
      actionItems,
      relatedPromptIds: highIntentPrompts.map((p) => p.id),
      metadata: {
        highIntentCitationRate: 0,
        discoveryCitationRate: Math.round(otherRate),
        affectedPromptIds: highIntentPrompts.map((p) => p.id),
        ...defaults,
        sources: this.buildSources('AIOSEO', 'SEER_INTERACTIVE'),
      },
    };
  }

  private analyzePromptCategoryGap(
    ctx: RecommendationContext,
    generateId: () => string,
  ): RecommendationDto | null {
    const categoryRates: Array<{ category: string; rate: number; scanCount: number }> = [];

    for (const cat of ALL_PROMPT_CATEGORIES) {
      const { rate, scanCount } = this.getCitationRateByCategory(ctx, cat);
      if (scanCount >= 3) {
        categoryRates.push({ category: cat, rate, scanCount });
      }
    }

    if (categoryRates.length < 2) return null;

    const sorted = [...categoryRates].sort((a, b) => b.rate - a.rate);
    const strong = sorted[0];
    const weak = sorted[sorted.length - 1];

    if (strong.rate <= 30 || weak.rate >= 10 || strong.rate - weak.rate < 20) return null;

    const defaults = IMPACT_EFFORT_DEFAULTS.prompt_category_gap;

    const actionItems: string[] = [];

    if (weak.category === 'Découverte') {
      actionItems.push(
        `Créez du contenu éducatif et informatif sur ${ctx.brandContext?.mainOfferings?.[0] ?? "votre domaine d'expertise"} — les requêtes de découverte nécessitent du contenu de type guide, définition ou tutoriel`,
        `Rédigez des articles de type « Qu'est-ce que... », « Comment choisir... », « Guide complet de... » sur les sujets de vos prompts de découverte`,
        `Ajoutez des paragraphes d'introduction de 75-225 mots répondant directement à chaque question de découverte`,
      );
    } else if (weak.category === 'Comparaison') {
      actionItems.push(
        `Publiez un tableau comparatif détaillé « ${ctx.brandName} vs alternatives » avec des critères objectifs et mesurables — les comparatifs obtiennent ${GEO_STATS.ORIGINAL_DATA_BOOST} plus de citations IA`,
        `Créez une page dédiée aux différences entre ${ctx.brandName} et vos principaux concurrents, avec des données chiffrées pour chaque critère`,
        `Ajoutez des témoignages clients qui mentionnent spécifiquement pourquoi ils ont choisi ${ctx.brandName} par rapport aux alternatives`,
      );
    } else if (weak.category === "Intention d'achat") {
      actionItems.push(
        `Créez une page tarification/offre claire et détaillée sur ${ctx.domain} avec schema markup Product ou Offer`,
        `Publiez des études de cas clients avec des résultats chiffrés (ROI, économies, gains de temps) pour convaincre les IA de vous recommander`,
        `Ajoutez une FAQ dédiée aux questions d'achat (prix, garantie, support, onboarding) avec schema markup FAQ`,
      );
    } else if (weak.category === 'Local') {
      actionItems.push(
        `Optimisez votre fiche Google Business Profile avec des informations complètes et à jour sur ${ctx.brandContext?.locality ?? 'votre zone géographique'}`,
        `Créez du contenu géolocalisé : « ${ctx.brandContext?.mainOfferings?.[0] ?? 'Nos services'} à ${ctx.brandContext?.locality ?? 'votre ville'} » avec des informations pratiques locales`,
        `Obtenez des avis clients mentionnant votre localisation et publiez des témoignages de clients locaux`,
      );
    }

    return {
      id: generateId(),
      type: 'prompt_category_gap',
      severity: 'info',
      title: 'Déséquilibre de visibilité par catégorie',
      description: `${ctx.brandName} est bien visible sur les requêtes « ${strong.category} » (${Math.round(strong.rate)}% de citations) mais presque absent sur « ${weak.category} » (${Math.round(weak.rate)}%). Cette catégorie représente une opportunité manquée.`,
      actionItems,
      metadata: {
        strongCategory: strong.category,
        strongRate: Math.round(strong.rate),
        weakCategory: weak.category,
        weakRate: Math.round(weak.rate),
        gap: Math.round(strong.rate - weak.rate),
        ...defaults,
        sources: this.buildSources('DETAILED'),
      },
    };
  }

  private analyzeTripleThreat(
    ctx: RecommendationContext,
    generateId: () => string,
  ): RecommendationDto | null {
    if (ctx.scans.length < 10) return null;

    const citationRate = this.getCitationRate(ctx.scans);

    // Only for 20-50% range (not overlapping with low_citation critical)
    if (citationRate < 20 || citationRate >= 50) return null;

    const topCompetitor = this.getTopCompetitor(ctx);
    const defaults = IMPACT_EFFORT_DEFAULTS.triple_threat_optimization;

    const actionItems: string[] = [
      `STATISTIQUES — Ajoutez 1 donnée chiffrée vérifiable tous les 150-200 mots sur vos pages clés de ${ctx.domain} (stratégie la plus efficace selon Princeton University)`,
    ];

    if (ctx.brandContext?.mainOfferings?.[0]) {
      actionItems.push(
        `CITATIONS DE SOURCES — Sur vos pages « ${ctx.brandContext.mainOfferings[0]} », citez au moins 3 sources externes fiables (études sectorielles, rapports officiels, données gouvernementales) avec liens`,
      );
    } else {
      actionItems.push(
        `CITATIONS DE SOURCES — Citez au moins 3 sources externes fiables par page clé (études sectorielles, rapports officiels) avec liens directs`,
      );
    }

    actionItems.push(
      `VERBATIMS D'EXPERTS — Incluez des citations entre guillemets d'experts reconnus de votre secteur (analystes, chercheurs, leaders d'opinion) sur chaque page stratégique`,
      `Appliquez ces 3 techniques simultanément sur vos pages les plus importantes — l'effet combiné est supérieur à chaque technique isolée (${GEO_STATS.PRINCETON_TRIPLE_BOOST} de citations selon Princeton)`,
    );

    if (topCompetitor) {
      actionItems.push(
        `Vérifiez si ${topCompetitor.name} utilise déjà ces techniques — s'il les applique et pas vous, c'est probablement la raison de son avance (${topCompetitor.rate}% vs ${Math.round(citationRate)}%)`,
      );
    }

    return {
      id: generateId(),
      type: 'triple_threat_optimization',
      severity: 'info',
      title: 'Stratégie « triple renfort » pour passer au niveau supérieur',
      description: `Avec ${Math.round(citationRate)}% de citations, ${ctx.brandName} est connue des IA mais pas systématiquement recommandée. La recherche de Princeton montre que la combinaison statistiques + citations de sources + verbatims d'experts améliore les citations de ${GEO_STATS.PRINCETON_TRIPLE_BOOST}.`,
      actionItems,
      metadata: {
        citationRate: Math.round(citationRate),
        topCompetitor: topCompetitor?.name,
        topCompetitorRate: topCompetitor?.rate,
        ...defaults,
        sources: this.buildSources('PRINCETON'),
      },
    };
  }
}

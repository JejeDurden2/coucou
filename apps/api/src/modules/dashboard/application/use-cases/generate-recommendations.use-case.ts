import { Inject, Injectable } from '@nestjs/common';
import { LLMProvider } from '@prisma/client';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../../prompt';
import { SCAN_REPOSITORY, type ScanRepository, type LLMResult } from '../../../scan';
import type {
  RecommendationDto,
  RecommendationsResponseDto,
  RecommendationSeverity,
} from '../dto/recommendation.dto';

type GenerateRecommendationsError = NotFoundError | ForbiddenError;

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

interface EnrichedCompetitor {
  name: string;
  totalMentions: number;
  trend: 'up' | 'down' | 'stable' | 'new';
  trendPercentage: number | null;
  firstSeenAt: Date;
}

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

    // Compute derived data for advanced recommendations
    const modelBreakdown = this.calculateModelBreakdown(scans);
    const enrichedCompetitors = this.aggregateEnrichedCompetitors(scans);

    // Existing analyses
    const citationRateRec = this.analyzeCitationRate(scans, generateId);
    const competitorRecs = this.analyzeCompetitorDominance(scans, generateId);
    const weakPromptRecs = this.analyzeWeakPrompts(prompts, scans, generateId);
    const improvementRec = this.generateImprovementSuggestion(scans, generateId);

    // New GEO analyses
    const keywordGapRec = this.analyzeKeywordGaps(scans, project.brandName, generateId);
    const modelDisparityRec = this.analyzeModelDisparity(modelBreakdown, generateId);
    const positionTrendRec = this.analyzePositionTrend(scans, generateId);
    const emergingCompetitorRecs = this.detectEmergingCompetitors(enrichedCompetitors, generateId);

    const recommendations: RecommendationDto[] = [
      citationRateRec,
      ...competitorRecs,
      ...weakPromptRecs,
      keywordGapRec,
      modelDisparityRec,
      positionTrendRec,
      ...emergingCompetitorRecs,
      improvementRec,
    ].filter((rec): rec is RecommendationDto => rec !== null);

    const severityOrder: Record<RecommendationSeverity, number> = {
      critical: 0,
      warning: 1,
      info: 2,
    };
    recommendations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return Result.ok({
      recommendations,
      generatedAt: new Date(),
    });
  }

  private analyzeCitationRate(
    scans: ScanWithResults[],
    generateId: () => string,
  ): RecommendationDto | null {
    if (scans.length === 0) return null;

    const citedScans = scans.filter((s) => s.results.some((r) => r.isCited)).length;
    const citationRate = (citedScans / scans.length) * 100;

    if (citationRate < 20) {
      return {
        id: generateId(),
        type: 'low_citation',
        severity: 'critical',
        title: 'Visibilité critique',
        description: `Votre marque n'apparaît que dans ${Math.round(citationRate)}% des réponses IA. C'est significativement en dessous de la moyenne du marché.`,
        actionItems: [
          'Ajoutez 1 statistique vérifiable tous les 150-200 mots sur vos pages clés (+30-40% de citations)',
          "Structurez chaque page avec des H2/H3 et des listes à puces (40% plus de chances d'être cité)",
          'Créez une page FAQ répondant directement aux questions de vos prompts',
          'Publiez un tableau comparatif de votre offre vs concurrents (4x plus de citations)',
          'Ajoutez le schema markup FAQ/Article/Organization sur vos pages principales',
        ],
      };
    }

    if (citationRate < 50) {
      return {
        id: generateId(),
        type: 'low_citation',
        severity: 'warning',
        title: 'Visibilité à améliorer',
        description: `Votre marque apparaît dans ${Math.round(citationRate)}% des réponses. Il y a une marge de progression importante.`,
        actionItems: [
          'Reformulez vos introductions : réponse directe dans les 40-60 premiers mots',
          'Citez vos sources avec liens (études, rapports) pour gagner en crédibilité (+20-30% de citations)',
          'Créez du contenu au format Q&A qui reprend les formulations de vos prompts',
          'Vérifiez votre présence sur les pages Wikipedia pertinentes de votre secteur',
        ],
      };
    }

    return null;
  }

  private analyzeCompetitorDominance(
    scans: ScanWithResults[],
    generateId: () => string,
  ): RecommendationDto[] {
    const competitorCounts = new Map<string, number>();
    let brandCitations = 0;

    for (const scan of scans) {
      for (const result of scan.results) {
        if (result.isCited) brandCitations++;
        for (const mention of result.competitorMentions) {
          competitorCounts.set(mention.name, (competitorCounts.get(mention.name) ?? 0) + 1);
        }
      }
    }

    const totalResults = scans.flatMap((s) => s.results).length;
    const brandRate = (brandCitations / totalResults) * 100;
    const sortedCompetitors = Array.from(competitorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return sortedCompetitors
      .filter(([, count]) => {
        const competitorRate = (count / totalResults) * 100;
        return competitorRate > brandRate * 2 && competitorRate > 30;
      })
      .map(([competitor, count]) => {
        const competitorRate = (count / totalResults) * 100;
        return {
          id: generateId(),
          type: 'competitor_dominance',
          severity: 'warning',
          title: `${competitor} domine les réponses`,
          description: `${competitor} apparaît dans ${Math.round(competitorRate)}% des réponses, contre ${Math.round(brandRate)}% pour vous. Analysez leur stratégie de contenu.`,
          actionItems: [
            `Analysez les pages de ${competitor} qui apparaissent dans les réponses IA`,
            'Créez du contenu qui cite des données plus récentes que les leurs',
            'Publiez des études de cas chiffrées démontrant vos résultats concrets',
            'Répondez aux questions Reddit/Quora où ils sont mentionnés',
          ],
          metadata: { competitor, competitorRate, brandRate },
        };
      });
  }

  private analyzeWeakPrompts(
    prompts: Array<{ id: string; content: string }>,
    scans: ScanWithResults[],
    generateId: () => string,
  ): RecommendationDto[] {
    const recommendations: RecommendationDto[] = [];

    for (const prompt of prompts) {
      const promptScans = scans.filter((s) => s.promptId === prompt.id);

      if (promptScans.length < 3) continue; // Need enough data

      const citedCount = promptScans.filter((s) => s.results.some((r) => r.isCited)).length;
      const citationRate = (citedCount / promptScans.length) * 100;

      if (citationRate === 0) {
        recommendations.push({
          id: generateId(),
          type: 'prompt_weakness',
          severity: 'warning',
          title: 'Prompt sans citation',
          description: `Vous n'êtes jamais cité sur le prompt "${prompt.content.slice(0, 50)}...". Ce type de requête ne génère pas de visibilité pour vous.`,
          actionItems: [
            'Créez une page dédiée avec ce prompt exact comme titre H1',
            'Ajoutez un paragraphe de 40-60 mots répondant directement à la question',
            'Incluez 3-5 statistiques pertinentes avec sources citées',
            'Ajoutez le schema FAQ avec cette question et votre réponse',
          ],
          relatedPromptIds: [prompt.id],
        });
      }
    }

    return recommendations.slice(0, 2); // Limit to avoid overwhelming
  }

  private generateImprovementSuggestion(
    scans: ScanWithResults[],
    generateId: () => string,
  ): RecommendationDto | null {
    if (scans.length === 0) return null;

    const citedScans = scans.filter((s) => s.results.some((r) => r.isCited)).length;
    const citationRate = (citedScans / scans.length) * 100;

    if (citationRate >= 70) {
      return {
        id: generateId(),
        type: 'improvement',
        severity: 'info',
        title: 'Excellente visibilité !',
        description: `Votre marque apparaît dans ${Math.round(citationRate)}% des réponses. Pour maintenir cette position, continuez à publier du contenu de qualité.`,
        actionItems: [
          'Mettez à jour vos statistiques mensuellement (données fraîches = plus de citations)',
          'Créez du contenu sur des prompts adjacents pour élargir votre couverture',
          'Publiez des études originales avec vos propres données (4x plus de citations)',
          'Surveillez les nouvelles questions sur Reddit/Quora dans votre domaine',
        ],
      };
    }

    return null;
  }

  // ============================================
  // New GEO Analyses
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

  private analyzeKeywordGaps(
    scans: ScanWithResults[],
    brandName: string,
    generateId: () => string,
  ): RecommendationDto | null {
    if (scans.length < 5) return null;

    const competitorKeywords = new Map<string, number>();
    const brandKeywords = new Set<string>();

    for (const scan of scans) {
      for (const result of scan.results) {
        // Keywords where brand is cited
        if (result.isCited) {
          for (const kw of result.brandKeywords) {
            brandKeywords.add(kw.toLowerCase());
          }
        }
        // Keywords from competitors
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

    // Top 5 keywords where competitors are present but not the brand
    const gaps = Array.from(competitorKeywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (gaps.length === 0) return null;

    return {
      id: generateId(),
      type: 'keyword_gap',
      severity: 'warning',
      title: 'Opportunités de mots-clés détectées',
      description: `Vos concurrents sont cités sur ${gaps.length} thématiques où ${brandName} est absent.`,
      actionItems: gaps.map(
        ([keyword, count]) => `Créez du contenu sur "${keyword}" (${count} mentions concurrents)`,
      ),
      metadata: { keywords: gaps.map((g) => g[0]) },
    };
  }

  private analyzeModelDisparity(
    modelBreakdown: ModelBreakdown[],
    generateId: () => string,
  ): RecommendationDto | null {
    if (modelBreakdown.length < 2) return null;

    const sorted = [...modelBreakdown].sort((a, b) => b.citationRate - a.citationRate);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    const gap = best.citationRate - worst.citationRate;
    if (gap < 20) return null;

    const worstIsAnthropic = worst.provider === LLMProvider.ANTHROPIC;

    return {
      id: generateId(),
      type: 'model_disparity',
      severity: 'info',
      title: 'Disparité de visibilité entre modèles',
      description: `${best.model} vous cite ${best.citationRate}% du temps, mais ${worst.model} seulement ${worst.citationRate}%.`,
      actionItems: [
        worstIsAnthropic
          ? 'Claude privilégie les contenus structurés : ajoutez des listes, tableaux et données chiffrées'
          : 'GPT privilégie les sources autoritaires : ajoutez des citations et références externes',
        'Testez différents formats de contenu sur votre site',
        'Assurez-vous que vos pages sont bien indexables par les crawlers IA',
      ],
      metadata: {
        bestModel: best.model,
        worstModel: worst.model,
        gap: Math.round(gap),
      },
    };
  }

  private analyzePositionTrend(
    scans: ScanWithResults[],
    generateId: () => string,
  ): RecommendationDto | null {
    if (scans.length < 14) return null;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentScans = scans.filter((s) => s.executedAt >= sevenDaysAgo);
    const olderScans = scans.filter(
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

    // Position increasing = worse (rank 4 > rank 2)
    if (recentAvg > olderAvg + 0.5) {
      return {
        id: generateId(),
        type: 'position_drop',
        severity: 'warning',
        title: 'Baisse de positionnement détectée',
        description: `Votre rang moyen est passé de #${olderAvg.toFixed(1)} à #${recentAvg.toFixed(1)} cette semaine.`,
        actionItems: [
          'Mettez à jour vos contenus les plus importants avec des données récentes',
          'Vérifiez si vos concurrents ont publié du nouveau contenu',
          'Ajoutez des statistiques et études de cas récentes',
        ],
        metadata: {
          previousRank: Math.round(olderAvg * 10) / 10,
          currentRank: Math.round(recentAvg * 10) / 10,
        },
      };
    }

    return null;
  }

  private detectEmergingCompetitors(
    enrichedCompetitors: EnrichedCompetitor[],
    generateId: () => string,
  ): RecommendationDto[] {
    const emerging = enrichedCompetitors.filter(
      (c) => c.trend === 'new' || (c.trend === 'up' && (c.trendPercentage ?? 0) >= 30),
    );

    return emerging.slice(0, 2).map((competitor) => ({
      id: generateId(),
      type: 'emerging_competitor',
      severity: 'info',
      title:
        competitor.trend === 'new'
          ? `Nouveau concurrent détecté : ${competitor.name}`
          : `${competitor.name} en forte hausse`,
      description:
        competitor.trend === 'new'
          ? `${competitor.name} apparaît pour la première fois dans les réponses IA cette semaine (${competitor.totalMentions} mentions).`
          : `${competitor.name} a augmenté de ${competitor.trendPercentage}% cette semaine.`,
      actionItems: [
        `Analysez le positionnement de ${competitor.name} : quels contenus les font apparaître ?`,
        'Différenciez votre offre sur les points où ils sont faibles',
        'Créez du contenu comparatif objectif si pertinent',
      ],
      metadata: {
        competitor: competitor.name,
        trend: competitor.trend,
        trendPercentage: competitor.trendPercentage,
      },
    }));
  }
}

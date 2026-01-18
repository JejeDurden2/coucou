import { Inject, Injectable } from '@nestjs/common';
import { LLMProvider } from '@prisma/client';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../../prompt';
import { SCAN_REPOSITORY, type ScanRepository, type LLMResult } from '../../../scan';
import type {
  RecommendationDto,
  RecommendationsResponseDto,
  RecommendationSeverity,
  RecommendationType,
} from '../dto/recommendation.dto';

type GenerateRecommendationsError = NotFoundError | ForbiddenError;

interface ScanWithResults {
  promptId: string;
  executedAt: Date;
  results: LLMResult[];
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

    const recommendations: RecommendationDto[] = [];
    let idCounter = 1;

    const generateId = (): string => `rec_${idCounter++}`;

    // 1. Check overall citation rate
    const citationRateRec = this.analyzeCitationRate(scans, generateId);
    if (citationRateRec) recommendations.push(citationRateRec);

    // 2. Check competitor dominance
    const competitorRecs = this.analyzeCompetitorDominance(scans, generateId);
    recommendations.push(...competitorRecs);

    // 3. Check provider disparity
    const providerRec = this.analyzeProviderDisparity(scans, generateId);
    if (providerRec) recommendations.push(providerRec);

    // 4. Check weak prompts (prompts that never get citations)
    const weakPromptRecs = this.analyzeWeakPrompts(prompts, scans, generateId);
    recommendations.push(...weakPromptRecs);

    // 5. Add improvement suggestions if doing well
    const improvementRec = this.generateImprovementSuggestion(scans, generateId);
    if (improvementRec) recommendations.push(improvementRec);

    // Sort by severity: critical > warning > info
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
          'Structurez chaque page avec des H2/H3 et des listes à puces (40% plus de chances d\'être cité)',
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
    const recommendations: RecommendationDto[] = [];

    // Aggregate competitor mentions
    const competitorCounts = new Map<string, number>();
    let brandCitations = 0;

    for (const scan of scans) {
      for (const result of scan.results) {
        if (result.isCited) brandCitations++;
        for (const mention of result.competitorMentions) {
          const count = competitorCounts.get(mention.name) ?? 0;
          competitorCounts.set(mention.name, count + 1);
        }
      }
    }

    // Find competitors that dominate
    const totalResults = scans.flatMap((s) => s.results).length;
    const sortedCompetitors = Array.from(competitorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    for (const [competitor, count] of sortedCompetitors) {
      const competitorRate = (count / totalResults) * 100;
      const brandRate = (brandCitations / totalResults) * 100;

      if (competitorRate > brandRate * 2 && competitorRate > 30) {
        recommendations.push({
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
        });
      }
    }

    return recommendations;
  }

  private analyzeProviderDisparity(
    scans: ScanWithResults[],
    generateId: () => string,
  ): RecommendationDto | null {
    const allResults = scans.flatMap((s) => s.results);

    const openaiResults = allResults.filter((r) => r.provider === LLMProvider.OPENAI);
    const anthropicResults = allResults.filter((r) => r.provider === LLMProvider.ANTHROPIC);

    if (openaiResults.length === 0 || anthropicResults.length === 0) return null;

    const openaiCitationRate =
      (openaiResults.filter((r) => r.isCited).length / openaiResults.length) * 100;
    const anthropicCitationRate =
      (anthropicResults.filter((r) => r.isCited).length / anthropicResults.length) * 100;

    const difference = Math.abs(openaiCitationRate - anthropicCitationRate);

    if (difference > 30) {
      const betterProvider = openaiCitationRate > anthropicCitationRate ? 'ChatGPT' : 'Claude';
      const worseProvider = openaiCitationRate > anthropicCitationRate ? 'Claude' : 'ChatGPT';
      const betterRate = Math.max(openaiCitationRate, anthropicCitationRate);
      const worseRate = Math.min(openaiCitationRate, anthropicCitationRate);

      // Action items adaptés selon le provider défaillant
      const actionItems =
        worseProvider === 'ChatGPT'
          ? [
              'Créez du contenu long-form (2000+ mots) avec une structure claire en H2/H3',
              'Renforcez vos backlinks depuis des sites d\'autorité (.edu, .gov, presse)',
              'Publiez des guides complets couvrant tous les aspects d\'un sujet',
            ]
          : [
              'Ajoutez des définitions techniques précises et des citations de sources',
              'Structurez avec des tableaux de données et des exemples concrets',
              'Évitez le jargon marketing, privilégiez la clarté factuelle',
            ];

      return {
        id: generateId(),
        type: 'provider_disparity',
        severity: 'info',
        title: `Écart de visibilité entre LLMs`,
        description: `Vous êtes cité ${Math.round(betterRate)}% du temps sur ${betterProvider}, mais seulement ${Math.round(worseRate)}% sur ${worseProvider}. Les deux IA utilisent des sources différentes.`,
        actionItems,
        metadata: { openaiCitationRate, anthropicCitationRate },
      };
    }

    return null;
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
}

import { Inject, Injectable } from '@nestjs/common';

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

    let idCounter = 1;
    const generateId = (): string => `rec_${idCounter++}`;

    const citationRateRec = this.analyzeCitationRate(scans, generateId);
    const competitorRecs = this.analyzeCompetitorDominance(scans, generateId);
    const weakPromptRecs = this.analyzeWeakPrompts(prompts, scans, generateId);
    const improvementRec = this.generateImprovementSuggestion(scans, generateId);

    const recommendations: RecommendationDto[] = [
      citationRateRec,
      ...competitorRecs,
      ...weakPromptRecs,
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
          type: 'competitor_dominance' as RecommendationType,
          severity: 'warning' as RecommendationSeverity,
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
}

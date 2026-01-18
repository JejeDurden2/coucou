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
          'Enrichissez votre contenu web avec des informations factuelles et vérifiables',
          'Créez du contenu qui répond directement aux questions de vos prompts',
          'Assurez-vous que votre marque est mentionnée sur des sources fiables (Wikipedia, presse, etc.)',
          'Travaillez votre présence sur les sites d\'avis et comparateurs de votre secteur',
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
          'Analysez les prompts où vous n\'êtes pas cité et optimisez votre contenu en conséquence',
          'Augmentez le nombre de backlinks de qualité vers votre site',
          'Publiez régulièrement du contenu expert dans votre domaine',
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
            `Étudiez le positionnement et le contenu de ${competitor}`,
            'Identifiez les mots-clés et sujets où ils sont mieux référencés',
            'Créez du contenu différenciant qui met en avant vos avantages uniques',
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

      return {
        id: generateId(),
        type: 'provider_disparity',
        severity: 'info',
        title: `Écart de visibilité entre LLMs`,
        description: `Vous êtes cité ${Math.round(betterRate)}% du temps sur ${betterProvider}, mais seulement ${Math.round(worseRate)}% sur ${worseProvider}. Les deux IA utilisent des sources différentes.`,
        actionItems: [
          `Analysez les sources que ${worseProvider} semble privilégier`,
          'Diversifiez vos canaux de présence en ligne',
          'Assurez une cohérence de votre message sur toutes les plateformes',
        ],
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
            'Vérifiez que votre contenu répond à cette question spécifique',
            'Créez une page dédiée qui traite directement ce sujet',
            'Envisagez de reformuler le prompt pour cibler une intention différente',
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
          'Surveillez régulièrement l\'évolution de votre positionnement',
          'Continuez à enrichir votre contenu avec des données fraîches',
          'Explorez de nouveaux prompts pour identifier des opportunités',
        ],
      };
    }

    return null;
  }
}

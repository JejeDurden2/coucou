import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuditBrief, CompetitorInput, PromptResult } from '@coucou-ia/shared';

import { Result } from '../../../../common/utils/result';
import { AuditBriefAssemblyError } from '../../domain/errors/audit.errors';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import {
  PROMPT_REPOSITORY,
  type PromptRepository,
} from '../../../prompt/domain/repositories/prompt.repository';
import {
  SCAN_REPOSITORY,
  type ScanRepository,
} from '../../../scan/domain/repositories/scan.repository';
import {
  SENTIMENT_SCAN_REPOSITORY,
  type SentimentScanRepository,
} from '../../../sentiment/domain/repositories/sentiment-scan.repository';
import type { Scan } from '../../../scan/domain/entities/scan.entity';

const TREND_THRESHOLD = 0.05;
const TOP_COMPETITORS_COUNT = 3;
const SCAN_RANGE_DAYS = 30;

const AUDIT_MISSION = `Tu es un expert en GEO (Generative Engine Optimization). Analyse le site web du client, ses concurrents, et les données de scan fournies pour produire un audit complet avec un score GEO, des recommandations actionnables et un plan d'action priorisé.`;

@Injectable()
export class BriefAssemblerService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(PROMPT_REPOSITORY)
    private readonly promptRepository: PromptRepository,
    @Inject(SCAN_REPOSITORY)
    private readonly scanRepository: ScanRepository,
    @Inject(SENTIMENT_SCAN_REPOSITORY)
    private readonly sentimentScanRepository: SentimentScanRepository,
    private readonly configService: ConfigService,
  ) {}

  async assemble(
    projectId: string,
    auditId: string,
  ): Promise<Result<AuditBrief, AuditBriefAssemblyError>> {
    try {
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        return Result.err(
          new AuditBriefAssemblyError('Projet introuvable', projectId),
        );
      }

      const prompts =
        await this.promptRepository.findActiveByProjectId(projectId);
      if (prompts.length === 0) {
        return Result.err(
          new AuditBriefAssemblyError('Aucun prompt actif', projectId),
        );
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(
        now.getTime() - SCAN_RANGE_DAYS * 24 * 60 * 60 * 1000,
      );
      const scans = await this.scanRepository.findByProjectIdInRange(
        projectId,
        thirtyDaysAgo,
        now,
      );

      const promptResults = this.buildPromptResults(prompts, scans);
      const byProvider = this.aggregateByProvider(scans);
      const summary = this.buildSummary(scans, promptResults, byProvider);
      const competitors = this.identifyTopCompetitors(scans);
      const sentiment = await this.buildSentiment(projectId);

      const apiUrl = this.configService.get<string>('API_URL', '');
      const twinSecret = this.configService.get<string>(
        'TWIN_CALLBACK_SECRET',
        '',
      );

      const brandContext = project.brandContext;

      const brief: AuditBrief = {
        mission: AUDIT_MISSION,
        brand: {
          name: project.brandName,
          domain: project.domain,
          variants: project.brandVariants,
          context: {
            businessType: brandContext?.businessType ?? '',
            locality: brandContext?.locality ?? '',
            offerings: brandContext?.mainOfferings?.join(', ') ?? '',
            audience: brandContext?.targetAudience ?? '',
          },
        },
        scanData: {
          summary,
          byProvider,
          sentiment,
          promptResults,
        },
        competitors: {
          primary: competitors,
        },
        callback: {
          url: `${apiUrl}/webhooks/twin`,
          authHeader: `Bearer ${twinSecret}`,
          auditId,
        },
        outputFormat: {
          schema: 'audit_result_v1',
          sections: [
            'geo_score',
            'site_audit',
            'competitor_benchmark',
            'action_plan',
            'external_presence',
          ],
          language: 'fr',
        },
      };

      return Result.ok(brief);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erreur inconnue';
      return Result.err(new AuditBriefAssemblyError(message, projectId));
    }
  }

  private buildPromptResults(
    prompts: { id: string; content: string; category: string | null }[],
    scans: Scan[],
  ): PromptResult[] {
    const scansByPromptId = new Map<string, Scan[]>();
    for (const scan of scans) {
      const existing = scansByPromptId.get(scan.promptId) ?? [];
      existing.push(scan);
      scansByPromptId.set(scan.promptId, existing);
    }

    const results: PromptResult[] = prompts.map((prompt) => {
      const promptScans = scansByPromptId.get(prompt.id) ?? [];
      const resultsByProvider: Record<
        string,
        { cited: boolean; position: number | null; competitors: string[] }
      > = {};

      for (const scan of promptScans) {
        for (const llmResult of scan.results) {
          const provider = llmResult.provider;
          const existing = resultsByProvider[provider];
          if (!existing || scan.executedAt > (promptScans[0]?.executedAt ?? new Date(0))) {
            resultsByProvider[provider] = {
              cited: llmResult.isCited,
              position: llmResult.position,
              competitors: llmResult.competitorMentions.map((c) => c.name),
            };
          }
        }
      }

      return {
        prompt: prompt.content,
        category: prompt.category ?? 'general',
        results: resultsByProvider,
      };
    });

    return results.sort((a, b) => {
      const rateA = this.computePromptCitationRate(a);
      const rateB = this.computePromptCitationRate(b);
      return rateA - rateB;
    });
  }

  private computePromptCitationRate(promptResult: PromptResult): number {
    const providers = Object.values(promptResult.results);
    if (providers.length === 0) return 0;
    const citedCount = providers.filter((r) => r.cited).length;
    return citedCount / providers.length;
  }

  private aggregateByProvider(
    scans: Scan[],
  ): Record<string, { citationRate: number; avgPosition: number }> {
    const providerStats = new Map<
      string,
      { cited: number; total: number; positions: number[] }
    >();

    for (const scan of scans) {
      for (const result of scan.results) {
        const stats = providerStats.get(result.provider) ?? {
          cited: 0,
          total: 0,
          positions: [],
        };
        stats.total++;
        if (result.isCited) stats.cited++;
        if (result.position !== null) stats.positions.push(result.position);
        providerStats.set(result.provider, stats);
      }
    }

    const byProvider: Record<
      string,
      { citationRate: number; avgPosition: number }
    > = {};
    for (const [provider, stats] of providerStats) {
      byProvider[provider] = {
        citationRate: stats.total > 0 ? stats.cited / stats.total : 0,
        avgPosition:
          stats.positions.length > 0
            ? stats.positions.reduce((a, b) => a + b, 0) /
              stats.positions.length
            : 0,
      };
    }

    return byProvider;
  }

  private buildSummary(
    scans: Scan[],
    _promptResults: PromptResult[],
    _byProvider: Record<string, { citationRate: number; avgPosition: number }>,
  ): AuditBrief['scanData']['summary'] {
    let totalCited = 0;
    let totalResults = 0;
    const allPositions: number[] = [];

    for (const scan of scans) {
      for (const result of scan.results) {
        totalResults++;
        if (result.isCited) totalCited++;
        if (result.position !== null) allPositions.push(result.position);
      }
    }

    const globalCitationRate =
      totalResults > 0 ? totalCited / totalResults : 0;
    const globalAvgPosition =
      allPositions.length > 0
        ? allPositions.reduce((a, b) => a + b, 0) / allPositions.length
        : 0;

    const trend = this.calculateTrend(scans);

    const dates = scans.map((s) => s.executedAt);
    const minDate =
      dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date();
    const maxDate =
      dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : new Date();

    return {
      totalScans: scans.length,
      dateRange: `${minDate.toISOString().split('T')[0]} - ${maxDate.toISOString().split('T')[0]}`,
      globalCitationRate: Math.round(globalCitationRate * 1000) / 1000,
      globalAvgPosition: Math.round(globalAvgPosition * 10) / 10,
      trend,
    };
  }

  private calculateTrend(
    scans: Scan[],
  ): 'improving' | 'stable' | 'declining' {
    if (scans.length < 2) return 'stable';

    const sorted = [...scans].sort(
      (a, b) => a.executedAt.getTime() - b.executedAt.getTime(),
    );
    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);

    const rateFirst = this.computeScansCitationRate(firstHalf);
    const rateSecond = this.computeScansCitationRate(secondHalf);

    const diff = rateSecond - rateFirst;
    if (diff > TREND_THRESHOLD) return 'improving';
    if (diff < -TREND_THRESHOLD) return 'declining';
    return 'stable';
  }

  private computeScansCitationRate(scans: Scan[]): number {
    let cited = 0;
    let total = 0;
    for (const scan of scans) {
      for (const result of scan.results) {
        total++;
        if (result.isCited) cited++;
      }
    }
    return total > 0 ? cited / total : 0;
  }

  private identifyTopCompetitors(scans: Scan[]): CompetitorInput[] {
    const competitorMap = new Map<
      string,
      {
        totalMentions: number;
        totalScans: number;
        positions: number[];
        providers: Set<string>;
        keywords: Set<string>;
      }
    >();

    for (const scan of scans) {
      for (const result of scan.results) {
        for (const mention of result.competitorMentions) {
          const stats = competitorMap.get(mention.name) ?? {
            totalMentions: 0,
            totalScans: 0,
            positions: [],
            providers: new Set(),
            keywords: new Set(),
          };
          stats.totalMentions++;
          stats.positions.push(mention.position);
          stats.providers.add(result.provider);
          for (const kw of mention.keywords) {
            stats.keywords.add(kw);
          }
          competitorMap.set(mention.name, stats);
        }
      }
    }

    const totalScanResults = scans.reduce(
      (sum, s) => sum + s.results.length,
      0,
    );

    return [...competitorMap.entries()]
      .map(([name, stats]) => ({
        name,
        domain: '',
        citationRate:
          totalScanResults > 0
            ? stats.totalMentions / totalScanResults
            : 0,
        avgPosition:
          stats.positions.length > 0
            ? stats.positions.reduce((a, b) => a + b, 0) /
              stats.positions.length
            : 0,
        detectedOn: [...stats.providers],
        associatedKeywords: [...stats.keywords],
      }))
      .sort((a, b) => b.citationRate - a.citationRate)
      .slice(0, TOP_COMPETITORS_COUNT);
  }

  private async buildSentiment(
    projectId: string,
  ): Promise<AuditBrief['scanData']['sentiment']> {
    const sentimentScan =
      await this.sentimentScanRepository.findLatestByProjectId(projectId);

    if (!sentimentScan) {
      return {
        score: 0,
        themes: [],
        positiveTerms: [],
        negativeTerms: [],
        rawSummary: '',
      };
    }

    const results = sentimentScan.results;
    const allThemes: string[] = [];
    const allPositive: string[] = [];
    const allNegative: string[] = [];

    for (const providerResult of Object.values(results)) {
      if (!providerResult) continue;
      for (const theme of providerResult.t) {
        if (!allThemes.includes(theme.name)) {
          allThemes.push(theme.name);
        }
      }
      for (const kw of providerResult.kp) {
        if (!allPositive.includes(kw)) allPositive.push(kw);
      }
      for (const kw of providerResult.kn) {
        if (!allNegative.includes(kw)) allNegative.push(kw);
      }
    }

    return {
      score: sentimentScan.globalScore,
      themes: allThemes,
      positiveTerms: allPositive,
      negativeTerms: allNegative,
      rawSummary: `Score global: ${sentimentScan.globalScore}/100`,
    };
  }
}

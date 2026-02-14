import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TwinCrawlInput } from '@coucou-ia/shared';

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

const TOP_COMPETITORS_COUNT = 3;
const SCAN_RANGE_DAYS = 30;
const MAX_PAGES_PER_COMPETITOR = 3;

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
  ): Promise<Result<TwinCrawlInput, AuditBriefAssemblyError>> {
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

      const scanData = this.buildScanData(prompts, scans);
      const sentimentScore = await this.getSentimentScore(projectId);
      const competitors = this.identifyTopCompetitors(scans);

      const apiUrl = this.configService.get<string>('API_URL', '');
      const brandContext = project.brandContext;

      const input: TwinCrawlInput = {
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
        competitors: {
          primary: competitors.map((c) => ({ name: c.name, domain: c.domain })),
          maxPagesPerCompetitor: MAX_PAGES_PER_COMPETITOR,
        },
        scanData: {
          ...scanData,
          averageSentiment: this.deriveSentimentLabel(sentimentScore),
        },
        callback: {
          url: `${apiUrl}/webhooks/twin/audit`,
          auditId,
        },
        outputFormat: 'structured_observations',
      };

      return Result.ok(input);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erreur inconnue';
      return Result.err(new AuditBriefAssemblyError(message, projectId));
    }
  }

  private buildScanData(
    prompts: { id: string; content: string; category: string | null }[],
    scans: Scan[],
  ): Omit<TwinCrawlInput['scanData'], 'averageSentiment'> {
    let totalCited = 0;
    let totalResults = 0;
    const positionsWhenCited: number[] = [];

    for (const scan of scans) {
      for (const result of scan.results) {
        totalResults++;
        if (result.isCited) {
          totalCited++;
          if (result.position !== null) {
            positionsWhenCited.push(result.position);
          }
        }
      }
    }

    const clientCitationRate =
      totalResults > 0
        ? Math.round((totalCited / totalResults) * 1000) / 1000
        : 0;

    const scansByPromptId = new Map<string, Scan[]>();
    for (const scan of scans) {
      const existing = scansByPromptId.get(scan.promptId) ?? [];
      existing.push(scan);
      scansByPromptId.set(scan.promptId, existing);
    }

    const topPerformingQueries: string[] = [];
    const queriesNotCited: string[] = [];

    for (const prompt of prompts) {
      const promptScans = scansByPromptId.get(prompt.id) ?? [];
      let cited = 0;
      let total = 0;

      for (const scan of promptScans) {
        for (const result of scan.results) {
          total++;
          if (result.isCited) cited++;
        }
      }

      if (total > 0 && cited > 0) {
        topPerformingQueries.push(prompt.content);
      } else if (total > 0) {
        queriesNotCited.push(prompt.content);
      }
    }

    return {
      clientCitationRate,
      totalQueriesTested: prompts.length,
      clientMentionsCount: totalCited,
      positionsWhenCited,
      topPerformingQueries,
      queriesNotCited,
    };
  }

  private identifyTopCompetitors(
    scans: Scan[],
  ): Array<{ name: string; domain: string }> {
    const competitorMap = new Map<string, number>();

    for (const scan of scans) {
      for (const result of scan.results) {
        for (const mention of result.competitorMentions) {
          const count = competitorMap.get(mention.name) ?? 0;
          competitorMap.set(mention.name, count + 1);
        }
      }
    }

    return [...competitorMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_COMPETITORS_COUNT)
      .map(([name]) => ({ name, domain: '' }));
  }

  private async getSentimentScore(projectId: string): Promise<number> {
    const sentimentScan =
      await this.sentimentScanRepository.findLatestByProjectId(projectId);
    return sentimentScan?.globalScore ?? 50;
  }

  private deriveSentimentLabel(
    score: number,
  ): 'positive' | 'neutral' | 'negative' | 'mixed' {
    if (score >= 70) return 'positive';
    if (score <= 30) return 'negative';
    if (score >= 40 && score <= 60) return 'neutral';
    return 'mixed';
  }
}

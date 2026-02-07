import { Inject, Injectable } from '@nestjs/common';
import type { SentimentScanResults } from '@coucou-ia/shared';

import { ForbiddenError, NotFoundError, Result, withSpan } from '../../../../common';
import { LoggerService } from '../../../../common/logger';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import {
  AllSentimentProvidersFailedError,
  SENTIMENT_SCAN_REPOSITORY,
  SentimentScan,
  type SentimentScanRepository,
} from '../../domain';
import { SENTIMENT_ANALYZER, type SentimentAnalyzerPort } from '../ports/sentiment-analyzer.port';

type ExecuteSentimentScanError = NotFoundError | ForbiddenError | AllSentimentProvidersFailedError;

@Injectable()
export class ExecuteSentimentScanUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SENTIMENT_SCAN_REPOSITORY)
    private readonly sentimentRepository: SentimentScanRepository,
    @Inject(SENTIMENT_ANALYZER)
    private readonly sentimentAnalyzer: SentimentAnalyzerPort,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ExecuteSentimentScanUseCase.name);
  }

  async execute(
    projectId: string,
    userId: string,
  ): Promise<Result<SentimentScan, ExecuteSentimentScanError>> {
    return withSpan(
      'sentiment-module',
      'ExecuteSentimentScanUseCase.execute',
      { 'sentiment.projectId': projectId, 'sentiment.userId': userId },
      async () => {
        const project = await this.projectRepository.findById(projectId);

        if (!project) {
          return Result.err(new NotFoundError('Project', projectId));
        }

        if (!project.belongsTo(userId)) {
          return Result.err(new ForbiddenError("Vous n'avez pas accès à ce projet"));
        }

        this.logger.info('Executing sentiment scan', { projectId });

        const analyzeResult = await this.sentimentAnalyzer.analyze({
          brandName: project.brandName,
          brandVariants: project.brandVariants,
          domain: project.domain,
          brandContext: project.brandContext,
        });

        if (!analyzeResult.ok) {
          this.logger.error('Mistral sentiment analysis failed', {
            projectId,
            error: analyzeResult.error.message,
          });
          return Result.err(
            new AllSentimentProvidersFailedError([
              { provider: 'mistral', error: analyzeResult.error.message },
            ]),
          );
        }

        const sentimentResult = analyzeResult.value;
        const globalScore = Math.round(sentimentResult.s);
        const results: SentimentScanResults = { mistral: sentimentResult };

        const scan = await this.sentimentRepository.save({
          projectId,
          scannedAt: new Date(),
          globalScore,
          results,
        });

        this.logger.info('Sentiment scan completed', {
          scanId: scan.id,
          projectId,
          globalScore,
        });

        return Result.ok(scan);
      },
    );
  }
}

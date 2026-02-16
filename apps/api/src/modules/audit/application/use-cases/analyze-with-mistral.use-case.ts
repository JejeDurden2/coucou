import { Inject, Injectable } from '@nestjs/common';
import { AuditStatus } from '@coucou-ia/shared';
import type { AuditAnalysis, CompetitorFactualData, TwinObservations } from '@coucou-ia/shared';

import { LoggerService } from '../../../../common/logger';
import { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';
import {
  FILE_STORAGE_PORT,
  type FileStoragePort,
} from '../../../storage/domain/ports/file-storage.port';
import {
  AUDIT_ORDER_REPOSITORY,
  type AuditOrderRepository,
  AUDIT_ANALYZER_PORT,
  type AuditAnalyzerPort,
  AuditStorageError,
  AuditAnalysisError,
} from '../../domain';
import type {
  AnalysisMetadata,
  AuditOrder,
} from '../../domain/entities/audit-order.entity';
import { AuditPdfQueueService } from '../../infrastructure/queue/audit-pdf-queue.service';
import { AuditEmailNotificationService } from '../services/audit-email-notification.service';
import { RefundAuditUseCase } from './refund-audit.use-case';

@Injectable()
export class AnalyzeWithMistralUseCase {
  constructor(
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: FileStoragePort,
    @Inject(AUDIT_ANALYZER_PORT)
    private readonly auditAnalyzer: AuditAnalyzerPort,
    private readonly auditPdfQueueService: AuditPdfQueueService,
    private readonly auditEmailNotificationService: AuditEmailNotificationService,
    private readonly refundAuditUseCase: RefundAuditUseCase,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AnalyzeWithMistralUseCase.name);
  }

  async execute(
    input: { auditOrderId: string },
  ): Promise<Result<void, DomainError>> {
    const { auditOrderId } = input;

    // 1. Load audit order
    const auditOrder = await this.auditOrderRepository.findById(auditOrderId);
    if (!auditOrder) {
      this.logger.warn('Audit not found for Mistral analysis', { auditOrderId });
      return Result.ok(undefined);
    }

    // 2. Idempotency: skip if already terminal
    if (auditOrder.isTerminal) {
      this.logger.info('Mistral analysis skipped: audit already in terminal state', {
        auditOrderId,
        currentStatus: auditOrder.status,
      });
      return Result.ok(undefined);
    }

    // 3. Validate status is ANALYZING
    if (auditOrder.status !== AuditStatus.ANALYZING) {
      this.logger.warn('Mistral analysis rejected: unexpected audit status', {
        auditOrderId,
        currentStatus: auditOrder.status,
        expectedStatus: AuditStatus.ANALYZING,
      });
      return Result.ok(undefined);
    }

    // 4. Download observations from R2
    const crawlDataUrl = auditOrder.crawlDataUrl;
    if (!crawlDataUrl) {
      await this.failAudit(auditOrder, `Audit ${auditOrderId} has no crawlDataUrl`);
      return Result.ok(undefined);
    }

    const downloadResult = await this.fileStorage.download(crawlDataUrl);
    if (!downloadResult.ok) {
      // R2 download — retryable (network)
      return Result.err(
        new AuditStorageError('download', downloadResult.error.message),
      );
    }

    let observations: TwinObservations;
    try {
      observations = JSON.parse(downloadResult.value.toString('utf-8')) as TwinObservations;
    } catch {
      await this.failAudit(auditOrder, `Failed to parse observations JSON from R2: ${crawlDataUrl}`);
      return Result.ok(undefined);
    }

    // 5. Call Mistral via port
    const brandContext = {
      name: auditOrder.briefPayload.brand.name,
      domain: auditOrder.briefPayload.brand.domain,
      businessType: auditOrder.briefPayload.brand.context.businessType,
      locality: auditOrder.briefPayload.brand.context.locality,
    };

    const analysisResult = await this.auditAnalyzer.analyze(observations, brandContext);
    if (!analysisResult.ok) {
      // Mistral API — retryable (network/API)
      return Result.err(
        new AuditAnalysisError(analysisResult.error.message, auditOrderId),
      );
    }

    const analysis = analysisResult.value;

    // 5b. Enrich analysis with factual observation data for PDF comparison table
    enrichWithFactualData(analysis, observations);

    this.logger.info('Mistral analysis succeeded', {
      auditOrderId,
      geoScore: analysis.geoScore.overall,
      verdict: analysis.executiveSummary.verdict,
    });

    // 6. Store analysis on R2
    const analysisKey = `audits/${auditOrderId}/analysis.json`;
    const analysisBuffer = Buffer.from(JSON.stringify(analysis), 'utf-8');
    const uploadResult = await this.fileStorage.upload(
      analysisKey,
      analysisBuffer,
      'application/json',
    );

    if (!uploadResult.ok) {
      // R2 upload — retryable (network)
      return Result.err(
        new AuditStorageError('upload', uploadResult.error.message),
      );
    }

    // 7. Extract metadata and store on entity (stays ANALYZING)
    const metadata = extractMetadata(analysis, analysisKey);
    const storeResult = auditOrder.storeAnalysisResults(metadata);
    if (!storeResult.ok) {
      await this.failAudit(auditOrder, storeResult.error.message);
      return Result.ok(undefined);
    }

    // 8. Save to DB (still ANALYZING, with metadata stored)
    await this.auditOrderRepository.save(storeResult.value);

    this.logger.info('Analysis results stored, PDF generation pending', {
      auditOrderId,
      geoScore: metadata.geoScore,
      verdict: metadata.verdict,
      totalActions: metadata.totalActions,
      analysisDataUrl: analysisKey,
    });

    // 9. Enqueue PDF generation (will transition to COMPLETED + send email)
    await this.auditPdfQueueService.addJob({ auditOrderId });
    this.logger.info('PDF generation job enqueued', { auditOrderId });

    return Result.ok(undefined);
  }

  private async failAudit(auditOrder: AuditOrder, reason: string): Promise<void> {
    this.logger.error('Mistral analysis failed (non-retryable)', {
      auditOrderId: auditOrder.id,
      reason,
    });

    const failedResult = auditOrder.markFailed(reason);
    if (!failedResult.ok) {
      this.logger.error('Failed to transition audit to FAILED', {
        auditOrderId: auditOrder.id,
        error: failedResult.error.message,
      });
      return;
    }

    await this.auditOrderRepository.save(failedResult.value);
    const refundResult = await this.refundAuditUseCase.execute(failedResult.value);
    const refundedOrder = refundResult.ok ? refundResult.value : failedResult.value;
    await this.auditEmailNotificationService.notifyAuditFailed(refundedOrder);
  }
}

function enrichWithFactualData(
  analysis: AuditAnalysis,
  observations: TwinObservations,
): void {
  // Client factual data — aggregated from page observations + external sources
  const clientFactualData: CompetitorFactualData = {
    hasSchemaOrg: observations.pages.some((p) => p.hasSchemaOrg),
    hasFAQSchema: observations.pages.some((p) => p.hasStructuredFAQ),
    hasAuthorInfo: observations.pages.some((p) => p.hasAuthorInfo),
    wikipediaFound: observations.external.wikipedia.found,
    trustpilotRating: observations.external.trustpilot.rating,
    trustpilotReviewCount: observations.external.trustpilot.reviewCount,
    citationRate: observations.llmScanData.clientCitationRate,
  };
  analysis.competitorBenchmark.clientFactualData = clientFactualData;

  // Competitor factual data — matched by domain from twin observations
  const observedCompetitors = new Map(
    observations.competitors.map((c) => [c.domain, c]),
  );

  for (const competitor of analysis.competitorBenchmark.competitors) {
    const observed = observedCompetitors.get(competitor.domain);
    if (!observed) continue;

    competitor.factualData = {
      hasSchemaOrg: observed.hasSchemaOrg,
      hasFAQSchema: observed.hasFAQSchema,
      hasAuthorInfo: observed.hasAuthorInfo,
      wikipediaFound: observed.wikipediaFound,
      trustpilotRating: observed.trustpilotRating,
      trustpilotReviewCount: observed.trustpilotReviewCount,
      citationRate: observed.citationRate,
    };
  }
}

function extractMetadata(
  analysis: AuditAnalysis,
  analysisDataUrl: string,
): AnalysisMetadata {
  const allActions = [
    ...analysis.actionPlan.quickWins,
    ...analysis.actionPlan.shortTerm,
    ...analysis.actionPlan.mediumTerm,
  ];

  return {
    analysisDataUrl,
    geoScore: analysis.geoScore.overall,
    verdict: analysis.executiveSummary.verdict,
    topFindings: [...analysis.executiveSummary.keyFindings],
    actionCountCritical: analysis.actionPlan.quickWins.length,
    actionCountHigh: analysis.actionPlan.shortTerm.length,
    actionCountMedium: analysis.actionPlan.mediumTerm.length,
    totalActions: analysis.actionPlan.totalActions ?? allActions.length,
    externalPresenceScore: analysis.externalPresence.score,
  };
}

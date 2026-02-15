import { AuditStatus } from '@coucou-ia/shared';
import type { AnalysisVerdict, TwinCrawlInput } from '@coucou-ia/shared';

import type { Result } from '../../../../common/utils/result';
import { Result as R } from '../../../../common/utils/result';
import { AuditInvalidTransitionError } from '../errors/audit.errors';

export interface AnalysisMetadata {
  analysisDataUrl: string;
  geoScore: number;
  verdict: AnalysisVerdict;
  topFindings: string[];
  actionCountCritical: number;
  actionCountHigh: number;
  actionCountMedium: number;
  totalActions: number;
  externalPresenceScore: number;
}

export interface AuditOrderProps {
  id: string;
  userId: string;
  projectId: string;
  status: AuditStatus;
  stripePaymentIntentId: string | null;
  amountCents: number;
  paidAt: Date | null;
  briefPayload: TwinCrawlInput;
  twinAgentId: string | null;
  reportUrl: string | null;
  crawlDataUrl: string | null;
  analysisDataUrl: string | null;
  retryCount: number;
  pagesAnalyzedClient: number | null;
  pagesAnalyzedCompetitors: number | null;
  competitorsAnalyzed: string[];
  storedGeoScore: number | null;
  verdict: string | null;
  topFindings: string[];
  actionCountCritical: number | null;
  actionCountHigh: number | null;
  actionCountMedium: number | null;
  totalActions: number | null;
  externalPresenceScore: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
  failedAt: Date | null;
  timeoutAt: Date | null;
  failureReason: string | null;
  refundedAt: Date | null;
  refundId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TERMINAL_STATUSES: ReadonlySet<AuditStatus> = new Set([
  AuditStatus.COMPLETED,
  AuditStatus.FAILED,
]);

const REFUNDABLE_STATUSES: ReadonlySet<AuditStatus> = new Set([
  AuditStatus.FAILED,
]);

export const REPORT_STATUSES: ReadonlySet<AuditStatus> = new Set([
  AuditStatus.COMPLETED,
]);

const TIMEOUT_MINUTES = 15;

export class AuditOrder {
  private constructor(private readonly props: AuditOrderProps) {}

  static create(props: AuditOrderProps): AuditOrder {
    return new AuditOrder(props);
  }

  static fromPersistence(data: {
    id: string;
    userId: string;
    projectId: string;
    status: AuditStatus;
    stripePaymentIntentId: string | null;
    amountCents: number;
    paidAt: Date | null;
    briefPayload: unknown;
    twinAgentId: string | null;
    reportUrl: string | null;
    crawlDataUrl: string | null;
    analysisDataUrl: string | null;
    retryCount: number;
    pagesAnalyzedClient: number | null;
    pagesAnalyzedCompetitors: number | null;
    competitorsAnalyzed: string[];
    geoScore: number | null;
    verdict: string | null;
    topFindings: string[];
    actionCountCritical: number | null;
    actionCountHigh: number | null;
    actionCountMedium: number | null;
    totalActions: number | null;
    externalPresenceScore: number | null;
    startedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    timeoutAt: Date | null;
    failureReason: string | null;
    refundedAt: Date | null;
    refundId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): AuditOrder {
    return new AuditOrder({
      ...data,
      briefPayload: data.briefPayload as TwinCrawlInput,
      storedGeoScore: data.geoScore,
    });
  }

  // ---- Getters ----

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get projectId(): string {
    return this.props.projectId;
  }

  get status(): AuditStatus {
    return this.props.status;
  }

  get stripePaymentIntentId(): string | null {
    return this.props.stripePaymentIntentId;
  }

  get amountCents(): number {
    return this.props.amountCents;
  }

  get paidAt(): Date | null {
    return this.props.paidAt;
  }

  get briefPayload(): TwinCrawlInput {
    return this.props.briefPayload;
  }

  get twinAgentId(): string | null {
    return this.props.twinAgentId;
  }

  get reportUrl(): string | null {
    return this.props.reportUrl;
  }

  get crawlDataUrl(): string | null {
    return this.props.crawlDataUrl;
  }

  get analysisDataUrl(): string | null {
    return this.props.analysisDataUrl;
  }

  get retryCount(): number {
    return this.props.retryCount;
  }

  get pagesAnalyzedClient(): number | null {
    return this.props.pagesAnalyzedClient;
  }

  get pagesAnalyzedCompetitors(): number | null {
    return this.props.pagesAnalyzedCompetitors;
  }

  get competitorsAnalyzed(): string[] {
    return this.props.competitorsAnalyzed;
  }

  get startedAt(): Date | null {
    return this.props.startedAt;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  get failedAt(): Date | null {
    return this.props.failedAt;
  }

  get timeoutAt(): Date | null {
    return this.props.timeoutAt;
  }

  get failureReason(): string | null {
    return this.props.failureReason;
  }

  get refundedAt(): Date | null {
    return this.props.refundedAt;
  }

  get refundId(): string | null {
    return this.props.refundId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ---- Computed getters ----

  get isTerminal(): boolean {
    return TERMINAL_STATUSES.has(this.props.status);
  }

  get isCrawling(): boolean {
    return this.props.status === AuditStatus.CRAWLING;
  }

  get isAnalyzing(): boolean {
    return this.props.status === AuditStatus.ANALYZING;
  }

  get isTimedOut(): boolean {
    return (
      (this.props.status === AuditStatus.CRAWLING ||
        this.props.status === AuditStatus.ANALYZING) &&
      this.props.timeoutAt !== null &&
      this.props.timeoutAt < new Date()
    );
  }

  get geoScore(): number | null {
    return this.props.storedGeoScore ?? null;
  }

  get verdict(): string | null {
    return this.props.verdict;
  }

  get topFindings(): string[] {
    return this.props.topFindings;
  }

  get actionCountCritical(): number | null {
    return this.props.actionCountCritical;
  }

  get actionCountHigh(): number | null {
    return this.props.actionCountHigh;
  }

  get actionCountMedium(): number | null {
    return this.props.actionCountMedium;
  }

  get totalActions(): number | null {
    return this.props.totalActions;
  }

  get externalPresenceScore(): number | null {
    return this.props.externalPresenceScore;
  }

  get isRefunded(): boolean {
    return this.props.refundedAt !== null;
  }

  get canBeRefunded(): boolean {
    return (
      REFUNDABLE_STATUSES.has(this.props.status) &&
      this.props.stripePaymentIntentId !== null &&
      this.props.refundedAt === null
    );
  }

  // ---- Mutations ----

  updateBrief(brief: TwinCrawlInput): Result<AuditOrder, AuditInvalidTransitionError> {
    if (this.props.status !== AuditStatus.PAID) {
      return R.err(
        new AuditInvalidTransitionError(this.props.status, 'UPDATE_BRIEF'),
      );
    }

    return R.ok(
      new AuditOrder({
        ...this.props,
        briefPayload: brief,
        updatedAt: new Date(),
      }),
    );
  }

  // ---- State transitions ----

  markPaid(
    stripePaymentIntentId: string,
  ): Result<AuditOrder, AuditInvalidTransitionError> {
    if (this.props.status !== AuditStatus.PENDING) {
      return R.err(
        new AuditInvalidTransitionError(this.props.status, AuditStatus.PAID),
      );
    }

    const now = new Date();
    return R.ok(
      new AuditOrder({
        ...this.props,
        status: AuditStatus.PAID,
        stripePaymentIntentId,
        paidAt: now,
        updatedAt: now,
      }),
    );
  }

  markCrawling(
    twinAgentId: string,
  ): Result<AuditOrder, AuditInvalidTransitionError> {
    if (this.props.status !== AuditStatus.PAID) {
      return R.err(
        new AuditInvalidTransitionError(
          this.props.status,
          AuditStatus.CRAWLING,
        ),
      );
    }

    const now = new Date();
    const timeoutAt = new Date(now.getTime() + TIMEOUT_MINUTES * 60 * 1000);
    return R.ok(
      new AuditOrder({
        ...this.props,
        status: AuditStatus.CRAWLING,
        twinAgentId,
        startedAt: now,
        timeoutAt,
        updatedAt: now,
      }),
    );
  }

  markAnalyzing(crawlData: {
    crawlDataUrl: string;
    pagesAnalyzedClient: number;
    pagesAnalyzedCompetitors: number;
    competitorsAnalyzed: string[];
  }): Result<AuditOrder, AuditInvalidTransitionError> {
    if (this.props.status !== AuditStatus.CRAWLING) {
      return R.err(
        new AuditInvalidTransitionError(
          this.props.status,
          AuditStatus.ANALYZING,
        ),
      );
    }

    const now = new Date();
    return R.ok(
      new AuditOrder({
        ...this.props,
        status: AuditStatus.ANALYZING,
        crawlDataUrl: crawlData.crawlDataUrl,
        pagesAnalyzedClient: crawlData.pagesAnalyzedClient,
        pagesAnalyzedCompetitors: crawlData.pagesAnalyzedCompetitors,
        competitorsAnalyzed: crawlData.competitorsAnalyzed,
        updatedAt: now,
      }),
    );
  }

  incrementRetry(): Result<AuditOrder, AuditInvalidTransitionError> {
    if (this.props.status !== AuditStatus.CRAWLING) {
      return R.err(
        new AuditInvalidTransitionError(this.props.status, 'INCREMENT_RETRY'),
      );
    }

    return R.ok(
      new AuditOrder({
        ...this.props,
        retryCount: this.props.retryCount + 1,
        updatedAt: new Date(),
      }),
    );
  }

  markCompleted(): Result<AuditOrder, AuditInvalidTransitionError> {
    if (this.props.status !== AuditStatus.ANALYZING) {
      return R.err(
        new AuditInvalidTransitionError(
          this.props.status,
          AuditStatus.COMPLETED,
        ),
      );
    }

    const now = new Date();
    return R.ok(
      new AuditOrder({
        ...this.props,
        status: AuditStatus.COMPLETED,
        completedAt: now,
        updatedAt: now,
      }),
    );
  }

  storeAnalysisResults(
    metadata: AnalysisMetadata,
  ): Result<AuditOrder, AuditInvalidTransitionError> {
    if (this.props.status !== AuditStatus.ANALYZING) {
      return R.err(
        new AuditInvalidTransitionError(
          this.props.status,
          'STORE_ANALYSIS_RESULTS',
        ),
      );
    }

    return R.ok(
      new AuditOrder({
        ...this.props,
        analysisDataUrl: metadata.analysisDataUrl,
        storedGeoScore: metadata.geoScore,
        verdict: metadata.verdict,
        topFindings: metadata.topFindings,
        actionCountCritical: metadata.actionCountCritical,
        actionCountHigh: metadata.actionCountHigh,
        actionCountMedium: metadata.actionCountMedium,
        totalActions: metadata.totalActions,
        externalPresenceScore: metadata.externalPresenceScore,
        updatedAt: new Date(),
      }),
    );
  }

  markAnalysisCompleted(): Result<AuditOrder, AuditInvalidTransitionError> {
    if (this.props.status !== AuditStatus.ANALYZING) {
      return R.err(
        new AuditInvalidTransitionError(
          this.props.status,
          AuditStatus.COMPLETED,
        ),
      );
    }

    const now = new Date();
    return R.ok(
      new AuditOrder({
        ...this.props,
        status: AuditStatus.COMPLETED,
        completedAt: now,
        updatedAt: now,
      }),
    );
  }

  markFailed(
    reason: string,
  ): Result<AuditOrder, AuditInvalidTransitionError> {
    if (
      this.props.status !== AuditStatus.PAID &&
      this.props.status !== AuditStatus.CRAWLING &&
      this.props.status !== AuditStatus.ANALYZING
    ) {
      return R.err(
        new AuditInvalidTransitionError(
          this.props.status,
          AuditStatus.FAILED,
        ),
      );
    }

    const now = new Date();
    return R.ok(
      new AuditOrder({
        ...this.props,
        status: AuditStatus.FAILED,
        failureReason: reason,
        failedAt: now,
        updatedAt: now,
      }),
    );
  }

  attachReport(
    reportKey: string,
  ): Result<AuditOrder, AuditInvalidTransitionError> {
    if (this.props.status !== AuditStatus.COMPLETED) {
      return R.err(
        new AuditInvalidTransitionError(this.props.status, 'ATTACH_REPORT'),
      );
    }

    const now = new Date();
    return R.ok(
      new AuditOrder({
        ...this.props,
        reportUrl: reportKey,
        updatedAt: now,
      }),
    );
  }

  markRefunded(
    refundId: string,
  ): Result<AuditOrder, AuditInvalidTransitionError> {
    if (!this.canBeRefunded) {
      return R.err(
        new AuditInvalidTransitionError(this.props.status, 'REFUND'),
      );
    }

    const now = new Date();
    return R.ok(
      new AuditOrder({
        ...this.props,
        refundId,
        refundedAt: now,
        updatedAt: now,
      }),
    );
  }

  // ---- Serialization ----

  toJSON(): AuditOrderProps {
    return { ...this.props };
  }
}

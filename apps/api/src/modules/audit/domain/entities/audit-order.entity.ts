import { AuditStatus } from '@coucou-ia/shared';
import type { AuditBrief, AuditResult } from '@coucou-ia/shared';

import type { Result } from '../../../../common/utils/result';
import { Result as R } from '../../../../common/utils/result';
import { AuditInvalidTransitionError } from '../errors/audit.errors';

export interface AuditOrderProps {
  id: string;
  userId: string;
  projectId: string;
  status: AuditStatus;
  stripePaymentIntentId: string | null;
  amountCents: number;
  paidAt: Date | null;
  briefPayload: AuditBrief;
  resultPayload: AuditResult | null;
  rawResultPayload: unknown | null;
  twinAgentId: string | null;
  reportUrl: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  failedAt: Date | null;
  timeoutAt: Date | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TERMINAL_STATUSES: ReadonlySet<AuditStatus> = new Set([
  AuditStatus.COMPLETED,
  AuditStatus.PARTIAL,
  AuditStatus.FAILED,
  AuditStatus.TIMEOUT,
  AuditStatus.SCHEMA_ERROR,
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
    resultPayload: unknown | null;
    rawResultPayload: unknown | null;
    twinAgentId: string | null;
    reportUrl: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    timeoutAt: Date | null;
    failureReason: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): AuditOrder {
    return new AuditOrder({
      ...data,
      briefPayload: data.briefPayload as AuditBrief,
      resultPayload: (data.resultPayload as AuditResult) ?? null,
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

  get briefPayload(): AuditBrief {
    return this.props.briefPayload;
  }

  get resultPayload(): AuditResult | null {
    return this.props.resultPayload;
  }

  get rawResultPayload(): unknown | null {
    return this.props.rawResultPayload;
  }

  get twinAgentId(): string | null {
    return this.props.twinAgentId;
  }

  get reportUrl(): string | null {
    return this.props.reportUrl;
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

  get isProcessing(): boolean {
    return this.props.status === AuditStatus.PROCESSING;
  }

  get isTimedOut(): boolean {
    return (
      this.props.status === AuditStatus.PROCESSING &&
      this.props.timeoutAt !== null &&
      this.props.timeoutAt < new Date()
    );
  }

  get geoScore(): number | null {
    return this.props.resultPayload?.geoScore?.overall ?? null;
  }

  // ---- Mutations ----

  updateBrief(brief: AuditBrief): Result<AuditOrder, AuditInvalidTransitionError> {
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

  markProcessing(
    twinAgentId: string,
  ): Result<AuditOrder, AuditInvalidTransitionError> {
    if (this.props.status !== AuditStatus.PAID) {
      return R.err(
        new AuditInvalidTransitionError(
          this.props.status,
          AuditStatus.PROCESSING,
        ),
      );
    }

    const now = new Date();
    const timeoutAt = new Date(now.getTime() + TIMEOUT_MINUTES * 60 * 1000);
    return R.ok(
      new AuditOrder({
        ...this.props,
        status: AuditStatus.PROCESSING,
        twinAgentId,
        startedAt: now,
        timeoutAt,
        updatedAt: now,
      }),
    );
  }

  markCompleted(
    result: AuditResult,
  ): Result<AuditOrder, AuditInvalidTransitionError> {
    if (this.props.status !== AuditStatus.PROCESSING) {
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
        resultPayload: result,
        completedAt: now,
        updatedAt: now,
      }),
    );
  }

  markPartial(
    result: AuditResult,
  ): Result<AuditOrder, AuditInvalidTransitionError> {
    if (this.props.status !== AuditStatus.PROCESSING) {
      return R.err(
        new AuditInvalidTransitionError(
          this.props.status,
          AuditStatus.PARTIAL,
        ),
      );
    }

    const now = new Date();
    return R.ok(
      new AuditOrder({
        ...this.props,
        status: AuditStatus.PARTIAL,
        resultPayload: result,
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
      this.props.status !== AuditStatus.PROCESSING
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

  markTimeout(): Result<AuditOrder, AuditInvalidTransitionError> {
    if (this.props.status !== AuditStatus.PROCESSING) {
      return R.err(
        new AuditInvalidTransitionError(
          this.props.status,
          AuditStatus.TIMEOUT,
        ),
      );
    }

    const now = new Date();
    return R.ok(
      new AuditOrder({
        ...this.props,
        status: AuditStatus.TIMEOUT,
        failedAt: now,
        updatedAt: now,
      }),
    );
  }

  markSchemaError(
    rawResult: unknown,
  ): Result<AuditOrder, AuditInvalidTransitionError> {
    if (this.props.status !== AuditStatus.PROCESSING) {
      return R.err(
        new AuditInvalidTransitionError(
          this.props.status,
          AuditStatus.SCHEMA_ERROR,
        ),
      );
    }

    const now = new Date();
    return R.ok(
      new AuditOrder({
        ...this.props,
        status: AuditStatus.SCHEMA_ERROR,
        rawResultPayload: rawResult,
        failedAt: now,
        updatedAt: now,
      }),
    );
  }

  attachReport(
    reportKey: string,
  ): Result<AuditOrder, AuditInvalidTransitionError> {
    if (
      this.props.status !== AuditStatus.COMPLETED &&
      this.props.status !== AuditStatus.PARTIAL
    ) {
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

  // ---- Serialization ----

  toJSON(): Omit<AuditOrderProps, 'rawResultPayload'> {
    const { rawResultPayload: _, ...rest } = this.props;
    return { ...rest };
  }
}

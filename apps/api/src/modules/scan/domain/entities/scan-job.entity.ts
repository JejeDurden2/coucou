import type { ScanJobStatus } from '@prisma/client';

export interface ScanJobProps {
  id: string;
  projectId: string;
  userId: string;
  promptId: string | null; // null = project scan, set = single prompt scan
  status: ScanJobStatus;
  totalPrompts: number;
  processedPrompts: number;
  successCount: number;
  failureCount: number;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export class ScanJob {
  private constructor(private readonly props: ScanJobProps) {}

  static create(props: ScanJobProps): ScanJob {
    return new ScanJob(props);
  }

  static fromPersistence(data: {
    id: string;
    projectId: string;
    userId: string;
    promptId: string | null;
    status: ScanJobStatus;
    totalPrompts: number;
    processedPrompts: number;
    successCount: number;
    failureCount: number;
    errorMessage: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
  }): ScanJob {
    return new ScanJob({
      id: data.id,
      projectId: data.projectId,
      userId: data.userId,
      promptId: data.promptId,
      status: data.status,
      totalPrompts: data.totalPrompts,
      processedPrompts: data.processedPrompts,
      successCount: data.successCount,
      failureCount: data.failureCount,
      errorMessage: data.errorMessage,
      startedAt: data.startedAt,
      completedAt: data.completedAt,
      createdAt: data.createdAt,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get projectId(): string {
    return this.props.projectId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get promptId(): string | null {
    return this.props.promptId;
  }

  get status(): ScanJobStatus {
    return this.props.status;
  }

  get totalPrompts(): number {
    return this.props.totalPrompts;
  }

  get processedPrompts(): number {
    return this.props.processedPrompts;
  }

  get successCount(): number {
    return this.props.successCount;
  }

  get failureCount(): number {
    return this.props.failureCount;
  }

  get errorMessage(): string | null {
    return this.props.errorMessage;
  }

  get startedAt(): Date | null {
    return this.props.startedAt;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get progress(): number {
    if (this.props.totalPrompts === 0) return 0;
    return this.props.processedPrompts / this.props.totalPrompts;
  }

  get isCompleted(): boolean {
    return ['COMPLETED', 'PARTIAL', 'FAILED'].includes(this.props.status);
  }

  toJSON(): ScanJobProps {
    return { ...this.props };
  }
}

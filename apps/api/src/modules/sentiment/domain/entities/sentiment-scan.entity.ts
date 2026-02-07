import type { SentimentScanResults } from '@coucou-ia/shared';

export interface SentimentScanProps {
  id: string;
  projectId: string;
  scannedAt: Date;
  globalScore: number;
  results: SentimentScanResults;
  createdAt: Date;
}

export class SentimentScan {
  private constructor(private readonly props: SentimentScanProps) {}

  static create(props: SentimentScanProps): SentimentScan {
    return new SentimentScan(props);
  }

  static fromPersistence(data: {
    id: string;
    projectId: string;
    scannedAt: Date;
    globalScore: number;
    results: unknown;
    createdAt: Date;
  }): SentimentScan {
    return new SentimentScan({
      id: data.id,
      projectId: data.projectId,
      scannedAt: data.scannedAt,
      globalScore: data.globalScore,
      results: data.results as SentimentScanResults,
      createdAt: data.createdAt,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get projectId(): string {
    return this.props.projectId;
  }

  get scannedAt(): Date {
    return this.props.scannedAt;
  }

  get globalScore(): number {
    return this.props.globalScore;
  }

  get results(): SentimentScanResults {
    return this.props.results;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toJSON(): SentimentScanProps {
    return { ...this.props };
  }
}

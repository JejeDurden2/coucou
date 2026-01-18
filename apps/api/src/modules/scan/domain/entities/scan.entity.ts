import type { LLMProvider } from '@prisma/client';

export interface CompetitorMentionData {
  name: string;
  position: number;
  keywords: string[];
}

export interface LLMResult {
  provider: LLMProvider;
  model: string;
  rawResponse: string;
  isCited: boolean;
  position: number | null;
  /** Brand's keywords if found in ranking */
  brandKeywords: string[];
  /** Keywords extracted from user query */
  queryKeywords: string[];
  /** Competitors with position and keywords */
  competitorMentions: CompetitorMentionData[];
  latencyMs: number;
  /** Whether JSON parsing succeeded */
  parseSuccess: boolean;
}

export interface ScanProps {
  id: string;
  promptId: string;
  executedAt: Date;
  results: LLMResult[];
  createdAt: Date;
}

export class Scan {
  private constructor(private readonly props: ScanProps) {}

  static create(props: ScanProps): Scan {
    return new Scan(props);
  }

  static fromPersistence(data: {
    id: string;
    promptId: string;
    executedAt: Date;
    results: unknown;
    createdAt: Date;
  }): Scan {
    return new Scan({
      id: data.id,
      promptId: data.promptId,
      executedAt: data.executedAt,
      results: Scan.normalizeResults(data.results),
      createdAt: data.createdAt,
    });
  }

  /**
   * Normalize results from persistence to handle both old and new formats.
   * Old format had: competitors: string[], citationContext: string
   * New format has: competitorMentions: CompetitorMentionData[], brandKeywords, queryKeywords, parseSuccess
   */
  private static normalizeResults(rawResults: unknown): LLMResult[] {
    if (!Array.isArray(rawResults)) return [];

    return rawResults.map((r): LLMResult => {
      // Already in new format
      if ('competitorMentions' in r && Array.isArray(r.competitorMentions)) {
        return r as LLMResult;
      }

      // Migrate from old format
      const oldResult = r as {
        provider: LLMProvider;
        model: string;
        rawResponse?: string;
        isCited: boolean;
        position: number | null;
        citationContext?: string;
        competitors?: string[];
        latencyMs: number;
      };

      return {
        provider: oldResult.provider,
        model: oldResult.model,
        rawResponse: oldResult.rawResponse ?? '',
        isCited: oldResult.isCited,
        position: oldResult.position,
        brandKeywords: [],
        queryKeywords: [],
        competitorMentions: (oldResult.competitors ?? []).map((name, idx) => ({
          name,
          position: idx + 1,
          keywords: [],
        })),
        latencyMs: oldResult.latencyMs,
        parseSuccess: true, // Assume old data was valid
      };
    });
  }

  get id(): string {
    return this.props.id;
  }

  get promptId(): string {
    return this.props.promptId;
  }

  get executedAt(): Date {
    return this.props.executedAt;
  }

  get results(): LLMResult[] {
    return this.props.results;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get isCitedByAny(): boolean {
    return this.props.results.some((r) => r.isCited);
  }

  get citationRate(): number {
    if (this.props.results.length === 0) return 0;
    const citedCount = this.props.results.filter((r) => r.isCited).length;
    return citedCount / this.props.results.length;
  }

  toJSON(): ScanProps {
    return { ...this.props };
  }
}

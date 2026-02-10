import type { LLMProvider } from '@prisma/client';
import { z } from 'zod';

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

/** Validates LLMResult[] from JSON storage — catches schema drift at persistence boundary */
const LLMResultArraySchema = z.array(
  z
    .object({
      provider: z.string(),
      model: z.string(),
      rawResponse: z.string(),
      isCited: z.boolean(),
      position: z.number().nullable(),
      brandKeywords: z.array(z.string()),
      queryKeywords: z.array(z.string()),
      competitorMentions: z.array(
        z.object({ name: z.string(), position: z.number(), keywords: z.array(z.string()) }),
      ),
      latencyMs: z.number(),
      parseSuccess: z.boolean(),
    })
    .passthrough(),
);

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
    const parsed = LLMResultArraySchema.safeParse(data.results);
    return new Scan({
      id: data.id,
      promptId: data.promptId,
      executedAt: data.executedAt,
      results: parsed.success ? (parsed.data as LLMResult[]) : [],
      createdAt: data.createdAt,
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

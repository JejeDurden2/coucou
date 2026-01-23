import type { LLMProvider, Plan } from '@prisma/client';

export const LLM_SERVICE = Symbol('LLM_SERVICE');

export interface LLMResponse {
  content: string;
  model: string;
  provider: LLMProvider;
  latencyMs: number;
}

export interface LLMQueryOptions {
  systemPrompt?: string;
}

export interface LLMPort {
  query(prompt: string, options?: LLMQueryOptions): Promise<LLMResponse>;
  getProvider(): LLMProvider;
  getModel(): string;
}

export interface LLMFailure {
  provider: LLMProvider;
  model: string;
  error: string;
}

export interface LLMQueryResult {
  successes: LLMResponse[];
  failures: LLMFailure[];
}

export interface LLMService {
  queryByPlan(prompt: string, plan: Plan): Promise<LLMQueryResult>;
}

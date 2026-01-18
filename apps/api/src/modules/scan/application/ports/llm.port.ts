import type { LLMProvider } from '@prisma/client';

export const LLM_SERVICE = Symbol('LLM_SERVICE');

export interface LLMResponse {
  content: string;
  model: string;
  latencyMs: number;
}

export interface LLMPort {
  query(prompt: string): Promise<LLMResponse>;
  getProvider(): LLMProvider;
}

export interface LLMFailure {
  provider: LLMProvider;
  error: string;
}

export interface LLMQueryResult {
  successes: Map<LLMProvider, LLMResponse>;
  failures: LLMFailure[];
}

export interface LLMService {
  queryAll(prompt: string): Promise<LLMQueryResult>;
}

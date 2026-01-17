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

export interface LLMService {
  queryAll(prompt: string): Promise<Map<LLMProvider, LLMResponse>>;
}

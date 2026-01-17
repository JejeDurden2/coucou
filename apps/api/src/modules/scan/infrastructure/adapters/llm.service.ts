import { Injectable, Logger } from '@nestjs/common';
import { LLMProvider } from '@prisma/client';

import type { LLMResponse, LLMService } from '../../application/ports/llm.port';
import { OpenAILLMAdapter } from './openai-llm.adapter';
import { AnthropicLLMAdapter } from './anthropic-llm.adapter';

@Injectable()
export class LLMServiceImpl implements LLMService {
  private readonly logger = new Logger(LLMServiceImpl.name);

  constructor(
    private readonly openaiAdapter: OpenAILLMAdapter,
    private readonly anthropicAdapter: AnthropicLLMAdapter,
  ) {}

  async queryAll(prompt: string): Promise<Map<LLMProvider, LLMResponse>> {
    const results = new Map<LLMProvider, LLMResponse>();

    const queries = [
      this.queryWithFallback(this.openaiAdapter, prompt),
      this.queryWithFallback(this.anthropicAdapter, prompt),
    ];

    const responses = await Promise.allSettled(queries);

    for (const response of responses) {
      if (response.status === 'fulfilled' && response.value) {
        results.set(response.value.provider, response.value.response);
      }
    }

    return results;
  }

  private async queryWithFallback(
    adapter: OpenAILLMAdapter | AnthropicLLMAdapter,
    prompt: string,
  ): Promise<{ provider: LLMProvider; response: LLMResponse } | null> {
    try {
      const response = await adapter.query(prompt);
      return {
        provider: adapter.getProvider(),
        response,
      };
    } catch (error) {
      this.logger.error(
        `Failed to query ${adapter.getProvider()}`,
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }
}

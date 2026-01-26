import { Logger } from '@nestjs/common';
import { LLMProvider } from '@prisma/client';

import { AnthropicClientService } from '../../../../common/infrastructure/anthropic/anthropic-client.service';
import type { LLMQueryOptions, LLMResponse } from '../../application/ports/llm.port';
import { BaseLLMAdapter, LLM_CONFIG, SYSTEM_PROMPT } from './base-llm.adapter';

export abstract class BaseAnthropicAdapter extends BaseLLMAdapter {
  protected abstract readonly logger: Logger;
  protected abstract readonly model: string;

  constructor(private readonly anthropicClient: AnthropicClientService) {
    super();
  }

  getProvider(): LLMProvider {
    return LLMProvider.ANTHROPIC;
  }

  override async query(prompt: string, options?: LLMQueryOptions): Promise<LLMResponse> {
    const startTime = Date.now();
    const systemPrompt = options?.systemPrompt ?? SYSTEM_PROMPT;

    try {
      const response = await this.anthropicClient.createMessage({
        model: this.model,
        maxTokens: LLM_CONFIG.maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        webSearch: options?.webSearch,
      });

      return {
        content: response.text,
        model: this.model,
        provider: this.getProvider(),
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`Failed to query Anthropic (${this.model})`, error);
      throw error;
    }
  }

  // Required by abstract parent but unused — query() is overridden above
  protected callApi(): Promise<Response> {
    throw new Error('Not implemented');
  }

  protected extractContent(): string {
    throw new Error('Not implemented');
  }
}

import { LLMProvider } from '@prisma/client';

import { LoggerService } from '../../../../common/logger';
import { AnthropicClientService } from '../../../../common/infrastructure/anthropic/anthropic-client.service';
import type { LLMQueryOptions, LLMResponse } from '../../application/ports/llm.port';
import { BaseLLMAdapter, LLM_CONFIG, SYSTEM_PROMPT } from './base-llm.adapter';

export abstract class BaseAnthropicAdapter extends BaseLLMAdapter {
  protected abstract readonly model: string;

  constructor(
    private readonly anthropicClient: AnthropicClientService,
    logger: LoggerService,
  ) {
    super(logger);
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
      this.logger.error('Failed to query Anthropic', error instanceof Error ? error : undefined, {
        model: this.model,
      });
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

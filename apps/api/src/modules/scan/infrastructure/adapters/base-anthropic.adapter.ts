import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider } from '@prisma/client';
import { z } from 'zod';

import type { LLMQueryOptions } from '../../application/ports/llm.port';
import { BaseLLMAdapter, LLM_CONFIG } from './base-llm.adapter';

const AnthropicResponseSchema = z.object({
  content: z.array(
    z.object({
      type: z.string(),
      text: z.string().optional(),
    }),
  ),
});

export abstract class BaseAnthropicAdapter extends BaseLLMAdapter {
  protected abstract readonly logger: Logger;
  protected abstract readonly model: string;
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    super();
    this.configService = configService;
  }

  getProvider(): LLMProvider {
    return LLMProvider.ANTHROPIC;
  }

  protected callApi(
    prompt: string,
    systemPrompt: string,
    options?: LLMQueryOptions,
  ): Promise<Response> {
    // Retrieve API key at call time to avoid storing in memory
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') ?? '';

    // Add web search tool if enabled (requires beta header)
    const webSearchConfig = options?.webSearch
      ? {
          tools: [
            {
              type: 'web_search_20250305',
              name: 'web_search',
              max_uses: 3,
            },
          ],
        }
      : {};

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    };

    // Add beta header for web search
    if (options?.webSearch) {
      headers['anthropic-beta'] = 'web-search-2025-03-05';
    }

    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.model,
        max_tokens: LLM_CONFIG.maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        ...webSearchConfig,
      }),
    });
  }

  protected extractContent(data: unknown): string {
    const result = AnthropicResponseSchema.safeParse(data);
    if (!result.success) {
      this.logger.error(`Invalid Anthropic response format: ${result.error.message}`);
      throw new Error(`Invalid Anthropic response format: ${result.error.message}`);
    }
    // With web search, there may be multiple content blocks (web_search_tool_use, web_search_tool_result, text)
    // Find the last text block which contains the final answer
    const textBlocks = result.data.content.filter((c) => c.type === 'text');
    const lastTextBlock = textBlocks[textBlocks.length - 1];
    return lastTextBlock?.text ?? '';
  }
}

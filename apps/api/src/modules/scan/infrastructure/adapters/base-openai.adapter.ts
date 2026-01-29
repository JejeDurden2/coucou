import { ConfigService } from '@nestjs/config';
import { LLMProvider } from '@prisma/client';
import { z } from 'zod';

import { LoggerService } from '../../../../common/logger';
import type { LLMQueryOptions } from '../../application/ports/llm.port';
import { BaseLLMAdapter, LLM_CONFIG } from './base-llm.adapter';

const OpenAIResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string().nullable(),
      }),
    }),
  ),
});

export abstract class BaseOpenAIAdapter extends BaseLLMAdapter {
  protected abstract readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    logger: LoggerService,
  ) {
    super(logger);
  }

  getProvider(): LLMProvider {
    return LLMProvider.OPENAI;
  }

  protected callApi(
    prompt: string,
    systemPrompt: string,
    options?: LLMQueryOptions,
  ): Promise<Response> {
    // Retrieve API key at call time to avoid storing in memory
    const apiKey = this.configService.get<string>('OPENAI_API_KEY') ?? '';

    // GPT-5.x models require max_completion_tokens instead of max_tokens
    const isGpt5Model = this.model.startsWith('gpt-5');
    const tokenParam = isGpt5Model
      ? { max_completion_tokens: LLM_CONFIG.maxTokens }
      : { max_tokens: LLM_CONFIG.maxTokens };

    // Add web search tool if enabled
    const toolsParam = options?.webSearch ? { tools: [{ type: 'web_search_preview' }] } : {};

    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        ...tokenParam,
        ...toolsParam,
        temperature: LLM_CONFIG.temperature,
      }),
    });
  }

  protected extractContent(data: unknown): string {
    const result = OpenAIResponseSchema.safeParse(data);
    if (!result.success) {
      this.logger.error('Invalid OpenAI response format', { error: result.error.message });
      throw new Error(`Invalid OpenAI response format: ${result.error.message}`);
    }
    return result.data.choices[0]?.message?.content ?? '';
  }
}

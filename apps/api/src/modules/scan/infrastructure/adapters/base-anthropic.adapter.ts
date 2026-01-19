import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider } from '@prisma/client';
import { z } from 'zod';

import { BaseLLMAdapter, SYSTEM_PROMPT, LLM_CONFIG } from './base-llm.adapter';

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
  protected readonly apiKey: string;

  constructor(configService: ConfigService) {
    super();
    this.apiKey = configService.get<string>('ANTHROPIC_API_KEY') ?? '';
  }

  getProvider(): LLMProvider {
    return LLMProvider.ANTHROPIC;
  }

  protected callApi(prompt: string): Promise<Response> {
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: LLM_CONFIG.maxTokens,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  }

  protected extractContent(data: unknown): string {
    const result = AnthropicResponseSchema.safeParse(data);
    if (!result.success) {
      this.logger.error(`Invalid Anthropic response format: ${result.error.message}`);
      throw new Error(`Invalid Anthropic response format: ${result.error.message}`);
    }
    const firstContent = result.data.content[0];
    return firstContent?.type === 'text' ? (firstContent.text ?? '') : '';
  }
}

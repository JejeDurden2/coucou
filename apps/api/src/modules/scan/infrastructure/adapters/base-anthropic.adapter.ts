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
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    super();
    this.configService = configService;
  }

  getProvider(): LLMProvider {
    return LLMProvider.ANTHROPIC;
  }

  protected callApi(prompt: string): Promise<Response> {
    // Retrieve API key at call time to avoid storing in memory
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') ?? '';
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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

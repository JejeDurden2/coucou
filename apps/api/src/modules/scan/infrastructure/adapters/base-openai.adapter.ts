import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider } from '@prisma/client';
import { z } from 'zod';

import { BaseLLMAdapter, SYSTEM_PROMPT, LLM_CONFIG } from './base-llm.adapter';

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
  protected abstract readonly logger: Logger;
  protected abstract readonly model: string;
  protected readonly apiKey: string;

  constructor(configService: ConfigService) {
    super();
    this.apiKey = configService.get<string>('OPENAI_API_KEY') ?? '';
  }

  getProvider(): LLMProvider {
    return LLMProvider.OPENAI;
  }

  protected callApi(prompt: string): Promise<Response> {
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: LLM_CONFIG.maxTokens,
        temperature: LLM_CONFIG.temperature,
      }),
    });
  }

  protected extractContent(data: unknown): string {
    const result = OpenAIResponseSchema.safeParse(data);
    if (!result.success) {
      this.logger.error(`Invalid OpenAI response format: ${result.error.message}`);
      throw new Error(`Invalid OpenAI response format: ${result.error.message}`);
    }
    return result.data.choices[0]?.message?.content ?? '';
  }
}

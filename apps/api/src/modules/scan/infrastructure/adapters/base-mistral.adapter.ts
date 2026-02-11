import { ConfigService } from '@nestjs/config';
import { LLMProvider } from '@prisma/client';
import { z } from 'zod';

import { LoggerService } from '../../../../common/logger';
import type { LLMQueryOptions } from '../../application/ports/llm.port';
import { BaseLLMAdapter, LLM_CONFIG } from './base-llm.adapter';

const MistralResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string().nullable(),
        }),
      }),
    )
    .min(1),
});

export abstract class BaseMistralAdapter extends BaseLLMAdapter {
  protected abstract readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    logger: LoggerService,
  ) {
    super(logger);
  }

  getProvider(): LLMProvider {
    return LLMProvider.MISTRAL;
  }

  protected callApi(
    prompt: string,
    systemPrompt: string,
    options?: LLMQueryOptions,
  ): Promise<Response> {
    const apiKey = this.configService.get<string>('MISTRAL_API_KEY') ?? '';

    return fetch('https://api.mistral.ai/v1/chat/completions', {
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
        max_tokens: LLM_CONFIG.maxTokens,
        temperature: LLM_CONFIG.temperature,
        ...(options?.jsonMode && { response_format: { type: 'json_object' } }),
      }),
    });
  }

  protected extractContent(data: unknown): string {
    const result = MistralResponseSchema.safeParse(data);
    if (!result.success) {
      this.logger.error('Invalid Mistral response format', { error: result.error.message });
      throw new Error(`Invalid Mistral response format: ${result.error.message}`);
    }
    return result.data.choices[0]?.message?.content ?? '';
  }
}

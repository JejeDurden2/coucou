import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider } from '@prisma/client';

import { BaseLLMAdapter, SYSTEM_PROMPT, LLM_CONFIG } from './base-llm.adapter';

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
}

@Injectable()
export class AnthropicLLMAdapter extends BaseLLMAdapter {
  protected readonly logger = new Logger(AnthropicLLMAdapter.name);
  protected readonly apiKey: string;
  protected readonly model = 'claude-3-5-haiku-latest';

  constructor(private readonly configService: ConfigService) {
    super();
    this.apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') ?? '';
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
    const response = data as AnthropicResponse;
    const firstContent = response.content?.[0];
    return firstContent?.type === 'text' ? (firstContent.text ?? '') : '';
  }
}

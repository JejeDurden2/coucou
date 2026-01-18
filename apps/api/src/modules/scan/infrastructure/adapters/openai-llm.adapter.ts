import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider } from '@prisma/client';

import { BaseLLMAdapter, SYSTEM_PROMPT, LLM_CONFIG } from './base-llm.adapter';

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

@Injectable()
export class OpenAILLMAdapter extends BaseLLMAdapter {
  protected readonly logger = new Logger(OpenAILLMAdapter.name);
  protected readonly apiKey: string;
  protected readonly model = 'gpt-4o-mini';

  constructor(private readonly configService: ConfigService) {
    super();
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') ?? '';
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
    const response = data as OpenAIResponse;
    return response.choices?.[0]?.message?.content ?? '';
  }
}

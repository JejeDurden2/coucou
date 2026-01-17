import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider } from '@prisma/client';

import type { LLMPort, LLMResponse } from '../../application/ports/llm.port';

const SYSTEM_PROMPT = `Tu es un assistant qui répond aux questions des utilisateurs de manière informative et factuelle.
Quand tu recommandes des produits, services ou marques, cite des exemples concrets et pertinents.
Réponds en français.`;

@Injectable()
export class OpenAILLMAdapter implements LLMPort {
  private readonly logger = new Logger(OpenAILLMAdapter.name);
  private readonly apiKey: string;
  private readonly model = 'gpt-4o-mini';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') ?? '';
  }

  getProvider(): LLMProvider {
    return LLMProvider.OPENAI;
  }

  async query(prompt: string): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`OpenAI API error: ${error}`);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const latencyMs = Date.now() - startTime;

      return {
        content: data.choices?.[0]?.message?.content ?? '',
        model: this.model,
        latencyMs,
      };
    } catch (error) {
      this.logger.error('Failed to query OpenAI', error);
      throw error;
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider } from '@prisma/client';

import type { LLMPort, LLMResponse } from '../../application/ports/llm.port';

const SYSTEM_PROMPT = `Tu es un assistant qui répond aux questions des utilisateurs de manière informative et factuelle.
Quand tu recommandes des produits, services ou marques, cite des exemples concrets et pertinents.
Réponds en français.`;

@Injectable()
export class AnthropicLLMAdapter implements LLMPort {
  private readonly logger = new Logger(AnthropicLLMAdapter.name);
  private readonly apiKey: string;
  private readonly model = 'claude-3-5-haiku-latest';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') ?? '';
  }

  getProvider(): LLMProvider {
    return LLMProvider.ANTHROPIC;
  }

  async query(prompt: string): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Anthropic API error: ${error}`);
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = (await response.json()) as {
        content?: Array<{ type: string; text?: string }>;
      };
      const latencyMs = Date.now() - startTime;

      const content =
        data.content?.[0]?.type === 'text' ? (data.content[0].text ?? '') : '';

      return {
        content,
        model: this.model,
        latencyMs,
      };
    } catch (error) {
      this.logger.error('Failed to query Anthropic', error);
      throw error;
    }
  }
}

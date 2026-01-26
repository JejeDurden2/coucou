import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import type { MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources/messages';
import type { ZodSchema } from 'zod';

export interface AnthropicMessageOptions {
  model: string;
  maxTokens: number;
  system?: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  temperature?: number;
  webSearch?: boolean;
  webSearchMaxUses?: number;
}

export interface AnthropicTextResponse {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

@Injectable()
export class AnthropicClientService {
  private readonly logger = new Logger(AnthropicClientService.name);
  private client: Anthropic | null = null;

  constructor(private readonly configService: ConfigService) {}

  async createMessage(options: AnthropicMessageOptions): Promise<AnthropicTextResponse> {
    const client = this.getClient();

    const tools: MessageCreateParamsNonStreaming['tools'] = options.webSearch
      ? [
          {
            type: 'web_search_20250305' as const,
            name: 'web_search',
            max_uses: options.webSearchMaxUses ?? 3,
          },
        ]
      : undefined;

    const betas: string[] | undefined = options.webSearch ? ['web-search-2025-03-05'] : undefined;

    const params: MessageCreateParamsNonStreaming = {
      model: options.model,
      max_tokens: options.maxTokens,
      messages: options.messages,
      ...(options.system && { system: options.system }),
      ...(options.temperature !== undefined && { temperature: options.temperature }),
      ...(tools && { tools }),
    };

    const response = betas
      ? await client.beta.messages.create({ ...params, betas })
      : await client.messages.create(params);

    const text = this.extractTextContent(response.content);

    return {
      text,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }

  extractJson<T>(text: string, schema: ZodSchema<T>): T {
    const cleaned = this.stripMarkdownCodeBlocks(text);
    const jsonString = this.findJsonSubstring(cleaned);
    const parsed: unknown = JSON.parse(jsonString);

    const result = schema.safeParse(parsed);
    if (!result.success) {
      this.logger.error(`JSON validation failed: ${result.error.message}`);
      throw new Error(`Invalid JSON structure: ${result.error.message}`);
    }

    return result.data;
  }

  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') ?? '';
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }

  private extractTextContent(content: Array<{ type: string; text?: string }>): string {
    // With web search, multiple content blocks exist (web_search_tool_use, web_search_tool_result, text)
    // Find the last text block which contains the final answer
    const textBlocks = content.filter(
      (block): block is { type: 'text'; text: string } => block.type === 'text' && !!block.text,
    );
    const lastTextBlock = textBlocks[textBlocks.length - 1];
    return lastTextBlock?.text ?? '';
  }

  private stripMarkdownCodeBlocks(text: string): string {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    return cleaned.trim();
  }

  private findJsonSubstring(text: string): string {
    const jsonStart = text.indexOf('{');
    const arrayStart = text.indexOf('[');

    let startIndex: number;
    if (jsonStart === -1 && arrayStart === -1) {
      throw new Error('No JSON found in response');
    } else if (jsonStart === -1) {
      startIndex = arrayStart;
    } else if (arrayStart === -1) {
      startIndex = jsonStart;
    } else {
      startIndex = Math.min(jsonStart, arrayStart);
    }

    return text.slice(startIndex);
  }
}

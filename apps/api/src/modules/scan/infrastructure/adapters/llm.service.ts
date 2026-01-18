import { Injectable, Logger } from '@nestjs/common';
import { LLMProvider } from '@prisma/client';

import type {
  LLMResponse,
  LLMService,
  LLMQueryResult,
  LLMFailure,
} from '../../application/ports/llm.port';
import { OpenAILLMAdapter } from './openai-llm.adapter';
import { AnthropicLLMAdapter } from './anthropic-llm.adapter';

type QueryResult =
  | { success: true; provider: LLMProvider; response: LLMResponse }
  | { success: false; provider: LLMProvider; error: string };

@Injectable()
export class LLMServiceImpl implements LLMService {
  private readonly logger = new Logger(LLMServiceImpl.name);

  constructor(
    private readonly openaiAdapter: OpenAILLMAdapter,
    private readonly anthropicAdapter: AnthropicLLMAdapter,
  ) {}

  async queryAll(prompt: string): Promise<LLMQueryResult> {
    const queries = [
      this.queryAdapter(this.openaiAdapter, prompt),
      this.queryAdapter(this.anthropicAdapter, prompt),
    ];

    const responses = await Promise.all(queries);

    const successes = new Map<LLMProvider, LLMResponse>();
    const failures: LLMFailure[] = [];

    for (const result of responses) {
      if (result.success) {
        successes.set(result.provider, result.response);
      } else {
        failures.push({ provider: result.provider, error: result.error });
      }
    }

    return { successes, failures };
  }

  private async queryAdapter(
    adapter: OpenAILLMAdapter | AnthropicLLMAdapter,
    prompt: string,
  ): Promise<QueryResult> {
    const provider = adapter.getProvider();
    try {
      const response = await adapter.query(prompt);
      return { success: true, provider, response };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to query ${provider}: ${errorMessage}`);
      return { success: false, provider, error: errorMessage };
    }
  }
}

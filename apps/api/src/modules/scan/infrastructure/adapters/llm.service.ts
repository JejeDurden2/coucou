import { Injectable } from '@nestjs/common';
import { LLMProvider, Plan } from '@prisma/client';
import { LLMModel, getModelsForPlan, Plan as SharedPlan } from '@coucou-ia/shared';

import { LoggerService } from '../../../../common/logger';

import type {
  LLMResponse,
  LLMService,
  LLMQueryResult,
  LLMFailure,
  LLMPort,
} from '../../application/ports/llm.port';
import { OpenAILLMAdapter } from './openai-llm.adapter';
import { GPT4oLLMAdapter } from './gpt4o-llm.adapter';
import { GPT52LLMAdapter } from './gpt52-llm.adapter';
import { ClaudeSonnetLLMAdapter } from './claude-sonnet-llm.adapter';
import { ClaudeOpusLLMAdapter } from './claude-opus-llm.adapter';

type QueryResult =
  | { success: true; response: LLMResponse }
  | { success: false; provider: LLMProvider; model: string; error: string };

@Injectable()
export class LLMServiceImpl implements LLMService {
  private readonly adaptersByModel: Map<LLMModel, LLMPort>;

  constructor(
    private readonly openaiAdapter: OpenAILLMAdapter,
    private readonly gpt4oAdapter: GPT4oLLMAdapter,
    private readonly gpt52Adapter: GPT52LLMAdapter,
    private readonly claudeSonnetAdapter: ClaudeSonnetLLMAdapter,
    private readonly claudeOpusAdapter: ClaudeOpusLLMAdapter,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(LLMServiceImpl.name);
    this.adaptersByModel = new Map<LLMModel, LLMPort>([
      [LLMModel.GPT_4O_MINI, this.openaiAdapter],
      [LLMModel.GPT_4O, this.gpt4oAdapter],
      [LLMModel.GPT_5_2, this.gpt52Adapter],
      [LLMModel.CLAUDE_SONNET_4_5, this.claudeSonnetAdapter],
      [LLMModel.CLAUDE_OPUS_4_5, this.claudeOpusAdapter],
    ]);
  }

  async queryByPlan(prompt: string, plan: Plan): Promise<LLMQueryResult> {
    const allowedModels = getModelsForPlan(plan as SharedPlan);
    const adapters = allowedModels
      .map((model) => this.adaptersByModel.get(model))
      .filter((adapter): adapter is LLMPort => adapter !== undefined);

    const queries = adapters.map((adapter) => this.queryAdapter(adapter, prompt));
    const responses = await Promise.all(queries);

    const successes: LLMResponse[] = [];
    const failures: LLMFailure[] = [];

    for (const result of responses) {
      if (result.success) {
        successes.push(result.response);
      } else {
        failures.push({ provider: result.provider, model: result.model, error: result.error });
      }
    }

    return { successes, failures };
  }

  private async queryAdapter(adapter: LLMPort, prompt: string): Promise<QueryResult> {
    const provider = adapter.getProvider();
    const model = adapter.getModel();
    try {
      const response = await adapter.query(prompt);
      return { success: true, response };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to query LLM adapter', error instanceof Error ? error : undefined, {
        provider,
        model,
      });
      return { success: false, provider, model, error: errorMessage };
    }
  }
}

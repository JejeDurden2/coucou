import { Injectable, Logger } from '@nestjs/common';
import { LLMProvider, Plan } from '@prisma/client';

import type {
  LLMResponse,
  LLMService,
  LLMQueryResult,
  LLMFailure,
  LLMPort,
} from '../../application/ports/llm.port';
import { OpenAILLMAdapter } from './openai-llm.adapter';
import { AnthropicLLMAdapter } from './anthropic-llm.adapter';
import { GPT4oLLMAdapter } from './gpt4o-llm.adapter';
import { GPT52LLMAdapter } from './gpt52-llm.adapter';
import { ClaudeSonnetLLMAdapter } from './claude-sonnet-llm.adapter';
import { ClaudeOpusLLMAdapter } from './claude-opus-llm.adapter';

const LLM_MODELS = {
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_4O: 'gpt-4o',
  GPT_5_2: 'gpt-5.2',
  CLAUDE_SONNET_4_5: 'claude-sonnet-4-5-20250514',
  CLAUDE_OPUS_4_5: 'claude-opus-4-5-20250514',
} as const;

const PLAN_MODELS: Record<Plan, string[]> = {
  [Plan.FREE]: [LLM_MODELS.GPT_4O_MINI],
  [Plan.SOLO]: [LLM_MODELS.GPT_4O_MINI, LLM_MODELS.GPT_4O, LLM_MODELS.CLAUDE_SONNET_4_5],
  [Plan.PRO]: [
    LLM_MODELS.GPT_4O_MINI,
    LLM_MODELS.GPT_4O,
    LLM_MODELS.GPT_5_2,
    LLM_MODELS.CLAUDE_SONNET_4_5,
    LLM_MODELS.CLAUDE_OPUS_4_5,
  ],
};

type QueryResult =
  | { success: true; response: LLMResponse }
  | { success: false; provider: LLMProvider; model: string; error: string };

@Injectable()
export class LLMServiceImpl implements LLMService {
  private readonly logger = new Logger(LLMServiceImpl.name);
  private readonly adaptersByModel: Map<string, LLMPort>;

  constructor(
    private readonly openaiAdapter: OpenAILLMAdapter,
    private readonly anthropicAdapter: AnthropicLLMAdapter,
    private readonly gpt4oAdapter: GPT4oLLMAdapter,
    private readonly gpt52Adapter: GPT52LLMAdapter,
    private readonly claudeSonnetAdapter: ClaudeSonnetLLMAdapter,
    private readonly claudeOpusAdapter: ClaudeOpusLLMAdapter,
  ) {
    this.adaptersByModel = new Map<string, LLMPort>([
      [LLM_MODELS.GPT_4O_MINI, this.openaiAdapter],
      [LLM_MODELS.GPT_4O, this.gpt4oAdapter],
      [LLM_MODELS.GPT_5_2, this.gpt52Adapter],
      [LLM_MODELS.CLAUDE_SONNET_4_5, this.claudeSonnetAdapter],
      [LLM_MODELS.CLAUDE_OPUS_4_5, this.claudeOpusAdapter],
    ]);
  }

  async queryAll(prompt: string): Promise<LLMQueryResult> {
    return this.queryByPlan(prompt, Plan.PRO);
  }

  async queryByPlan(prompt: string, plan: Plan): Promise<LLMQueryResult> {
    const allowedModels = PLAN_MODELS[plan];
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
      this.logger.error(`Failed to query ${provider} (${model}): ${errorMessage}`);
      return { success: false, provider, model, error: errorMessage };
    }
  }
}

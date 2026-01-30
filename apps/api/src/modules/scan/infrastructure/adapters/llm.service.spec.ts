import { LLMProvider, Plan } from '@prisma/client';
import { LLMModel, getModelsForPlan, Plan as SharedPlan } from '@coucou-ia/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { LoggerService } from '../../../../common/logger';
import type { LLMPort, LLMResponse } from '../../application/ports/llm.port';
import { LLMServiceImpl } from './llm.service';
import { OpenAILLMAdapter } from './openai-llm.adapter';
import { GPT4oLLMAdapter } from './gpt4o-llm.adapter';
import { GPT52LLMAdapter } from './gpt52-llm.adapter';
import { ClaudeSonnetLLMAdapter } from './claude-sonnet-llm.adapter';
import { ClaudeOpusLLMAdapter } from './claude-opus-llm.adapter';

const createMockLogger = (): LoggerService =>
  ({
    setContext: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
    log: vi.fn(),
  }) as unknown as LoggerService;

const createMockAdapter = (model: LLMModel, shouldFail = false): LLMPort => ({
  query: vi.fn().mockImplementation(async (): Promise<LLMResponse> => {
    if (shouldFail) {
      throw new Error(`Mock error for ${model}`);
    }
    return {
      content: `Response from ${model}`,
      model,
      provider: model.startsWith('gpt') ? LLMProvider.CHATGPT : LLMProvider.CLAUDE,
      latencyMs: 100,
    };
  }),
  getProvider: vi
    .fn()
    .mockReturnValue(model.startsWith('gpt') ? LLMProvider.CHATGPT : LLMProvider.CLAUDE),
  getModel: vi.fn().mockReturnValue(model),
});

describe('LLMServiceImpl', () => {
  let service: LLMServiceImpl;
  let mockOpenaiAdapter: LLMPort;
  let mockGpt4oAdapter: LLMPort;
  let mockGpt52Adapter: LLMPort;
  let mockClaudeSonnetAdapter: LLMPort;
  let mockClaudeOpusAdapter: LLMPort;
  let mockLogger: LoggerService;

  beforeEach(() => {
    mockOpenaiAdapter = createMockAdapter(LLMModel.GPT_4O_MINI);
    mockGpt4oAdapter = createMockAdapter(LLMModel.GPT_4O);
    mockGpt52Adapter = createMockAdapter(LLMModel.GPT_5_2);
    mockClaudeSonnetAdapter = createMockAdapter(LLMModel.CLAUDE_SONNET_4_5);
    mockClaudeOpusAdapter = createMockAdapter(LLMModel.CLAUDE_OPUS_4_5);
    mockLogger = createMockLogger();

    service = new LLMServiceImpl(
      mockOpenaiAdapter as unknown as OpenAILLMAdapter,
      mockGpt4oAdapter as unknown as GPT4oLLMAdapter,
      mockGpt52Adapter as unknown as GPT52LLMAdapter,
      mockClaudeSonnetAdapter as unknown as ClaudeSonnetLLMAdapter,
      mockClaudeOpusAdapter as unknown as ClaudeOpusLLMAdapter,
      mockLogger,
    );
  });

  describe('queryByPlan', () => {
    it('should only query GPT-4o-mini for FREE plan', async () => {
      const result = await service.queryByPlan('test prompt', Plan.FREE);

      expect(mockOpenaiAdapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockGpt4oAdapter.query).not.toHaveBeenCalled();
      expect(mockGpt52Adapter.query).not.toHaveBeenCalled();
      expect(mockClaudeSonnetAdapter.query).not.toHaveBeenCalled();
      expect(mockClaudeOpusAdapter.query).not.toHaveBeenCalled();

      expect(result.successes).toHaveLength(1);
      expect(result.successes[0].model).toBe(LLMModel.GPT_4O_MINI);
    });

    it('should query GPT-5.2 and Claude Sonnet 4.5 for SOLO plan', async () => {
      const result = await service.queryByPlan('test prompt', Plan.SOLO);

      expect(mockGpt52Adapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockClaudeSonnetAdapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockOpenaiAdapter.query).not.toHaveBeenCalled();
      expect(mockGpt4oAdapter.query).not.toHaveBeenCalled();
      expect(mockClaudeOpusAdapter.query).not.toHaveBeenCalled();

      expect(result.successes).toHaveLength(2);
    });

    it('should query GPT-5.2 and Claude Sonnet 4.5 for PRO plan', async () => {
      const result = await service.queryByPlan('test prompt', Plan.PRO);

      expect(mockGpt52Adapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockClaudeSonnetAdapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockOpenaiAdapter.query).not.toHaveBeenCalled();
      expect(mockGpt4oAdapter.query).not.toHaveBeenCalled();
      expect(mockClaudeOpusAdapter.query).not.toHaveBeenCalled();

      expect(result.successes).toHaveLength(2);
    });

    it('should handle partial failures gracefully', async () => {
      const failingClaudeSonnetAdapter = createMockAdapter(LLMModel.CLAUDE_SONNET_4_5, true);

      service = new LLMServiceImpl(
        mockOpenaiAdapter as unknown as OpenAILLMAdapter,
        mockGpt4oAdapter as unknown as GPT4oLLMAdapter,
        mockGpt52Adapter as unknown as GPT52LLMAdapter,
        failingClaudeSonnetAdapter as unknown as ClaudeSonnetLLMAdapter,
        mockClaudeOpusAdapter as unknown as ClaudeOpusLLMAdapter,
        mockLogger,
      );

      const result = await service.queryByPlan('test prompt', Plan.SOLO);

      expect(result.successes).toHaveLength(1);
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0].model).toBe(LLMModel.CLAUDE_SONNET_4_5);
      expect(result.failures[0].error).toContain('Mock error');
    });

    it('should return all failures when all models fail', async () => {
      const failingOpenaiAdapter = createMockAdapter(LLMModel.GPT_4O_MINI, true);

      service = new LLMServiceImpl(
        failingOpenaiAdapter as unknown as OpenAILLMAdapter,
        mockGpt4oAdapter as unknown as GPT4oLLMAdapter,
        mockGpt52Adapter as unknown as GPT52LLMAdapter,
        mockClaudeSonnetAdapter as unknown as ClaudeSonnetLLMAdapter,
        mockClaudeOpusAdapter as unknown as ClaudeOpusLLMAdapter,
        mockLogger,
      );

      const result = await service.queryByPlan('test prompt', Plan.FREE);

      expect(result.successes).toHaveLength(0);
      expect(result.failures).toHaveLength(1);
    });

    it('should match plan model configuration', () => {
      expect(getModelsForPlan(SharedPlan.FREE)).toEqual([LLMModel.GPT_4O_MINI]);
      expect(getModelsForPlan(SharedPlan.SOLO)).toEqual([
        LLMModel.GPT_5_2,
        LLMModel.CLAUDE_SONNET_4_5,
      ]);
      expect(getModelsForPlan(SharedPlan.PRO)).toEqual([
        LLMModel.GPT_5_2,
        LLMModel.CLAUDE_SONNET_4_5,
      ]);
    });

    it('should execute queries in parallel', async () => {
      const delays: number[] = [];
      const startTime = Date.now();

      vi.spyOn(mockGpt52Adapter, 'query').mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        delays.push(Date.now() - startTime);
        return {
          content: '',
          model: LLMModel.GPT_5_2,
          provider: LLMProvider.CHATGPT,
          latencyMs: 50,
        };
      });

      vi.spyOn(mockClaudeSonnetAdapter, 'query').mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        delays.push(Date.now() - startTime);
        return {
          content: '',
          model: LLMModel.CLAUDE_SONNET_4_5,
          provider: LLMProvider.CLAUDE,
          latencyMs: 50,
        };
      });

      await service.queryByPlan('test prompt', Plan.SOLO);

      // All queries should complete around the same time (parallel execution)
      // If sequential, total time would be ~100ms
      const totalTime = Math.max(...delays);
      expect(totalTime).toBeLessThan(80);
    });
  });
});

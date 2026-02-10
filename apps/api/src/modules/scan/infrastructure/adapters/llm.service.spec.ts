import { LLMProvider, Plan } from '@prisma/client';
import { LLMModel, getModelsForPlan, Plan as SharedPlan } from '@coucou-ia/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { LoggerService } from '../../../../common/logger';
import type { LLMPort, LLMResponse } from '../../application/ports/llm.port';
import { LLMServiceImpl } from './llm.service';
import { GPT52LLMAdapter } from './gpt52-llm.adapter';
import { ClaudeSonnetLLMAdapter } from './claude-sonnet-llm.adapter';
import { MistralSmallLLMAdapter } from './mistral-small-llm.adapter';

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

function getProviderForModel(model: LLMModel): LLMProvider {
  if (model.startsWith('gpt')) return LLMProvider.CHATGPT;
  if (model.startsWith('mistral')) return LLMProvider.MISTRAL;
  return LLMProvider.CLAUDE;
}

const createMockAdapter = (model: LLMModel, shouldFail = false): LLMPort => ({
  query: vi.fn().mockImplementation(async (): Promise<LLMResponse> => {
    if (shouldFail) {
      throw new Error(`Mock error for ${model}`);
    }
    return {
      content: `Response from ${model}`,
      model,
      provider: getProviderForModel(model),
      latencyMs: 100,
    };
  }),
  getProvider: vi.fn().mockReturnValue(getProviderForModel(model)),
  getModel: vi.fn().mockReturnValue(model),
});

describe('LLMServiceImpl', () => {
  let service: LLMServiceImpl;
  let mockGpt52Adapter: LLMPort;
  let mockClaudeSonnetAdapter: LLMPort;
  let mockMistralSmallAdapter: LLMPort;
  let mockLogger: LoggerService;

  beforeEach(() => {
    mockGpt52Adapter = createMockAdapter(LLMModel.GPT_5_2);
    mockClaudeSonnetAdapter = createMockAdapter(LLMModel.CLAUDE_SONNET_4_5);
    mockMistralSmallAdapter = createMockAdapter(LLMModel.MISTRAL_SMALL_LATEST);
    mockLogger = createMockLogger();

    service = new LLMServiceImpl(
      mockGpt52Adapter as unknown as GPT52LLMAdapter,
      mockClaudeSonnetAdapter as unknown as ClaudeSonnetLLMAdapter,
      mockMistralSmallAdapter as unknown as MistralSmallLLMAdapter,
      mockLogger,
    );
  });

  describe('queryByPlan', () => {
    it('should only query Mistral Small for FREE plan', async () => {
      const result = await service.queryByPlan('test prompt', Plan.FREE);

      expect(mockMistralSmallAdapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockGpt52Adapter.query).not.toHaveBeenCalled();
      expect(mockClaudeSonnetAdapter.query).not.toHaveBeenCalled();

      expect(result.successes).toHaveLength(1);
      expect(result.successes[0].model).toBe(LLMModel.MISTRAL_SMALL_LATEST);
    });

    it('should query all 3 models for SOLO plan', async () => {
      const result = await service.queryByPlan('test prompt', Plan.SOLO);

      expect(mockMistralSmallAdapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockGpt52Adapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockClaudeSonnetAdapter.query).toHaveBeenCalledWith('test prompt');

      expect(result.successes).toHaveLength(3);
    });

    it('should query same 3 models for PRO plan', async () => {
      const result = await service.queryByPlan('test prompt', Plan.PRO);

      expect(mockMistralSmallAdapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockGpt52Adapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockClaudeSonnetAdapter.query).toHaveBeenCalledWith('test prompt');

      expect(result.successes).toHaveLength(3);
    });

    it('should handle partial failures gracefully', async () => {
      const failingClaudeSonnetAdapter = createMockAdapter(LLMModel.CLAUDE_SONNET_4_5, true);

      service = new LLMServiceImpl(
        mockGpt52Adapter as unknown as GPT52LLMAdapter,
        failingClaudeSonnetAdapter as unknown as ClaudeSonnetLLMAdapter,
        mockMistralSmallAdapter as unknown as MistralSmallLLMAdapter,
        mockLogger,
      );

      const result = await service.queryByPlan('test prompt', Plan.SOLO);

      expect(result.successes).toHaveLength(2);
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0].model).toBe(LLMModel.CLAUDE_SONNET_4_5);
      expect(result.failures[0].error).toContain('Mock error');
    });

    it('should return all failures when all models fail', async () => {
      const failingMistralAdapter = createMockAdapter(LLMModel.MISTRAL_SMALL_LATEST, true);

      service = new LLMServiceImpl(
        mockGpt52Adapter as unknown as GPT52LLMAdapter,
        mockClaudeSonnetAdapter as unknown as ClaudeSonnetLLMAdapter,
        failingMistralAdapter as unknown as MistralSmallLLMAdapter,
        mockLogger,
      );

      const result = await service.queryByPlan('test prompt', Plan.FREE);

      expect(result.successes).toHaveLength(0);
      expect(result.failures).toHaveLength(1);
    });

    it('should match plan model configuration', () => {
      expect(getModelsForPlan(SharedPlan.FREE)).toEqual([LLMModel.MISTRAL_SMALL_LATEST]);
      expect(getModelsForPlan(SharedPlan.SOLO)).toEqual([
        LLMModel.MISTRAL_SMALL_LATEST,
        LLMModel.GPT_5_2,
        LLMModel.CLAUDE_SONNET_4_5,
      ]);
      expect(getModelsForPlan(SharedPlan.PRO)).toEqual(getModelsForPlan(SharedPlan.SOLO));
    });

    it('should execute queries in parallel', async () => {
      const delays: number[] = [];
      const startTime = Date.now();

      vi.spyOn(mockMistralSmallAdapter, 'query').mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        delays.push(Date.now() - startTime);
        return {
          content: '',
          model: LLMModel.MISTRAL_SMALL_LATEST,
          provider: LLMProvider.MISTRAL,
          latencyMs: 50,
        };
      });

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
      // If sequential, total time would be ~150ms
      const totalTime = Math.max(...delays);
      expect(totalTime).toBeLessThan(100);
    });
  });
});

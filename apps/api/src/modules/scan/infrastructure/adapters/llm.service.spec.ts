import { Plan } from '@prisma/client';
import { LLMModel, PLAN_MODELS } from '@coucou-ia/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { LLMPort, LLMResponse } from '../../application/ports/llm.port';
import { LLMServiceImpl } from './llm.service';
import { OpenAILLMAdapter } from './openai-llm.adapter';
import { AnthropicLLMAdapter } from './anthropic-llm.adapter';
import { GPT4oLLMAdapter } from './gpt4o-llm.adapter';
import { GPT52LLMAdapter } from './gpt52-llm.adapter';
import { ClaudeSonnetLLMAdapter } from './claude-sonnet-llm.adapter';
import { ClaudeOpusLLMAdapter } from './claude-opus-llm.adapter';

const createMockAdapter = (model: LLMModel, shouldFail = false): LLMPort => ({
  query: vi.fn().mockImplementation(async (): Promise<LLMResponse> => {
    if (shouldFail) {
      throw new Error(`Mock error for ${model}`);
    }
    return {
      content: `Response from ${model}`,
      model,
      provider: model.startsWith('gpt') ? 'OPENAI' : 'ANTHROPIC',
      latencyMs: 100,
    } as LLMResponse;
  }),
  getProvider: vi.fn().mockReturnValue(model.startsWith('gpt') ? 'OPENAI' : 'ANTHROPIC'),
  getModel: vi.fn().mockReturnValue(model),
});

describe('LLMServiceImpl', () => {
  let service: LLMServiceImpl;
  let mockOpenaiAdapter: LLMPort;
  let mockGpt4oAdapter: LLMPort;
  let mockGpt52Adapter: LLMPort;
  let mockClaudeSonnetAdapter: LLMPort;
  let mockClaudeOpusAdapter: LLMPort;

  beforeEach(() => {
    mockOpenaiAdapter = createMockAdapter(LLMModel.GPT_4O_MINI);
    mockGpt4oAdapter = createMockAdapter(LLMModel.GPT_4O);
    mockGpt52Adapter = createMockAdapter(LLMModel.GPT_5_2);
    mockClaudeSonnetAdapter = createMockAdapter(LLMModel.CLAUDE_SONNET_4_5);
    mockClaudeOpusAdapter = createMockAdapter(LLMModel.CLAUDE_OPUS_4_5);

    service = new LLMServiceImpl(
      mockOpenaiAdapter as unknown as OpenAILLMAdapter,
      {} as AnthropicLLMAdapter,
      mockGpt4oAdapter as unknown as GPT4oLLMAdapter,
      mockGpt52Adapter as unknown as GPT52LLMAdapter,
      mockClaudeSonnetAdapter as unknown as ClaudeSonnetLLMAdapter,
      mockClaudeOpusAdapter as unknown as ClaudeOpusLLMAdapter,
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

    it('should query GPT-4o-mini, GPT-4o, and Claude Sonnet for SOLO plan', async () => {
      const result = await service.queryByPlan('test prompt', Plan.SOLO);

      expect(mockOpenaiAdapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockGpt4oAdapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockClaudeSonnetAdapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockGpt52Adapter.query).not.toHaveBeenCalled();
      expect(mockClaudeOpusAdapter.query).not.toHaveBeenCalled();

      expect(result.successes).toHaveLength(3);
    });

    it('should query all models for PRO plan', async () => {
      const result = await service.queryByPlan('test prompt', Plan.PRO);

      expect(mockOpenaiAdapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockGpt4oAdapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockGpt52Adapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockClaudeSonnetAdapter.query).toHaveBeenCalledWith('test prompt');
      expect(mockClaudeOpusAdapter.query).toHaveBeenCalledWith('test prompt');

      expect(result.successes).toHaveLength(5);
    });

    it('should handle partial failures gracefully', async () => {
      const failingGpt4oAdapter = createMockAdapter(LLMModel.GPT_4O, true);

      service = new LLMServiceImpl(
        mockOpenaiAdapter as unknown as OpenAILLMAdapter,
        {} as AnthropicLLMAdapter,
        failingGpt4oAdapter as unknown as GPT4oLLMAdapter,
        mockGpt52Adapter as unknown as GPT52LLMAdapter,
        mockClaudeSonnetAdapter as unknown as ClaudeSonnetLLMAdapter,
        mockClaudeOpusAdapter as unknown as ClaudeOpusLLMAdapter,
      );

      const result = await service.queryByPlan('test prompt', Plan.SOLO);

      expect(result.successes).toHaveLength(2);
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0].model).toBe(LLMModel.GPT_4O);
      expect(result.failures[0].error).toContain('Mock error');
    });

    it('should return all failures when all models fail', async () => {
      const failingOpenaiAdapter = createMockAdapter(LLMModel.GPT_4O_MINI, true);

      service = new LLMServiceImpl(
        failingOpenaiAdapter as unknown as OpenAILLMAdapter,
        {} as AnthropicLLMAdapter,
        mockGpt4oAdapter as unknown as GPT4oLLMAdapter,
        mockGpt52Adapter as unknown as GPT52LLMAdapter,
        mockClaudeSonnetAdapter as unknown as ClaudeSonnetLLMAdapter,
        mockClaudeOpusAdapter as unknown as ClaudeOpusLLMAdapter,
      );

      const result = await service.queryByPlan('test prompt', Plan.FREE);

      expect(result.successes).toHaveLength(0);
      expect(result.failures).toHaveLength(1);
    });

    it('should match PLAN_MODELS configuration', () => {
      expect(PLAN_MODELS[Plan.FREE]).toEqual([LLMModel.GPT_4O_MINI]);
      expect(PLAN_MODELS[Plan.SOLO]).toEqual([
        LLMModel.GPT_4O_MINI,
        LLMModel.GPT_4O,
        LLMModel.CLAUDE_SONNET_4_5,
      ]);
      expect(PLAN_MODELS[Plan.PRO]).toEqual([
        LLMModel.GPT_4O_MINI,
        LLMModel.GPT_4O,
        LLMModel.GPT_5_2,
        LLMModel.CLAUDE_SONNET_4_5,
        LLMModel.CLAUDE_OPUS_4_5,
      ]);
    });

    it('should execute queries in parallel', async () => {
      const delays: number[] = [];
      const startTime = Date.now();

      vi.spyOn(mockOpenaiAdapter, 'query').mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        delays.push(Date.now() - startTime);
        return {
          content: '',
          model: LLMModel.GPT_4O_MINI,
          provider: 'OPENAI',
          latencyMs: 50,
        } as LLMResponse;
      });

      vi.spyOn(mockGpt4oAdapter, 'query').mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        delays.push(Date.now() - startTime);
        return {
          content: '',
          model: LLMModel.GPT_4O,
          provider: 'OPENAI',
          latencyMs: 50,
        } as LLMResponse;
      });

      vi.spyOn(mockClaudeSonnetAdapter, 'query').mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        delays.push(Date.now() - startTime);
        return {
          content: '',
          model: LLMModel.CLAUDE_SONNET_4_5,
          provider: 'ANTHROPIC',
          latencyMs: 50,
        } as LLMResponse;
      });

      await service.queryByPlan('test prompt', Plan.SOLO);

      // All queries should complete around the same time (parallel execution)
      // If sequential, total time would be ~150ms
      const totalTime = Math.max(...delays);
      expect(totalTime).toBeLessThan(120);
    });
  });
});

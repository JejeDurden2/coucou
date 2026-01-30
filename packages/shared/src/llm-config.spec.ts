import { describe, it, expect } from 'vitest';

import {
  PLAN_LLM_CONFIG,
  SENTIMENT_MODEL,
  getModelsForPlan,
  getProvidersForPlan,
} from './llm-config';
import { LLMModel, LLMProvider, Plan } from './types';

describe('llm-config', () => {
  describe('PLAN_LLM_CONFIG', () => {
    it('should define configuration for all plans', () => {
      expect(PLAN_LLM_CONFIG[Plan.FREE]).toBeDefined();
      expect(PLAN_LLM_CONFIG[Plan.SOLO]).toBeDefined();
      expect(PLAN_LLM_CONFIG[Plan.PRO]).toBeDefined();
    });

    it('should have FREE plan with only CHATGPT provider', () => {
      const config = PLAN_LLM_CONFIG[Plan.FREE];
      expect(config.providers).toEqual([LLMProvider.CHATGPT]);
      expect(config.models[LLMProvider.CHATGPT]).toBe(LLMModel.GPT_4O_MINI);
    });

    it('should have SOLO plan with both providers', () => {
      const config = PLAN_LLM_CONFIG[Plan.SOLO];
      expect(config.providers).toContain(LLMProvider.CHATGPT);
      expect(config.providers).toContain(LLMProvider.CLAUDE);
      expect(config.models[LLMProvider.CHATGPT]).toBe(LLMModel.GPT_5_2);
      expect(config.models[LLMProvider.CLAUDE]).toBe(LLMModel.CLAUDE_SONNET_4_5);
    });

    it('should have PRO plan with both providers', () => {
      const config = PLAN_LLM_CONFIG[Plan.PRO];
      expect(config.providers).toContain(LLMProvider.CHATGPT);
      expect(config.providers).toContain(LLMProvider.CLAUDE);
      expect(config.models[LLMProvider.CHATGPT]).toBe(LLMModel.GPT_5_2);
      expect(config.models[LLMProvider.CLAUDE]).toBe(LLMModel.CLAUDE_SONNET_4_5);
    });
  });

  describe('SENTIMENT_MODEL', () => {
    it('should be Claude Opus 4.5', () => {
      expect(SENTIMENT_MODEL).toBe(LLMModel.CLAUDE_OPUS_4_5);
    });
  });

  describe('getModelsForPlan', () => {
    it('should return [GPT_4O_MINI] for FREE plan', () => {
      const models = getModelsForPlan(Plan.FREE);
      expect(models).toEqual([LLMModel.GPT_4O_MINI]);
    });

    it('should return [GPT_5_2, CLAUDE_SONNET_4_5] for SOLO plan', () => {
      const models = getModelsForPlan(Plan.SOLO);
      expect(models).toHaveLength(2);
      expect(models).toContain(LLMModel.GPT_5_2);
      expect(models).toContain(LLMModel.CLAUDE_SONNET_4_5);
    });

    it('should return [GPT_5_2, CLAUDE_SONNET_4_5] for PRO plan', () => {
      const models = getModelsForPlan(Plan.PRO);
      expect(models).toHaveLength(2);
      expect(models).toContain(LLMModel.GPT_5_2);
      expect(models).toContain(LLMModel.CLAUDE_SONNET_4_5);
    });
  });

  describe('getProvidersForPlan', () => {
    it('should return [CHATGPT] for FREE plan', () => {
      const providers = getProvidersForPlan(Plan.FREE);
      expect(providers).toEqual([LLMProvider.CHATGPT]);
    });

    it('should return [CHATGPT, CLAUDE] for SOLO plan', () => {
      const providers = getProvidersForPlan(Plan.SOLO);
      expect(providers).toHaveLength(2);
      expect(providers).toContain(LLMProvider.CHATGPT);
      expect(providers).toContain(LLMProvider.CLAUDE);
    });

    it('should return [CHATGPT, CLAUDE] for PRO plan', () => {
      const providers = getProvidersForPlan(Plan.PRO);
      expect(providers).toHaveLength(2);
      expect(providers).toContain(LLMProvider.CHATGPT);
      expect(providers).toContain(LLMProvider.CLAUDE);
    });

    it('should return a new array (not the original reference)', () => {
      const providers1 = getProvidersForPlan(Plan.SOLO);
      const providers2 = getProvidersForPlan(Plan.SOLO);
      expect(providers1).not.toBe(providers2);
      expect(providers1).toEqual(providers2);
    });
  });
});

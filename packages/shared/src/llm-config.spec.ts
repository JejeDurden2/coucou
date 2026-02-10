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

    it('should have FREE plan with only MISTRAL provider', () => {
      const config = PLAN_LLM_CONFIG[Plan.FREE];
      expect(config.providers).toEqual([LLMProvider.MISTRAL]);
      expect(config.models).toEqual([LLMModel.MISTRAL_SMALL_LATEST]);
    });

    it('should have SOLO plan with all three providers and 3 models', () => {
      const config = PLAN_LLM_CONFIG[Plan.SOLO];
      expect(config.providers).toContain(LLMProvider.MISTRAL);
      expect(config.providers).toContain(LLMProvider.CHATGPT);
      expect(config.providers).toContain(LLMProvider.CLAUDE);
      expect(config.models).toEqual([
        LLMModel.MISTRAL_SMALL_LATEST,
        LLMModel.GPT_5_2,
        LLMModel.CLAUDE_SONNET_4_5,
      ]);
    });

    it('should have PRO plan with same models as SOLO', () => {
      const config = PLAN_LLM_CONFIG[Plan.PRO];
      expect(config.providers).toContain(LLMProvider.MISTRAL);
      expect(config.providers).toContain(LLMProvider.CHATGPT);
      expect(config.providers).toContain(LLMProvider.CLAUDE);
      expect(config.models).toEqual([
        LLMModel.MISTRAL_SMALL_LATEST,
        LLMModel.GPT_5_2,
        LLMModel.CLAUDE_SONNET_4_5,
      ]);
    });

    it('should not include deprecated models in any plan', () => {
      const deprecated = [LLMModel.GPT_4O_MINI, LLMModel.GPT_4O, LLMModel.CLAUDE_OPUS_4_5];
      for (const plan of Object.values(Plan)) {
        const models = PLAN_LLM_CONFIG[plan].models;
        for (const model of deprecated) {
          expect(models).not.toContain(model);
        }
      }
    });
  });

  describe('SENTIMENT_MODEL', () => {
    it('should be Mistral Medium', () => {
      expect(SENTIMENT_MODEL).toBe(LLMModel.MISTRAL_MEDIUM_LATEST);
    });
  });

  describe('getModelsForPlan', () => {
    it('should return [MISTRAL_SMALL_LATEST] for FREE plan', () => {
      const models = getModelsForPlan(Plan.FREE);
      expect(models).toEqual([LLMModel.MISTRAL_SMALL_LATEST]);
    });

    it('should return 3 models for SOLO plan', () => {
      const models = getModelsForPlan(Plan.SOLO);
      expect(models).toHaveLength(3);
      expect(models).toContain(LLMModel.MISTRAL_SMALL_LATEST);
      expect(models).toContain(LLMModel.GPT_5_2);
      expect(models).toContain(LLMModel.CLAUDE_SONNET_4_5);
    });

    it('should return 3 models for PRO plan (same as SOLO)', () => {
      const models = getModelsForPlan(Plan.PRO);
      expect(models).toHaveLength(3);
      expect(models).toEqual(getModelsForPlan(Plan.SOLO));
    });

    it('should return a new array (not the original reference)', () => {
      const models1 = getModelsForPlan(Plan.FREE);
      const models2 = getModelsForPlan(Plan.FREE);
      expect(models1).not.toBe(models2);
      expect(models1).toEqual(models2);
    });
  });

  describe('getProvidersForPlan', () => {
    it('should return [MISTRAL] for FREE plan', () => {
      const providers = getProvidersForPlan(Plan.FREE);
      expect(providers).toEqual([LLMProvider.MISTRAL]);
    });

    it('should return [MISTRAL, CHATGPT, CLAUDE] for SOLO plan', () => {
      const providers = getProvidersForPlan(Plan.SOLO);
      expect(providers).toHaveLength(3);
      expect(providers).toContain(LLMProvider.MISTRAL);
      expect(providers).toContain(LLMProvider.CHATGPT);
      expect(providers).toContain(LLMProvider.CLAUDE);
    });

    it('should return [MISTRAL, CHATGPT, CLAUDE] for PRO plan', () => {
      const providers = getProvidersForPlan(Plan.PRO);
      expect(providers).toHaveLength(3);
      expect(providers).toContain(LLMProvider.MISTRAL);
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

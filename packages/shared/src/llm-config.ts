import { LLMModel, LLMProvider, Plan } from './types';

// ============================================
// Plan LLM Configuration
// ============================================

interface PlanLLMConfiguration {
  providers: readonly LLMProvider[];
  models: readonly LLMModel[];
}

export const PLAN_LLM_CONFIG: Record<Plan, PlanLLMConfiguration> = {
  [Plan.FREE]: {
    providers: [LLMProvider.MISTRAL],
    models: [LLMModel.MISTRAL_SMALL_LATEST],
  },
  [Plan.SOLO]: {
    providers: [LLMProvider.MISTRAL, LLMProvider.CHATGPT, LLMProvider.CLAUDE],
    models: [LLMModel.MISTRAL_SMALL_LATEST, LLMModel.GPT_4O, LLMModel.CLAUDE_SONNET_4_5],
  },
  [Plan.PRO]: {
    providers: [LLMProvider.MISTRAL, LLMProvider.CHATGPT, LLMProvider.CLAUDE],
    models: [
      LLMModel.MISTRAL_SMALL_LATEST,
      LLMModel.GPT_4O,
      LLMModel.GPT_5_2,
      LLMModel.CLAUDE_SONNET_4_5,
      LLMModel.CLAUDE_OPUS_4_5,
    ],
  },
} as const;

export const SENTIMENT_MODEL = LLMModel.CLAUDE_OPUS_4_5;

// ============================================
// Utility Functions
// ============================================

export function getModelsForPlan(plan: Plan): LLMModel[] {
  return [...PLAN_LLM_CONFIG[plan].models];
}

export function getProvidersForPlan(plan: Plan): LLMProvider[] {
  return [...PLAN_LLM_CONFIG[plan].providers];
}

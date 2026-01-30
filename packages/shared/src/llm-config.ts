import { LLMModel, LLMProvider, Plan } from './types';

// ============================================
// Plan LLM Configuration
// ============================================

interface PlanLLMConfiguration {
  providers: readonly LLMProvider[];
  models: Partial<Record<LLMProvider, LLMModel>>;
}

export const PLAN_LLM_CONFIG: Record<Plan, PlanLLMConfiguration> = {
  [Plan.FREE]: {
    providers: [LLMProvider.CHATGPT],
    models: { [LLMProvider.CHATGPT]: LLMModel.GPT_4O_MINI },
  },
  [Plan.SOLO]: {
    providers: [LLMProvider.CHATGPT, LLMProvider.CLAUDE],
    models: {
      [LLMProvider.CHATGPT]: LLMModel.GPT_5_2,
      [LLMProvider.CLAUDE]: LLMModel.CLAUDE_SONNET_4_5,
    },
  },
  [Plan.PRO]: {
    providers: [LLMProvider.CHATGPT, LLMProvider.CLAUDE],
    models: {
      [LLMProvider.CHATGPT]: LLMModel.GPT_5_2,
      [LLMProvider.CLAUDE]: LLMModel.CLAUDE_SONNET_4_5,
    },
  },
} as const;

export const SENTIMENT_MODEL = LLMModel.CLAUDE_OPUS_4_5;

// ============================================
// Utility Functions
// ============================================

export function getModelsForPlan(plan: Plan): LLMModel[] {
  return Object.values(PLAN_LLM_CONFIG[plan].models);
}

export function getProvidersForPlan(plan: Plan): LLMProvider[] {
  return [...PLAN_LLM_CONFIG[plan].providers];
}

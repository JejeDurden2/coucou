import { LLMModel, LLMProvider } from './types';

// ============================================
// Model Metadata
// ============================================

export interface ModelMetadata {
  displayName: string;
  abbreviation: string;
  provider: LLMProvider;
}

// ============================================
// Explicit registry for known models
// ============================================

const MODEL_REGISTRY: Record<string, ModelMetadata> = {
  [LLMModel.GPT_4O_MINI]: {
    displayName: 'GPT-4o Mini',
    abbreviation: '4o-mini',
    provider: LLMProvider.OPENAI,
  },
  [LLMModel.GPT_4O]: {
    displayName: 'GPT-4o',
    abbreviation: '4o',
    provider: LLMProvider.OPENAI,
  },
  [LLMModel.GPT_5_2]: {
    displayName: 'GPT-5.2',
    abbreviation: '5.2',
    provider: LLMProvider.OPENAI,
  },
  [LLMModel.CLAUDE_SONNET_4_5]: {
    displayName: 'Claude Sonnet 4.5',
    abbreviation: 'Sonnet',
    provider: LLMProvider.ANTHROPIC,
  },
  [LLMModel.CLAUDE_OPUS_4_5]: {
    displayName: 'Claude Opus 4.5',
    abbreviation: 'Opus',
    provider: LLMProvider.ANTHROPIC,
  },
};

// ============================================
// Fallback parser for unknown / legacy model IDs
// ============================================

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function parseModelId(modelId: string): ModelMetadata | null {
  // Anthropic pattern: claude-{tier}-{version segments}-{YYYYMMDD}
  const anthropicMatch = modelId.match(/^claude-(\w+)-([\d]+(?:-[\d]+)*)-(\d{8})$/);
  if (anthropicMatch) {
    const tier = capitalize(anthropicMatch[1]);
    const version = anthropicMatch[2].replace(/-/g, '.');
    return {
      displayName: `Claude ${tier} ${version}`,
      abbreviation: tier,
      provider: LLMProvider.ANTHROPIC,
    };
  }

  // OpenAI pattern: gpt-{version}
  const openaiMatch = modelId.match(/^gpt-(.+)$/);
  if (openaiMatch) {
    return {
      displayName: `GPT-${openaiMatch[1]}`,
      abbreviation: openaiMatch[1],
      provider: LLMProvider.OPENAI,
    };
  }

  return null;
}

// ============================================
// Public API
// ============================================

export function getModelMetadata(modelId: string): ModelMetadata {
  const registered = MODEL_REGISTRY[modelId];
  if (registered) return registered;

  const parsed = parseModelId(modelId);
  if (parsed) return parsed;

  return {
    displayName: modelId,
    abbreviation: modelId,
    provider: LLMProvider.OPENAI,
  };
}

export function getModelDisplayName(modelId: string): string {
  return getModelMetadata(modelId).displayName;
}

export function getModelAbbreviation(modelId: string): string {
  return getModelMetadata(modelId).abbreviation;
}

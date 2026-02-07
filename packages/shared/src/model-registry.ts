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
// Model Priority (higher = more recent/preferred)
// ============================================

const MODEL_PRIORITY: Record<string, number> = {
  [LLMModel.GPT_4O_MINI]: 1,
  [LLMModel.GPT_4O]: 2,
  [LLMModel.GPT_5_2]: 3,
  [LLMModel.CLAUDE_SONNET_4_5]: 1,
  [LLMModel.CLAUDE_OPUS_4_5]: 2,
  [LLMModel.MISTRAL_SMALL_LATEST]: 1,
};

// ============================================
// Explicit registry for known models
// ============================================

const MODEL_REGISTRY: Record<string, ModelMetadata> = {
  [LLMModel.GPT_4O_MINI]: {
    displayName: 'GPT-4o Mini',
    abbreviation: '4o-mini',
    provider: LLMProvider.CHATGPT,
  },
  [LLMModel.GPT_4O]: {
    displayName: 'GPT-4o',
    abbreviation: '4o',
    provider: LLMProvider.CHATGPT,
  },
  [LLMModel.GPT_5_2]: {
    displayName: 'GPT-5.2',
    abbreviation: '5.2',
    provider: LLMProvider.CHATGPT,
  },
  [LLMModel.CLAUDE_SONNET_4_5]: {
    displayName: 'Claude Sonnet 4.5',
    abbreviation: 'Sonnet',
    provider: LLMProvider.CLAUDE,
  },
  [LLMModel.CLAUDE_OPUS_4_5]: {
    displayName: 'Claude Opus 4.5',
    abbreviation: 'Opus',
    provider: LLMProvider.CLAUDE,
  },
  [LLMModel.MISTRAL_SMALL_LATEST]: {
    displayName: 'Mistral Small',
    abbreviation: 'Small',
    provider: LLMProvider.MISTRAL,
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
      provider: LLMProvider.CLAUDE,
    };
  }

  // OpenAI pattern: gpt-{version}
  const openaiMatch = modelId.match(/^gpt-(.+)$/);
  if (openaiMatch) {
    return {
      displayName: `GPT-${openaiMatch[1]}`,
      abbreviation: openaiMatch[1],
      provider: LLMProvider.CHATGPT,
    };
  }

  // Mistral pattern: mistral-{tier}-{version}
  const mistralMatch = modelId.match(/^mistral-(\w+)(?:-(.+))?$/);
  if (mistralMatch) {
    const tier = capitalize(mistralMatch[1]);
    const suffix = mistralMatch[2] ? ` ${mistralMatch[2]}` : '';
    return {
      displayName: `Mistral ${tier}${suffix}`,
      abbreviation: tier,
      provider: LLMProvider.MISTRAL,
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
    provider: LLMProvider.CHATGPT,
  };
}

export function getModelDisplayName(modelId: string): string {
  return getModelMetadata(modelId).displayName;
}

export function getModelAbbreviation(modelId: string): string {
  return getModelMetadata(modelId).abbreviation;
}

// ============================================
// Provider Display Layer
// ============================================

export const PROVIDER_DISPLAY_NAME: Record<LLMProvider, string> = {
  [LLMProvider.CHATGPT]: 'ChatGPT',
  [LLMProvider.CLAUDE]: 'Claude',
  [LLMProvider.MISTRAL]: 'Mistral',
};

export const PROVIDER_LOGO: Record<LLMProvider, string> = {
  [LLMProvider.CHATGPT]: '/logos/chatgpt.svg',
  [LLMProvider.CLAUDE]: '/logos/claude.svg',
  [LLMProvider.MISTRAL]: '/logos/mistral.svg',
};

// Legacy provider names from before the rename (OPENAI→CHATGPT, ANTHROPIC→CLAUDE)
const LEGACY_PROVIDER_MAP: Record<string, LLMProvider> = {
  OPENAI: LLMProvider.CHATGPT,
  ANTHROPIC: LLMProvider.CLAUDE,
};

function normalizeProvider(provider: LLMProvider | string): LLMProvider {
  return LEGACY_PROVIDER_MAP[provider as string] ?? (provider as LLMProvider);
}

export function getProviderForModel(model: LLMModel): LLMProvider {
  return MODEL_REGISTRY[model]?.provider ?? LLMProvider.CHATGPT;
}

export function getDisplayNameForProvider(provider: LLMProvider | string): string {
  return PROVIDER_DISPLAY_NAME[normalizeProvider(provider)] ?? 'Unknown';
}

export function getLogoForProvider(provider: LLMProvider | string): string {
  return PROVIDER_LOGO[normalizeProvider(provider)] ?? '/logos/chatgpt.svg';
}

export function getModelPriority(modelId: string): number {
  return MODEL_PRIORITY[modelId] ?? 0;
}

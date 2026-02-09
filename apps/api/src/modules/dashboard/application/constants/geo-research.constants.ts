import type { LLMProvider } from '@prisma/client';

// ============================================
// Metadata Types
// ============================================

export type RecommendationImpact = 'high' | 'medium' | 'low';
export type RecommendationEffort = 'high' | 'medium' | 'low';
export type RecommendationCategory = 'content' | 'technical' | 'monitoring';

export interface RecommendationSource {
  claim: string;
  source: string;
  year: number;
}

// ============================================
// Sourced GEO Statistics (used in action items)
// ============================================

export const GEO_STATS = {
  PRINCETON_TRIPLE_BOOST: '+30-40%',
  FAQ_SCHEMA_BOOST: '200%',
  CONTENT_STRUCTURE_BOOST: '2,8x',
  SCHEMA_MARKUP_BOOST: '2,5x',
  LONG_CONTENT_BOOST: '180%',
  FRESHNESS_RETENTION: '3x',
  ORIGINAL_DATA_BOOST: '4x',
  EEAT_BOOST: '2x',
  WIKIPEDIA_CHATGPT_SHARE: '47,9%',
  REDDIT_PERPLEXITY_SHARE: '46,7%',
  BRAND_MENTIONS_CORRELATION: '0,664',
  PRESS_COVERAGE_CORRELATION: '0,687',
  BACKLINKS_CORRELATION: '0,218',
} as const;

// ============================================
// Source Attributions
// ============================================

export const GEO_SOURCES = {
  PRINCETON: { source: 'Princeton University GEO Research', year: 2024 },
  SEMRUSH_2025: { source: 'Semrush', year: 2025 },
  DATOS_SEMRUSH: { source: 'Datos / Semrush', year: 2025 },
  SEER_INTERACTIVE: { source: 'Seer Interactive', year: 2025 },
  ZYPPY: { source: 'Zyppy', year: 2025 },
  AIOSEO: { source: 'AIOSEO', year: 2025 },
  DETAILED: { source: 'Detailed.com', year: 2025 },
  WIRED_IMPACT: { source: 'Wired Impact', year: 2025 },
} as const;

// ============================================
// Platform Profiles (per LLM provider)
// ============================================

export interface PlatformProfile {
  displayName: string;
  serpDependency: number;
  trustEmphasis: number;
  depthEmphasis: number;
  topSourceType: string;
  topSourceShare: string;
}

export const PLATFORM_PROFILES: Record<string, PlatformProfile> = {
  CHATGPT: {
    displayName: 'ChatGPT',
    serpDependency: 63,
    trustEmphasis: 80,
    depthEmphasis: 75,
    topSourceType: 'Wikipedia',
    topSourceShare: '47,9%',
  },
  CLAUDE: {
    displayName: 'Claude',
    serpDependency: 55,
    trustEmphasis: 95,
    depthEmphasis: 94,
    topSourceType: 'Contenu approfondi',
    topSourceShare: 'N/A',
  },
  MISTRAL: {
    displayName: 'Mistral',
    serpDependency: 60,
    trustEmphasis: 75,
    depthEmphasis: 70,
    topSourceType: 'Contenu francophone',
    topSourceShare: 'N/A',
  },
};

// ============================================
// Impact / Effort Defaults per Type
// ============================================

export interface ImpactEffortConfig {
  impact: RecommendationImpact;
  effort: RecommendationEffort;
  category: RecommendationCategory;
  estimatedTimeMinutes: number;
}

export const IMPACT_EFFORT_DEFAULTS: Record<string, ImpactEffortConfig> = {
  low_citation_critical: {
    impact: 'high',
    effort: 'high',
    category: 'content',
    estimatedTimeMinutes: 480,
  },
  low_citation_warning: {
    impact: 'high',
    effort: 'medium',
    category: 'content',
    estimatedTimeMinutes: 240,
  },
  competitor_dominance: {
    impact: 'high',
    effort: 'medium',
    category: 'content',
    estimatedTimeMinutes: 240,
  },
  prompt_weakness: {
    impact: 'high',
    effort: 'medium',
    category: 'content',
    estimatedTimeMinutes: 120,
  },
  keyword_gap: {
    impact: 'medium',
    effort: 'medium',
    category: 'content',
    estimatedTimeMinutes: 180,
  },
  model_disparity: {
    impact: 'medium',
    effort: 'high',
    category: 'technical',
    estimatedTimeMinutes: 480,
  },
  position_drop: {
    impact: 'high',
    effort: 'low',
    category: 'content',
    estimatedTimeMinutes: 60,
  },
  emerging_competitor: {
    impact: 'low',
    effort: 'low',
    category: 'monitoring',
    estimatedTimeMinutes: 30,
  },
  improvement: {
    impact: 'low',
    effort: 'low',
    category: 'monitoring',
    estimatedTimeMinutes: 30,
  },
  platform_optimization: {
    impact: 'high',
    effort: 'high',
    category: 'technical',
    estimatedTimeMinutes: 480,
  },
  content_freshness: {
    impact: 'high',
    effort: 'low',
    category: 'content',
    estimatedTimeMinutes: 60,
  },
  content_structure: {
    impact: 'medium',
    effort: 'medium',
    category: 'technical',
    estimatedTimeMinutes: 240,
  },
  eeat_signal: {
    impact: 'high',
    effort: 'high',
    category: 'content',
    estimatedTimeMinutes: 480,
  },
  prompt_category_gap: {
    impact: 'medium',
    effort: 'medium',
    category: 'content',
    estimatedTimeMinutes: 180,
  },
  triple_threat_optimization: {
    impact: 'high',
    effort: 'medium',
    category: 'content',
    estimatedTimeMinutes: 180,
  },
};

// ============================================
// Platform-Specific Counter Tips
// ============================================

export function getPlatformCounterTip(provider: LLMProvider, brandName: string): string {
  switch (provider) {
    case 'CHATGPT':
      return `visez une mention sur Wikipedia et les sources institutionnelles de votre secteur`;
    case 'CLAUDE':
      return `créez des guides détaillés et fact-checkés avec des données vérifiables sur ${brandName}`;
    case 'MISTRAL':
      return `publiez du contenu francophone de qualité supérieure avec des sources européennes`;
    default:
      return `créez du contenu de qualité optimisé pour cette plateforme`;
  }
}

// ============================================
// Prompt Categories
// ============================================

export const ALL_PROMPT_CATEGORIES = [
  'Découverte',
  'Comparaison',
  "Intention d'achat",
  'Local',
] as const;

export const HIGH_INTENT_CATEGORIES = ['Comparaison', "Intention d'achat"] as const;
export const DISCOVERY_CATEGORIES = ['Découverte', 'Local'] as const;

// ============================================
// Enums (mirrored from Prisma for frontend use)
// ============================================

export enum Plan {
  FREE = 'FREE',
  SOLO = 'SOLO',
  PRO = 'PRO',
}

export enum LLMProvider {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
}

export enum LLMModel {
  GPT_4O_MINI = 'gpt-4o-mini',
  GPT_4O = 'gpt-4o',
  GPT_5_2 = 'gpt-5.2',
  CLAUDE_SONNET_4_5 = 'claude-sonnet-4-5-20250514',
  CLAUDE_OPUS_4_5 = 'claude-opus-4-5-20250514',
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  plan: Plan;
  projectCount: number;
  createdAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ============================================
// Project Types
// ============================================

export interface Project {
  id: string;
  name: string;
  brandName: string;
  brandVariants: string[];
  domain: string | null;
  lastScannedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  brandName: string;
  brandVariants: string[];
  domain?: string;
}

export interface UpdateProjectInput {
  name?: string;
  brandName?: string;
  brandVariants?: string[];
  domain?: string | null;
}

// ============================================
// Prompt Types
// ============================================

export interface Prompt {
  id: string;
  projectId: string;
  content: string;
  category: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromptInput {
  content: string;
  category?: string;
}

export interface UpdatePromptInput {
  content?: string;
  category?: string | null;
  isActive?: boolean;
}

// ============================================
// Scan Types
// ============================================

export interface CompetitorMention {
  name: string;
  position: number;
  keywords: string[];
}

export interface LLMResult {
  provider: LLMProvider;
  model: string;
  isCited: boolean;
  position: number | null;
  brandKeywords: string[];
  queryKeywords: string[];
  competitors: CompetitorMention[];
  latencyMs: number;
  parseSuccess: boolean;
}

export interface ProviderError {
  provider: string;
  error: string;
}

export interface Scan {
  id: string;
  promptId: string;
  executedAt: Date;
  results: LLMResult[];
  isCitedByAny: boolean;
  citationRate: number;
  wasSanitized?: boolean;
  skippedReason?: string;
  providerErrors?: ProviderError[];
}

export interface ScanHistory {
  scans: Scan[];
  total: number;
}

// ============================================
// Dashboard Types
// ============================================

export interface ProviderBreakdown {
  provider: LLMProvider;
  citationRate: number;
  averageRank: number | null;
  totalScans: number;
}

export interface ModelBreakdown {
  model: string;
  provider: LLMProvider;
  citationRate: number;
  averageRank: number | null;
  totalScans: number;
}

export interface Trend {
  current: number;
  previous: number;
  delta: number;
}

export interface Competitor {
  name: string;
  count: number;
}

export type CompetitorTrend = 'up' | 'down' | 'stable' | 'new';

export interface CompetitorProviderStats {
  mentions: number;
  averagePosition: number | null;
}

export interface CompetitorStatsByProvider {
  openai: CompetitorProviderStats;
  anthropic: CompetitorProviderStats;
}

export interface EnrichedCompetitor {
  name: string;
  totalMentions: number;
  averagePosition: number | null;
  statsByProvider: CompetitorStatsByProvider;
  trend: CompetitorTrend;
  trendPercentage: number | null;
  keywords: string[];
  firstSeenAt: Date;
  lastSeenAt: Date;
  lastContext: string | null;
}

export interface ModelResult {
  model: string;
  provider: LLMProvider;
  isCited: boolean;
  position: number | null;
}

export interface PromptStat {
  promptId: string;
  content: string;
  category: string | null;
  lastScanAt: Date | null;
  modelResults: ModelResult[];
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface TimeSeriesTrends {
  citationRate: TimeSeriesPoint[];
  averageRank: TimeSeriesPoint[];
  mentionCount: TimeSeriesPoint[];
}

export interface DashboardStats {
  globalScore: number;
  averageRank: number | null;
  breakdown: ProviderBreakdown[];
  modelBreakdown: ModelBreakdown[];
  trend: Trend;
  trends: TimeSeriesTrends;
  topCompetitors: Competitor[];
  enrichedCompetitors: EnrichedCompetitor[];
  promptStats: PromptStat[];
  totalScans: number;
  lastScanAt: Date | null;
}

// ============================================
// Plan Limits
// ============================================

export interface PlanLimits {
  projects: number;
  promptsPerProject: number;
  scanFrequency: 'manual' | 'weekly' | 'daily';
  retentionDays: number;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  [Plan.FREE]: {
    projects: 1,
    promptsPerProject: 2,
    scanFrequency: 'weekly',
    retentionDays: 30,
  },
  [Plan.SOLO]: {
    projects: 5,
    promptsPerProject: 10,
    scanFrequency: 'weekly',
    retentionDays: 180,
  },
  [Plan.PRO]: {
    projects: 15,
    promptsPerProject: 50,
    scanFrequency: 'daily',
    retentionDays: 365 * 10, // "unlimited"
  },
};

export const PLAN_MODELS: Record<Plan, LLMModel[]> = {
  [Plan.FREE]: [LLMModel.GPT_4O_MINI],
  [Plan.SOLO]: [LLMModel.GPT_4O_MINI, LLMModel.GPT_4O, LLMModel.CLAUDE_SONNET_4_5],
  [Plan.PRO]: [
    LLMModel.GPT_4O_MINI,
    LLMModel.GPT_4O,
    LLMModel.GPT_5_2,
    LLMModel.CLAUDE_SONNET_4_5,
    LLMModel.CLAUDE_OPUS_4_5,
  ],
};

// ============================================
// Pricing Configuration
// ============================================

export interface PlanPricing {
  price: number;
  period: 'month';
  description: string;
  features: string[];
  isPopular?: boolean;
}

export const PLAN_PRICING: Record<Plan, PlanPricing> = {
  [Plan.FREE]: {
    price: 0,
    period: 'month',
    description: 'Pour tester la plateforme',
    features: [
      '1 marque',
      '2 prompts',
      'GPT-4o-mini',
      '1 scan/prompt/semaine',
      'Historique 30 jours',
    ],
  },
  [Plan.SOLO]: {
    price: 29,
    period: 'month',
    description: 'Pour les entrepreneurs et freelances',
    features: [
      '5 marques',
      '10 prompts par marque',
      'GPT-4o-mini, GPT-4o, Claude Sonnet 4.5',
      '1 scan/prompt/semaine',
      'Historique 6 mois',
      'Support email',
    ],
  },
  [Plan.PRO]: {
    price: 79,
    period: 'month',
    description: 'Pour les agences et grandes marques',
    features: [
      '15 marques',
      '50 prompts par marque',
      'Tous les modèles + Claude Opus 4.5, GPT-5.2',
      '1 scan/prompt/jour',
      'Historique illimité',
      'Support prioritaire 24h',
    ],
    isPopular: true,
  },
};

// ============================================
// Recommendations Types
// ============================================

export type RecommendationType =
  | 'low_citation'
  | 'competitor_dominance'
  | 'provider_disparity'
  | 'prompt_weakness'
  | 'improvement';

export type RecommendationSeverity = 'info' | 'warning' | 'critical';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  severity: RecommendationSeverity;
  title: string;
  description: string;
  actionItems: string[];
  relatedPromptIds?: string[];
  metadata?: Record<string, unknown>;
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  generatedAt: Date;
}

// ============================================
// API Error Response
// ============================================

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  path: string;
}

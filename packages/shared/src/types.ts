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
  CLAUDE_SONNET_4_5 = 'claude-sonnet-4-5-20250929',
  CLAUDE_OPUS_4_5 = 'claude-opus-4-5-20251101',
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
  lastInactivityEmailAt?: Date;
  emailNotificationsEnabled: boolean;
  lastScanAt?: Date;
  isOAuthUser?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ============================================
// Project Types
// ============================================

export interface BrandContext {
  businessType: string;
  locality: string | null;
  mainOfferings: string[];
  targetAudience: string;
  extractedAt: string;
}

export interface Project {
  id: string;
  name: string;
  brandName: string;
  brandVariants: string[];
  domain: string;
  brandContext: BrandContext | null;
  lastScannedAt: Date | null;
  lastAutoScanAt: Date | null;
  nextAutoScanAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  brandName: string;
  brandVariants: string[];
  domain: string;
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

export const PROMPT_CATEGORIES = [
  'Découverte',
  'Comparaison',
  "Intention d'achat",
  'Local',
] as const;

export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];

export interface Prompt {
  id: string;
  projectId: string;
  content: string;
  category: string | null;
  isActive: boolean;
  lastScannedAt: Date | null;
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

export interface PromptPerformance {
  promptId: string;
  content: string;
  category: PromptCategory | null;
  citationRate: number;
  averageRank: number;
  trend: number;
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
// Scan Job Types (async scan processing)
// ============================================

export type ScanJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';

export interface ScanJobResponse {
  jobId: string;
  status: ScanJobStatus;
  totalPrompts: number;
  createdAt: string;
}

export interface ScanJobStatusResponse {
  jobId: string;
  status: ScanJobStatus;
  totalPrompts: number;
  processedPrompts: number;
  successCount: number;
  failureCount: number;
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  scans?: Scan[];
  errorMessage?: string;
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

export type ModelTrend = 'up' | 'down' | 'stable';

export interface ModelPerformance extends ModelBreakdown {
  trend: ModelTrend;
  trendPercentage: number | null;
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

export interface CompetitorModelStats {
  model: string;
  mentions: number;
  averagePosition: number | null;
}

export interface EnrichedCompetitor {
  name: string;
  totalMentions: number;
  averagePosition: number | null;
  previousAveragePosition: number | null;
  statsByModel: CompetitorModelStats[];
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
// Historical Stats Types
// ============================================

export type AggregationLevel = 'day' | 'week' | 'month';

export interface MetricWithVariation {
  current: number;
  previous: number | null;
  variation: number | null;
}

export interface HistoricalStatsSummary {
  citationRate: MetricWithVariation;
  averageRank: MetricWithVariation;
  totalScans: MetricWithVariation;
  competitorsCount: MetricWithVariation;
}

export type SimpleTrend = 'up' | 'down' | 'stable';

export interface HistoricalModelBreakdown {
  model: string;
  citationRate: number;
  averageRank: number | null;
  trend: SimpleTrend;
  scansCount: number;
}

export interface HistoricalPromptBreakdown {
  promptId: string;
  promptText: string;
  category: string | null;
  citationRate: number;
  averageRank: number | null;
  trend: SimpleTrend;
}

export interface HistoricalCompetitorRanking {
  name: string;
  mentions: number;
  shareOfVoice: number;
  trend: SimpleTrend;
}

export type InsightType = 'positive' | 'warning' | 'neutral';

export interface HistoricalInsight {
  type: InsightType;
  message: string;
  ctaType?: 'recommendations' | 'prompts';
}

export interface HistoricalStats {
  dateRange: { start: string; end: string };
  effectiveDateRange: { start: string; end: string };
  planLimit: { maxDays: number | null; isLimited: boolean };
  aggregation: AggregationLevel;
  citationRate: TimeSeriesPoint[];
  averageRank: TimeSeriesPoint[];
  rankByModel: Record<string, TimeSeriesPoint[]>;
  competitorTrends: Array<{ name: string; timeSeries: TimeSeriesPoint[] }>;
  summary: HistoricalStatsSummary;
  modelBreakdown: HistoricalModelBreakdown[];
  promptBreakdown: HistoricalPromptBreakdown[];
  competitorRanking: HistoricalCompetitorRanking[];
  insight: HistoricalInsight;
}

/**
 * Check if a plan can access stats
 */
export function canAccessStats(plan: Plan): boolean {
  return plan !== Plan.FREE;
}

/**
 * Check if a plan can access sentiment analysis
 */
export function canAccessSentiment(plan: Plan): boolean {
  return plan === Plan.SOLO || plan === Plan.PRO;
}

/**
 * Get stats retention days by plan
 * @returns number of days or null (unlimited for PRO)
 */
export function getStatsRetentionDays(plan: Plan): number | null {
  if (plan === Plan.FREE) return null; // no access
  if (plan === Plan.SOLO) return 30;
  return null; // PRO = unlimited
}

/**
 * Determine aggregation level based on date range
 */
export function getAggregationLevel(days: number): AggregationLevel {
  if (days <= 90) return 'day';
  if (days <= 365) return 'week';
  return 'month';
}

// ============================================
// Sentiment Analysis Types
// ============================================

export interface SentimentResult {
  s: number; // score 0-100
  t: string[]; // themes/attributs (3-5 items)
  kp: string[]; // keywords positifs (3-5 items)
  kn: string[]; // keywords négatifs (3-5 items)
}

export interface SentimentScanResults {
  gpt: SentimentResult;
  claude: SentimentResult;
}

export interface SentimentScan {
  id: string;
  projectId: string;
  scannedAt: Date;
  globalScore: number;
  results: SentimentScanResults;
  createdAt: Date;
}

export interface SentimentHistoryPoint {
  date: Date;
  score: number;
}

export interface SentimentHistory {
  scans: SentimentHistoryPoint[];
}

export interface LatestSentimentResponse {
  scan: SentimentScan | null;
  nextScanDate: Date;
}

// ============================================
// Plan Limits
// ============================================

export interface PlanLimits {
  projects: number;
  promptsPerProject: number;
  autoGeneratedPrompts: number;
  scanFrequency: 'manual' | 'weekly' | 'daily';
  scanCooldownMs: number;
  retentionDays: number;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  [Plan.FREE]: {
    projects: 1,
    promptsPerProject: 2,
    autoGeneratedPrompts: 2,
    scanFrequency: 'weekly',
    scanCooldownMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    retentionDays: 30,
  },
  [Plan.SOLO]: {
    projects: 5,
    promptsPerProject: 10,
    autoGeneratedPrompts: 5,
    scanFrequency: 'weekly',
    scanCooldownMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    retentionDays: 180,
  },
  [Plan.PRO]: {
    projects: 15,
    promptsPerProject: 50,
    autoGeneratedPrompts: 5,
    scanFrequency: 'daily',
    scanCooldownMs: 24 * 60 * 60 * 1000, // 1 day
    retentionDays: 365 * 10, // "unlimited"
  },
};

/**
 * Calculate scan availability for a prompt based on plan limits
 * @returns Object with canScan boolean and nextAvailableAt date (if applicable)
 */
export function getScanAvailability(
  lastScannedAt: Date | null,
  plan: Plan,
): { canScan: boolean; nextAvailableAt: Date | null } {
  if (lastScannedAt === null) {
    return { canScan: true, nextAvailableAt: null };
  }

  const cooldownMs = PLAN_LIMITS[plan].scanCooldownMs;
  const lastScanTime = new Date(lastScannedAt).getTime();
  const nextAvailableTime = lastScanTime + cooldownMs;
  const now = Date.now();

  if (now >= nextAvailableTime) {
    return { canScan: true, nextAvailableAt: null };
  }

  return {
    canScan: false,
    nextAvailableAt: new Date(nextAvailableTime),
  };
}

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
    features: ['1 marque', '2 prompts', 'GPT-4o-mini', '1 analyse/prompt/semaine'],
  },
  [Plan.SOLO]: {
    price: 39,
    period: 'month',
    description: 'Pour les entrepreneurs et freelances',
    features: [
      '5 marques',
      '10 prompts par marque',
      'GPT-4o-mini, GPT-4o, Claude Sonnet 4.5',
      '2 analyses/prompt/semaine',
      'Analyse sentiment',
      'Historique 30 jours',
      'Support email',
    ],
    isPopular: true,
  },
  [Plan.PRO]: {
    price: 99,
    period: 'month',
    description: 'Pour les agences et grandes marques',
    features: [
      '15 marques',
      '50 prompts par marque',
      'Tous les modèles + Claude Opus 4.5, GPT-5.2',
      '1 analyse/prompt/jour',
      'Analyse sentiment',
      'Historique illimité',
      'Support prioritaire 24h',
    ],
  },
};

// ============================================
// Onboarding Types
// ============================================

export interface GeneratePromptsResponse {
  prompts: Prompt[];
}

export interface EnqueuedJobResponse {
  jobId: string;
}

export interface OnboardingJobStatusResponse {
  status: string;
  result?: { status: string; promptsCreated: number };
}

// ============================================
// Recommendations Types
// ============================================

export type RecommendationType =
  | 'low_citation'
  | 'competitor_dominance'
  | 'prompt_weakness'
  | 'keyword_gap'
  | 'model_disparity'
  | 'position_drop'
  | 'emerging_competitor'
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

// ============================================
// Subscription Types
// ============================================

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
}

export interface SubscriptionInfo {
  plan: Plan;
  status: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface DowngradeResponse {
  success: boolean;
  effectiveDate: string;
  currentPlan: Plan;
  message: string;
}

export interface CancelDowngradeResponse {
  success: boolean;
  currentPlan: Plan;
  message: string;
}

// ─── 10. Support ───────────────────────────────────────────────

export type SupportCategory = 'bug' | 'question' | 'billing' | 'other';

export const SUPPORT_CATEGORIES: Record<SupportCategory, string> = {
  bug: 'Bug',
  question: 'Question',
  billing: 'Facturation',
  other: 'Autre',
};

export const SUPPORT_MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024; // 5 MB

export interface CreateSupportRequestInput {
  category: SupportCategory;
  subject: string;
  message: string;
  screenshot?: string;
  projectId?: string;
}

export interface SupportRequestResponse {
  success: boolean;
  messageId?: string;
}

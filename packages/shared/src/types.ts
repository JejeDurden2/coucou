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

export interface PromptStat {
  promptId: string;
  content: string;
  category: string | null;
  lastScanAt: Date | null;
  openai: { isCited: boolean; position: number | null } | null;
  anthropic: { isCited: boolean; position: number | null } | null;
}

export interface DashboardStats {
  globalScore: number;
  averageRank: number | null;
  breakdown: ProviderBreakdown[];
  trend: Trend;
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
    promptsPerProject: 3,
    scanFrequency: 'manual',
    retentionDays: 30,
  },
  [Plan.SOLO]: {
    projects: 5,
    promptsPerProject: 20,
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
    features: ['1 marque', '3 prompts', 'Scans manuels', 'Historique 30 jours'],
  },
  [Plan.SOLO]: {
    price: 29,
    period: 'month',
    description: 'Pour les entrepreneurs et freelances',
    features: [
      '5 marques',
      '20 prompts par marque',
      'Scans hebdomadaires automatiques',
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
      'Scans quotidiens automatiques',
      'Historique illimité',
      'Support prioritaire',
      'Export des données',
    ],
    isPopular: true,
  },
};

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

// ============================================
// Enums (mirrored from Prisma for frontend use)
// ============================================

export enum Plan {
  FREE = 'FREE',
  SOLO = 'SOLO',
  PRO = 'PRO',
  AGENCY = 'AGENCY',
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

export interface LLMResult {
  provider: LLMProvider;
  model: string;
  isCited: boolean;
  citationContext: string | null;
  position: number | null;
  competitors: string[];
  latencyMs: number;
}

export interface Scan {
  id: string;
  promptId: string;
  executedAt: Date;
  results: LLMResult[];
  isCitedByAny: boolean;
  citationRate: number;
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
  breakdown: ProviderBreakdown[];
  trend: Trend;
  topCompetitors: Competitor[];
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
    projects: 3,
    promptsPerProject: 15,
    scanFrequency: 'weekly',
    retentionDays: 365,
  },
  [Plan.PRO]: {
    projects: 10,
    promptsPerProject: 50,
    scanFrequency: 'weekly',
    retentionDays: 365,
  },
  [Plan.AGENCY]: {
    projects: 25,
    promptsPerProject: 150,
    scanFrequency: 'daily',
    retentionDays: 365,
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

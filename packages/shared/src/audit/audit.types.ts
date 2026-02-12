// ============================================
// Audit Status
// ============================================

export enum AuditStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  PARTIAL = 'PARTIAL',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
  SCHEMA_ERROR = 'SCHEMA_ERROR',
}

// ============================================
// Twin Input — Brief envoyé à l'agent Twin
// ============================================

export interface AuditBrief {
  mission: string;

  brand: {
    name: string;
    domain: string;
    variants: string[];
    pagesToAudit?: string[];
    maxPagesToDiscover?: number;
    context: {
      businessType: string;
      locality: string;
      offerings: string;
      audience: string;
    };
  };

  scanData: {
    summary: {
      totalScans: number;
      dateRange: string;
      globalCitationRate: number;
      globalAvgPosition: number;
      trend: 'improving' | 'stable' | 'declining';
    };
    byProvider: Record<
      string,
      {
        citationRate: number;
        avgPosition: number;
      }
    >;
    sentiment: {
      score: number;
      themes: string[];
      positiveTerms: string[];
      negativeTerms: string[];
      rawSummary: string;
    };
    promptResults: PromptResult[];
  };

  competitors: {
    primary: CompetitorInput[];
    crawlCompetitors?: boolean;
    maxPagesPerCompetitor?: number;
  };

  callback: {
    url: string;
    authHeader?: string;
    auditId: string;
  };

  outputFormat: {
    schema: 'audit_result_v1';
    sections: (
      | 'geo_score'
      | 'site_audit'
      | 'competitor_benchmark'
      | 'action_plan'
      | 'external_presence'
    )[];
    language: 'fr' | 'en';
  };
}

export interface PromptResult {
  prompt: string;
  category: string;
  results: Record<
    string,
    {
      cited: boolean;
      position: number | null;
      competitors: string[];
    }
  >;
}

export interface CompetitorInput {
  name: string;
  domain: string;
  citationRate: number;
  avgPosition: number;
  detectedOn: string[];
  associatedKeywords: string[];
}

// ============================================
// Twin Output — Résultat retourné par l'agent
// ============================================

export interface TwinWebhookPayload {
  auditId: string;
  status: 'completed' | 'partial' | 'failed';
  error?: string;
  result?: AuditResult;
}

export interface AuditResult {
  geoScore: {
    overall: number;
    structure: number;
    content: number;
    technical: number;
    competitive: number;
    methodology: string;
    mainStrengths: string[];
    mainWeaknesses: string[];
  };

  siteAudit: {
    pagesAnalyzed: PageAudit[];
  };

  competitorBenchmark: CompetitorBenchmark[];

  actionPlan: {
    quickWins: ActionItem[];
    shortTerm: ActionItem[];
    mediumTerm: ActionItem[];
  };

  externalPresence: {
    sourcesAudited: ExternalSource[];
    presenceScore: number;
    mainGaps: string[];
  };

  meta: {
    pagesAnalyzedClient: number;
    pagesAnalyzedCompetitors: number;
    executionTimeSeconds: number;
    completedAt: string;
  };
}

export interface PageAudit {
  url: string;
  title: string;
  metaDescription: string;
  wordCount: number;
  type:
    | 'homepage'
    | 'about'
    | 'product'
    | 'blog_post'
    | 'faq'
    | 'contact'
    | 'other';
  findings: Finding[];
  schemaOrg: {
    present: boolean;
    types: string[];
    completeness: number;
  };
  headingStructure: {
    valid: boolean;
    h1Count: number;
    issues: string[];
  };
  eeatScore: number;
  factualDensity: number;
  hasStructuredFAQ: boolean;
  internalLinks: number;
  externalAuthoritySources: number;
}

export interface Finding {
  category: 'structure' | 'content' | 'technical' | 'seo';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  recommendation: string;
}

export interface CompetitorBenchmark {
  name: string;
  domain: string;
  geoScore: number;
  strengths: string[];
  clientGaps: string[];
}

export interface ExternalSource {
  source: string;
  found: boolean;
  url?: string;
  quality: 'absent' | 'minimal' | 'partial' | 'complete';
  issues: string[];
  recommendation: string;
}

export interface ActionItem {
  id: string;
  title: string;
  type:
    | 'optimize_page'
    | 'create_content'
    | 'add_schema'
    | 'create_faq'
    | 'create_llm_page'
    | 'add_citations'
    | 'improve_eeat'
    | 'improve_external_presence';
  targetUrl: string | null;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedImpact: number;
  estimatedEffort: number;
  details: string;
  executionReady: boolean;

  contentBrief?: {
    targetKeywords: string[];
    suggestedTitle: string;
    outline: string[];
    targetWordCount: number;
    referenceSources: string[];
    suggestedQuestions?: string[];
  };

  technicalSpec?: {
    schemaType?: string;
    codeSnippet?: string;
  };
}

// ============================================
// Audit DTOs (Frontend ↔ API)
// ============================================

export interface CreateAuditCheckoutDto {
  projectId: string;
}

export interface AuditOrderDto {
  id: string;
  projectId: string;
  status: AuditStatus;
  geoScore: number | null;
  reportUrl: string | null;
  errorMessage: string | null;
  result: AuditResult | null;
  createdAt: string;
  paidAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

// ============================================
// GET /projects/:projectId/audit — Latest audit
// ============================================

interface AuditResponseInProgress {
  hasAudit: true;
  status: AuditStatus.PENDING | AuditStatus.PAID | AuditStatus.PROCESSING;
  createdAt: string;
  paidAt: string | null;
  startedAt: string | null;
}

interface AuditResponseCompleted {
  hasAudit: true;
  status: AuditStatus.COMPLETED | AuditStatus.PARTIAL;
  createdAt: string;
  result: AuditResult;
  reportUrl: string | null;
  completedAt: string;
}

interface AuditResponseFailed {
  hasAudit: true;
  status: AuditStatus.FAILED | AuditStatus.TIMEOUT | AuditStatus.SCHEMA_ERROR;
  createdAt: string;
  failureReason: string | null;
}

export type LatestAuditResponseDto =
  | { hasAudit: false }
  | AuditResponseInProgress
  | AuditResponseCompleted
  | AuditResponseFailed;

// ============================================
// GET /projects/:projectId/audit/history
// ============================================

export interface AuditHistoryItemDto {
  id: string;
  status: AuditStatus;
  geoScore: number | null;
  createdAt: string;
}

export interface AuditHistoryResponseDto {
  audits: AuditHistoryItemDto[];
}

// ============================================
// Audit Status
// ============================================

export enum AuditStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CRAWLING = 'CRAWLING',
  ANALYZING = 'ANALYZING',
  /** @deprecated Remplacé par CRAWLING + ANALYZING */
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  /** @deprecated Sera consolidé avec COMPLETED */
  PARTIAL = 'PARTIAL',
  FAILED = 'FAILED',
  /** @deprecated Sera consolidé avec FAILED */
  TIMEOUT = 'TIMEOUT',
  /** @deprecated Sera consolidé avec FAILED */
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
// Twin Crawl v2 — Input
// ============================================

export interface TwinCrawlInput {
  brand: {
    name: string;
    domain: string;
    variants: string[];
    context: {
      businessType: string;
      locality: string;
      offerings: string;
      audience: string;
    };
  };

  competitors: {
    primary: Array<{ name: string; domain: string }>;
    maxPagesPerCompetitor?: number;
  };

  scanData: {
    clientCitationRate: number;
    totalQueriesTested: number;
    clientMentionsCount: number;
    averageSentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
    positionsWhenCited: number[];
    topPerformingQueries: string[];
    queriesNotCited: string[];
  };

  callback: {
    url: string;
    auditId: string;
  };

  outputFormat: string;
}

// ============================================
// Twin Crawl v2 — Observations (retour webhook)
// ============================================

export type TwinObservationPageType =
  | 'homepage'
  | 'about'
  | 'service'
  | 'blog'
  | 'pricing'
  | 'faq'
  | 'legal'
  | 'contact'
  | 'other';

export interface TwinObservationPage {
  url: string;
  type: TwinObservationPageType;
  title: string | null;
  metaDescription: string | null;
  metaDescriptionLength: number;
  wordCount: number;
  language: string;

  // Heading & structure
  h1Count: number;
  h1Text: string | null;
  headingHierarchyValid: boolean;

  // Schema.org
  hasSchemaOrg: boolean;
  schemaOrgTypes: string[];
  hasFAQSchema: boolean;
  hasArticleSchema: boolean;
  hasProductSchema: boolean;
  hasBreadcrumbSchema: boolean;
  hasBreadcrumbNav: boolean;

  // OpenGraph
  hasOpenGraph: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: boolean;

  // Canonical & i18n
  hasCanonical: boolean;
  canonicalMatchesUrl: boolean;
  hasHreflang: boolean;

  // Content quality
  factualStatements: number;
  totalSentences: number;
  directAnswerInFirst100Words: boolean;
  hasStructuredFAQ: boolean;
  faqCount: number;

  // Author / dates
  hasAuthorInfo: boolean;
  authorName: string | null;
  authorCredentials: string | null;
  hasDatePublished: boolean;
  datePublished: string | null;
  hasDateModified: boolean;
  dateModified: string | null;

  // Links & sources
  externalAuthoritySources: string[];
  externalAuthoritySourcesCount: number;
  internalLinksCount: number;
  internalLinksToKeyPages: number;
  uniqueTopicsCovered: string[];

  // Technical
  httpStatus: number;
  hasHttps: boolean;
  imagesTotal: number;
  imagesWithAlt: number;
  hasMobileViewport: boolean;
}

export interface TwinObservationTechnical {
  hasSitemap: boolean;
  sitemapUrl: string | null;
  sitemapPageCount: number | null;
  hasRobotsTxt: boolean;
  robotsAllowsCrawling: boolean;
  loadTimeMs: number | null;
  ttfbMs: number | null;
}

export interface TwinExternalWikipedia {
  found: boolean;
  url: string | null;
  articleLength: 'short' | 'medium' | 'long' | null;
  hasInfobox: boolean | null;
}

export interface TwinExternalTrustpilot {
  found: boolean;
  url: string | null;
  rating: number | null;
  reviewCount: number | null;
  claimed: boolean | null;
}

export interface TwinExternalGoogleBusiness {
  found: boolean;
  rating: number | null;
  reviewCount: number | null;
}

export interface TwinExternalSimple {
  found: boolean;
  url: string | null;
}

export interface TwinExternalLinkedIn {
  found: boolean;
  url: string | null;
  followerCount: number | null;
}

export interface TwinExternalPressMentions {
  count: number;
  sources: string[];
}

export interface TwinObservationExternal {
  wikipedia: TwinExternalWikipedia;
  trustpilot: TwinExternalTrustpilot;
  googleBusiness: TwinExternalGoogleBusiness;
  pagesJaunes: TwinExternalSimple;
  societecom: TwinExternalSimple;
  crunchbase: TwinExternalSimple;
  linkedinCompany: TwinExternalLinkedIn;
  pressMentions: TwinExternalPressMentions;
}

export interface TwinObservationCompetitor {
  name: string;
  domain: string;
  pagesAnalyzed: number;
  hasSchemaOrg: boolean;
  schemaOrgTypes: string[];
  hasFAQSchema: boolean;
  hasArticleSchema: boolean;
  hasBreadcrumb: boolean;
  hasAuthorInfo: boolean;
  averageWordCount: number;
  averageFactualDensity: number;
  hasStructuredFAQ: boolean;
  externalAuthoritySourcesAvg: number;
  wikipediaFound: boolean;
  trustpilotRating: number | null;
  trustpilotReviewCount: number | null;
  citationRate: number;
}

export interface TwinObservationLlmScanData {
  clientCitationRate: number;
  totalQueriesTested: number;
  clientMentionsCount: number;
  averageSentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  positionsWhenCited: number[];
  topPerformingQueries: string[];
  queriesNotCited: string[];
}

export interface TwinObservationQualitativeNotes {
  mainStrengths: string[];
  mainWeaknesses: string[];
  quickWinSuggestions: string[];
  strategicSuggestions: string[];
}

export interface TwinObservations {
  pages: TwinObservationPage[];
  technical: TwinObservationTechnical;
  external: TwinObservationExternal;
  competitors: TwinObservationCompetitor[];
  llmScanData: TwinObservationLlmScanData;
  qualitativeNotes: TwinObservationQualitativeNotes;
}

export type TwinCrawlErrorCode =
  | 'SITE_UNREACHABLE'
  | 'TIMEOUT'
  | 'CRAWL_BLOCKED'
  | 'UNKNOWN';

export interface TwinCrawlError {
  code: TwinCrawlErrorCode;
  message: string;
}

export interface TwinCrawlMeta {
  completedAt: string;
  pagesAnalyzedClient: number;
  pagesAnalyzedCompetitors: number;
  competitorsCount: number;
  executionTimeSeconds: number;
}

export type TwinCrawlStatus = 'completed' | 'partial' | 'failed';

export interface TwinCrawlResult {
  auditId: string;
  status: TwinCrawlStatus;
  observations?: TwinObservations;
  error?: TwinCrawlError;
  meta?: TwinCrawlMeta;
}

// ============================================
// Audit Analysis — Mistral output
// ============================================

export type AnalysisVerdict =
  | 'insuffisante'
  | 'à renforcer'
  | 'correcte'
  | 'excellente';

export interface AnalysisFinding {
  category: 'structure' | 'content' | 'technical' | 'external_presence';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  recommendation: string;
}

export interface AnalysisPageAudit {
  url: string;
  type: string;
  strengths: string[];
  findings: AnalysisFinding[];
}

export interface AnalysisPlatformPresence {
  platform: string;
  found: boolean;
  status: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface AnalysisCompetitor {
  name: string;
  domain: string;
  estimatedGeoScore: number;
  strengths: string[];
  clientGaps: string[];
  externalPresenceAdvantage: string[];
}

export interface AnalysisActionItem {
  title: string;
  description: string;
  targetUrl: string | null;
  impact: 1 | 2 | 3 | 4 | 5;
  effort: 1 | 2 | 3 | 4 | 5;
  category: 'structure' | 'content' | 'technical' | 'external_presence';
}

export interface AuditAnalysis {
  executiveSummary: {
    headline: string;
    context: string;
    keyFindings: [string, string, string];
    verdict: AnalysisVerdict;
  };

  geoScore: {
    overall: number;
    structure: number;
    content: number;
    technical: number;
    externalPresence: number;
    structureExplanation: string;
    contentExplanation: string;
    technicalExplanation: string;
    externalPresenceExplanation: string;
  };

  siteAudit: {
    pages: AnalysisPageAudit[];
    globalFindings: AnalysisFinding[];
  };

  externalPresence: {
    score: number;
    platforms: AnalysisPlatformPresence[];
    summary: string;
    gaps: string[];
  };

  competitorBenchmark: {
    competitors: AnalysisCompetitor[];
    summary: string;
    keyGaps: string[];
  };

  actionPlan: {
    quickWins: AnalysisActionItem[];
    shortTerm: AnalysisActionItem[];
    mediumTerm: AnalysisActionItem[];
    totalActions: number;
  };
}

// ============================================
// Audit Metadata — Denormalized for dashboard
// ============================================

export interface AuditMetadata {
  geoScore: number | null;
  verdict: AnalysisVerdict | null;
  topFindings: string[];
  actionCountCritical: number | null;
  actionCountHigh: number | null;
  actionCountMedium: number | null;
  totalActions: number | null;
  pagesAnalyzedClient: number | null;
  pagesAnalyzedCompetitors: number | null;
  competitorsAnalyzed: string[];
  externalPresenceScore: number | null;
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

interface AuditResponsePaid {
  hasAudit: true;
  auditId: string;
  status: AuditStatus.PAID;
  createdAt: string;
  paidAt: string | null;
}

interface AuditResponseCrawling {
  hasAudit: true;
  auditId: string;
  status: AuditStatus.CRAWLING;
  createdAt: string;
  paidAt: string | null;
}

interface AuditResponseAnalyzing {
  hasAudit: true;
  auditId: string;
  status: AuditStatus.ANALYZING;
  pagesAnalyzedClient: number | null;
  competitorsAnalyzed: string[];
}

interface AuditResponseCompleted {
  hasAudit: true;
  auditId: string;
  status: AuditStatus.COMPLETED;
  geoScore: number | null;
  verdict: string | null;
  topFindings: string[];
  externalPresenceScore: number | null;
  actionCount: { critical: number | null; high: number | null; medium: number | null };
  totalActions: number | null;
  competitorsAnalyzed: string[];
  pagesAnalyzedClient: number | null;
  pagesAnalyzedCompetitors: number | null;
  completedAt: string;
}

interface AuditResponseFailed {
  hasAudit: true;
  auditId: string;
  status: AuditStatus.FAILED;
  failureReason: string | null;
}

export type LatestAuditResponseDto =
  | { hasAudit: false }
  | AuditResponsePaid
  | AuditResponseCrawling
  | AuditResponseAnalyzing
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

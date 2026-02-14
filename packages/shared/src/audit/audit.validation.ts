import { z } from 'zod';

// ============================================
// Frontend Validation: Checkout
// ============================================

export const createAuditCheckoutSchema = z.object({
  projectId: z.string().uuid(),
});

export type CreateAuditCheckoutSchemaType = z.infer<typeof createAuditCheckoutSchema>;

// ============================================
// Webhook Validation: Twin Callback
// ============================================

const findingSchema = z.object({
  category: z.enum(['structure', 'content', 'technical', 'seo']),
  severity: z.enum(['critical', 'warning', 'info']),
  title: z.string(),
  detail: z.string(),
  recommendation: z.string(),
});

const pageAuditSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  metaDescription: z.string(),
  wordCount: z.number().int().nonnegative(),
  type: z.enum([
    'homepage',
    'about',
    'product',
    'blog_post',
    'faq',
    'contact',
    'other',
  ]),
  findings: z.array(findingSchema),
  schemaOrg: z.object({
    present: z.boolean(),
    types: z.array(z.string()),
    completeness: z.number().min(0).max(100),
  }),
  headingStructure: z.object({
    valid: z.boolean(),
    h1Count: z.number().int().nonnegative(),
    issues: z.array(z.string()),
  }),
  eeatScore: z.number().min(0).max(100),
  factualDensity: z.number().min(0).max(1),
  hasStructuredFAQ: z.boolean(),
  internalLinks: z.number().int().nonnegative(),
  externalAuthoritySources: z.number().int().nonnegative(),
});

const competitorBenchmarkSchema = z.object({
  name: z.string(),
  domain: z.string(),
  geoScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  clientGaps: z.array(z.string()),
});

const externalSourceSchema = z.object({
  source: z.string(),
  found: z.boolean(),
  url: z.string().url().optional(),
  quality: z.enum(['absent', 'minimal', 'partial', 'complete']),
  issues: z.array(z.string()),
  recommendation: z.string(),
});

const externalPresenceSchema = z.object({
  sourcesAudited: z.array(externalSourceSchema),
  presenceScore: z.number().min(0).max(100),
  mainGaps: z.array(z.string()),
});

const actionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum([
    'optimize_page',
    'create_content',
    'add_schema',
    'create_faq',
    'create_llm_page',
    'add_citations',
    'improve_eeat',
    'improve_external_presence',
  ]),
  targetUrl: z.string().nullable(),
  description: z.string(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  estimatedImpact: z.number().int().min(1).max(5),
  estimatedEffort: z.number().int().min(1).max(5),
  details: z.string(),
  executionReady: z.boolean(),
  contentBrief: z
    .object({
      targetKeywords: z.array(z.string()),
      suggestedTitle: z.string(),
      outline: z.array(z.string()),
      targetWordCount: z.number().int().positive(),
      referenceSources: z.array(z.string()),
      suggestedQuestions: z.array(z.string()).optional(),
    })
    .optional(),
  technicalSpec: z
    .object({
      schemaType: z.string().optional(),
      codeSnippet: z.string().optional(),
    })
    .optional(),
});

export const auditResultSchema = z.object({
  geoScore: z.object({
    overall: z.number().min(0).max(100),
    structure: z.number().min(0).max(100),
    content: z.number().min(0).max(100),
    technical: z.number().min(0).max(100),
    competitive: z.number().min(0).max(100),
    methodology: z.string(),
    mainStrengths: z.array(z.string()),
    mainWeaknesses: z.array(z.string()),
  }),
  siteAudit: z.object({
    pagesAnalyzed: z.array(pageAuditSchema),
  }),
  competitorBenchmark: z.array(competitorBenchmarkSchema),
  actionPlan: z.object({
    quickWins: z.array(actionItemSchema),
    shortTerm: z.array(actionItemSchema),
    mediumTerm: z.array(actionItemSchema),
  }),
  externalPresence: externalPresenceSchema,
  meta: z.object({
    pagesAnalyzedClient: z.number().int().nonnegative(),
    pagesAnalyzedCompetitors: z.number().int().nonnegative(),
    executionTimeSeconds: z.number().nonnegative(),
    completedAt: z.string().datetime(),
  }),
});

export const twinWebhookPayloadSchema = z.object({
  auditId: z.string().uuid(),
  status: z.enum(['completed', 'partial', 'failed']),
  error: z.string().optional(),
  result: auditResultSchema.optional(),
});

export type TwinWebhookPayloadSchemaType = z.infer<typeof twinWebhookPayloadSchema>;

// Lenient schema for webhook controller — accepts result as unknown JSON
// so we can still return 200 and handle SCHEMA_ERROR in the use case
export const twinWebhookPayloadLenientSchema = z.object({
  auditId: z.string().uuid(),
  status: z.enum(['completed', 'partial', 'failed']),
  error: z.string().optional(),
  result: z.unknown().optional(),
});

export type TwinWebhookPayloadLenientType = z.infer<typeof twinWebhookPayloadLenientSchema>;

// ============================================
// Webhook Validation: Twin Crawl Complete (v2)
// ============================================

const twinCrawlErrorSchema = z.object({
  code: z.enum(['SITE_UNREACHABLE', 'TIMEOUT', 'CRAWL_BLOCKED', 'UNKNOWN']),
  message: z.string(),
});

const twinCrawlMetaSchema = z.object({
  completedAt: z.string(),
  pagesAnalyzedClient: z.number().int().nonnegative(),
  pagesAnalyzedCompetitors: z.number().int().nonnegative(),
  competitorsCount: z.number().int().nonnegative(),
  executionTimeSeconds: z.number().nonnegative(),
});

// Lenient schema for webhook controller — accepts observations as unknown JSON
// so we can still return 200 and handle validation in the use case
export const twinCrawlResultLenientSchema = z.object({
  auditId: z.string().uuid(),
  status: z.enum(['completed', 'partial', 'failed']),
  observations: z.unknown().optional(),
  error: twinCrawlErrorSchema.optional(),
  meta: twinCrawlMetaSchema.optional(),
});

export type TwinCrawlResultLenientType = z.infer<typeof twinCrawlResultLenientSchema>;

// ============================================
// Mistral Analysis Output (v2)
// ============================================

const analysisFindingSchema = z.object({
  category: z.enum(['structure', 'content', 'technical', 'external_presence']),
  severity: z.enum(['critical', 'warning', 'info']),
  title: z.string(),
  detail: z.string(),
  recommendation: z.string(),
});

const analysisPageAuditSchema = z.object({
  url: z.string(),
  type: z.string(),
  strengths: z.array(z.string()),
  findings: z.array(analysisFindingSchema),
});

const analysisPlatformPresenceSchema = z.object({
  platform: z.string(),
  found: z.boolean(),
  status: z.string(),
  impact: z.enum(['high', 'medium', 'low']),
  recommendation: z.string(),
});

const analysisCompetitorSchema = z.object({
  name: z.string(),
  domain: z.string(),
  estimatedGeoScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  clientGaps: z.array(z.string()),
  externalPresenceAdvantage: z.array(z.string()),
});

const analysisActionItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  targetUrl: z.string().nullable(),
  impact: z.number().int().min(1).max(5),
  effort: z.number().int().min(1).max(5),
  category: z.enum(['structure', 'content', 'technical', 'external_presence']),
});

export const auditAnalysisSchema = z.object({
  executiveSummary: z.object({
    headline: z.string(),
    context: z.string(),
    keyFindings: z.tuple([z.string(), z.string(), z.string()]),
    verdict: z.enum(['insuffisante', 'à renforcer', 'correcte', 'excellente']),
  }),
  geoScore: z.object({
    overall: z.number().min(0).max(100),
    structure: z.number().min(0).max(100),
    content: z.number().min(0).max(100),
    technical: z.number().min(0).max(100),
    externalPresence: z.number().min(0).max(100),
    structureExplanation: z.string(),
    contentExplanation: z.string(),
    technicalExplanation: z.string(),
    externalPresenceExplanation: z.string(),
  }),
  siteAudit: z.object({
    pages: z.array(analysisPageAuditSchema),
    globalFindings: z.array(analysisFindingSchema),
  }),
  externalPresence: z.object({
    score: z.number().min(0).max(100),
    platforms: z.array(analysisPlatformPresenceSchema),
    summary: z.string(),
    gaps: z.array(z.string()),
  }),
  competitorBenchmark: z.object({
    competitors: z.array(analysisCompetitorSchema),
    summary: z.string(),
    keyGaps: z.array(z.string()),
  }),
  actionPlan: z.object({
    quickWins: z.array(analysisActionItemSchema),
    shortTerm: z.array(analysisActionItemSchema),
    mediumTerm: z.array(analysisActionItemSchema),
    totalActions: z.number().int().nonnegative(),
  }),
});

export type AuditAnalysisSchemaType = z.infer<typeof auditAnalysisSchema>;

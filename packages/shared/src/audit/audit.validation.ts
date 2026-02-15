import { z } from 'zod';

// ============================================
// Frontend Validation: Checkout
// ============================================

export const createAuditCheckoutSchema = z.object({
  projectId: z.string().uuid(),
});

export type CreateAuditCheckoutSchemaType = z.infer<typeof createAuditCheckoutSchema>;

// ============================================
// Webhook Validation: Twin Crawl Complete
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
// Mistral Analysis Output
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

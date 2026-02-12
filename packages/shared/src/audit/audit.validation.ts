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

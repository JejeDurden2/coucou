import { describe, it, expect } from 'vitest';
import { auditAnalysisSchema } from './audit.validation';

const validAnalysis = {
  executiveSummary: {
    headline: 'Test headline',
    context: 'Test context',
    keyFindings: ['Finding 1', 'Finding 2', 'Finding 3'],
    verdict: 'correcte' as const,
  },
  geoScore: {
    overall: 65,
    structure: 70,
    content: 60,
    technical: 75,
    externalPresence: 55,
    structureExplanation: 'Good structure',
    contentExplanation: 'Decent content',
    technicalExplanation: 'Good technical',
    externalPresenceExplanation: 'Needs work',
  },
  siteAudit: {
    pages: [],
    globalFindings: [],
  },
  externalPresence: {
    score: 55,
    platforms: [],
    summary: 'External presence summary',
    gaps: ['Wikipedia'],
  },
  competitorBenchmark: {
    competitors: [],
    summary: 'Benchmark summary',
    keyGaps: [],
  },
  actionPlan: {
    quickWins: [],
    shortTerm: [],
    mediumTerm: [],
    totalActions: 0,
  },
};

describe('auditAnalysisSchema', () => {
  it('should accept valid analysis', () => {
    const result = auditAnalysisSchema.safeParse(validAnalysis);
    expect(result.success).toBe(true);
  });

  describe('keyFindings transform', () => {
    it('should accept exactly 3 findings', () => {
      const result = auditAnalysisSchema.safeParse(validAnalysis);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.executiveSummary.keyFindings).toEqual([
          'Finding 1',
          'Finding 2',
          'Finding 3',
        ]);
      }
    });

    it('should pad 2 findings to 3', () => {
      const input = {
        ...validAnalysis,
        executiveSummary: {
          ...validAnalysis.executiveSummary,
          keyFindings: ['A', 'B'],
        },
      };
      const result = auditAnalysisSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.executiveSummary.keyFindings).toEqual(['A', 'B', '']);
      }
    });

    it('should truncate 5 findings to 3', () => {
      const input = {
        ...validAnalysis,
        executiveSummary: {
          ...validAnalysis.executiveSummary,
          keyFindings: ['A', 'B', 'C', 'D', 'E'],
        },
      };
      const result = auditAnalysisSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.executiveSummary.keyFindings).toEqual(['A', 'B', 'C']);
      }
    });

    it('should reject empty findings array', () => {
      const input = {
        ...validAnalysis,
        executiveSummary: {
          ...validAnalysis.executiveSummary,
          keyFindings: [],
        },
      };
      const result = auditAnalysisSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('score clamping', () => {
    it('should clamp scores above 100', () => {
      const input = {
        ...validAnalysis,
        geoScore: { ...validAnalysis.geoScore, overall: 150 },
      };
      const result = auditAnalysisSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.geoScore.overall).toBe(100);
      }
    });

    it('should clamp negative scores to 0', () => {
      const input = {
        ...validAnalysis,
        geoScore: { ...validAnalysis.geoScore, overall: -5 },
      };
      const result = auditAnalysisSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.geoScore.overall).toBe(0);
      }
    });

    it('should round decimal scores', () => {
      const input = {
        ...validAnalysis,
        geoScore: { ...validAnalysis.geoScore, overall: 65.7, structure: 70.2 },
      };
      const result = auditAnalysisSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.geoScore.overall).toBe(66);
        expect(result.data.geoScore.structure).toBe(70);
      }
    });
  });

  describe('action item transforms', () => {
    const actionItem = {
      title: 'Add schema.org',
      description: 'Add structured data',
      targetUrl: 'https://test.com',
      impact: 4,
      effort: 2,
      category: 'structure' as const,
    };

    it('should clamp impact above 5', () => {
      const input = {
        ...validAnalysis,
        actionPlan: {
          ...validAnalysis.actionPlan,
          quickWins: [{ ...actionItem, impact: 7 }],
          totalActions: 1,
        },
      };
      const result = auditAnalysisSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.actionPlan.quickWins[0].impact).toBe(5);
      }
    });

    it('should clamp effort below 1', () => {
      const input = {
        ...validAnalysis,
        actionPlan: {
          ...validAnalysis.actionPlan,
          quickWins: [{ ...actionItem, effort: 0 }],
          totalActions: 1,
        },
      };
      const result = auditAnalysisSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.actionPlan.quickWins[0].effort).toBe(1);
      }
    });

    it('should round decimal impact/effort', () => {
      const input = {
        ...validAnalysis,
        actionPlan: {
          ...validAnalysis.actionPlan,
          quickWins: [{ ...actionItem, impact: 3.7, effort: 2.3 }],
          totalActions: 1,
        },
      };
      const result = auditAnalysisSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.actionPlan.quickWins[0].impact).toBe(4);
        expect(result.data.actionPlan.quickWins[0].effort).toBe(2);
      }
    });

    it('should default missing targetUrl to null', () => {
      const { targetUrl: _, ...noTargetUrl } = actionItem;
      const input = {
        ...validAnalysis,
        actionPlan: {
          ...validAnalysis.actionPlan,
          quickWins: [noTargetUrl],
          totalActions: 1,
        },
      };
      const result = auditAnalysisSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.actionPlan.quickWins[0].targetUrl).toBeNull();
      }
    });

    it('should convert empty string targetUrl to null', () => {
      const input = {
        ...validAnalysis,
        actionPlan: {
          ...validAnalysis.actionPlan,
          quickWins: [{ ...actionItem, targetUrl: '' }],
          totalActions: 1,
        },
      };
      const result = auditAnalysisSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.actionPlan.quickWins[0].targetUrl).toBeNull();
      }
    });
  });

  describe('totalActions default', () => {
    it('should default missing totalActions to 0', () => {
      const { totalActions: _, ...noPlan } = validAnalysis.actionPlan;
      const input = {
        ...validAnalysis,
        actionPlan: noPlan,
      };
      const result = auditAnalysisSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.actionPlan.totalActions).toBe(0);
      }
    });
  });
});

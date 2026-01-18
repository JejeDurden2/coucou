/**
 * GEO (Generative Engine Optimization) Response format.
 * Compact JSON format for LLM brand recommendations.
 */
export interface GEOResponse {
  /** Ranking of 1-5 brands with attributes */
  r: Array<{
    /** Brand name */
    n: string;
    /** 3 key attributes/keywords for the brand */
    k: string[];
  }>;
  /** 2 keywords extracted from user query */
  q: string[];
}

/**
 * Parsed insights extracted from GEO response.
 */
export interface GEOInsights {
  /** Position in ranking (1-5), null if not ranked */
  position: number | null;
  /** Brand's keywords if found in ranking */
  brandKeywords: string[];
  /** All competitor keywords (deduplicated) */
  competitorKeywords: string[];
  /** Keywords extracted from user query */
  queryKeywords: string[];
  /** All competitors with their data */
  competitors: Array<{
    name: string;
    position: number;
    keywords: string[];
  }>;
}

/**
 * Result of parsing attempt.
 */
export interface ParseResult {
  success: boolean;
  response: GEOResponse | null;
  error: string | null;
}

/**
 * Service to parse and extract insights from GEO JSON responses.
 */
export class GEOResponseParserService {
  /**
   * Attempts to parse raw LLM response as GEO JSON format.
   * Handles edge cases like markdown code blocks around JSON.
   */
  static parse(raw: string): ParseResult {
    if (!raw || typeof raw !== 'string') {
      return { success: false, response: null, error: 'Empty or invalid response' };
    }

    // Clean the response: remove markdown code blocks if present
    let cleaned = raw.trim();

    // Remove ```json or ``` wrapper if present
    const codeBlockMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1].trim();
    }

    // Try to find JSON object in the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, response: null, error: 'No JSON object found in response' };
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]) as unknown;

      // Validate structure
      if (!this.isValidGEOResponse(parsed)) {
        return { success: false, response: null, error: 'Invalid GEO response structure' };
      }

      return { success: true, response: parsed, error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown parse error';
      return { success: false, response: null, error: `JSON parse error: ${message}` };
    }
  }

  /**
   * Type guard to validate GEO response structure.
   */
  private static isValidGEOResponse(data: unknown): data is GEOResponse {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const obj = data as Record<string, unknown>;

    // Check 'r' array
    if (!Array.isArray(obj.r)) {
      return false;
    }

    for (const item of obj.r) {
      if (typeof item !== 'object' || item === null) {
        return false;
      }
      const brand = item as Record<string, unknown>;
      if (typeof brand.n !== 'string') {
        return false;
      }
      if (!Array.isArray(brand.k) || !brand.k.every((k) => typeof k === 'string')) {
        return false;
      }
    }

    // Check 'q' array
    if (!Array.isArray(obj.q) || !obj.q.every((k) => typeof k === 'string')) {
      return false;
    }

    return true;
  }

  /**
   * Extracts insights from GEO response for a target brand.
   * Handles case-insensitive matching and partial matches.
   */
  static extractInsights(
    response: GEOResponse,
    targetBrand: string,
    brandVariants: string[] = [],
  ): GEOInsights {
    const allTerms = [targetBrand, ...brandVariants].map((t) => t.toLowerCase());

    // Find brand in ranking
    const brandIndex = response.r.findIndex((item) => {
      const nameLower = item.n.toLowerCase();
      return allTerms.some(
        (term) => nameLower === term || nameLower.includes(term) || term.includes(nameLower),
      );
    });

    const position = brandIndex !== -1 ? brandIndex + 1 : null;
    const brandKeywords = brandIndex !== -1 ? response.r[brandIndex].k : [];

    // Extract competitor keywords (excluding target brand)
    const competitorKeywordsSet = new Set<string>();
    const competitors: GEOInsights['competitors'] = [];

    for (let i = 0; i < response.r.length; i++) {
      const item = response.r[i];
      const nameLower = item.n.toLowerCase();
      const isTargetBrand = allTerms.some(
        (term) => nameLower === term || nameLower.includes(term) || term.includes(nameLower),
      );

      if (!isTargetBrand) {
        competitors.push({
          name: item.n,
          position: i + 1,
          keywords: item.k,
        });

        for (const keyword of item.k) {
          competitorKeywordsSet.add(keyword);
        }
      }
    }

    return {
      position,
      brandKeywords,
      competitorKeywords: Array.from(competitorKeywordsSet),
      queryKeywords: response.q,
      competitors,
    };
  }

  /**
   * Checks if a brand is cited in the GEO response.
   * Returns position if found, null otherwise.
   */
  static detectMention(
    response: GEOResponse,
    brandName: string,
    brandVariants: string[] = [],
  ): { isCited: boolean; position: number | null } {
    const insights = this.extractInsights(response, brandName, brandVariants);
    return {
      isCited: insights.position !== null,
      position: insights.position,
    };
  }
}

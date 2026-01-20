export interface BrandContext {
  businessType: string;
  locality: string | null;
  mainOfferings: string[];
  targetAudience: string;
}

export interface GeneratedPrompt {
  content: string;
  category: string;
}

export interface BrandAnalyzerPort {
  extractContext(url: string, brandName: string): Promise<BrandContext>;
  generatePrompts(
    context: BrandContext,
    brandName: string,
    count: number,
  ): Promise<GeneratedPrompt[]>;
}

export const BRAND_ANALYZER = Symbol('BRAND_ANALYZER');

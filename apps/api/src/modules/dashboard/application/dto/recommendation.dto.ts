export type RecommendationType =
  | 'low_citation'
  | 'competitor_dominance'
  | 'prompt_weakness'
  | 'keyword_gap'
  | 'model_disparity'
  | 'position_drop'
  | 'emerging_competitor'
  | 'improvement'
  | 'platform_optimization'
  | 'content_freshness'
  | 'content_structure'
  | 'eeat_signal'
  | 'prompt_category_gap'
  | 'triple_threat_optimization';

export type RecommendationSeverity = 'info' | 'warning' | 'critical';

export interface RecommendationDto {
  id: string;
  type: RecommendationType;
  severity: RecommendationSeverity;
  title: string;
  description: string;
  actionItems: string[];
  relatedPromptIds?: string[];
  metadata?: Record<string, unknown>;
}

export interface RecommendationsResponseDto {
  recommendations: RecommendationDto[];
  generatedAt: Date;
}

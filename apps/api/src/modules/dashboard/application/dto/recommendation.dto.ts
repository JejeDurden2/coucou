export type RecommendationType =
  | 'low_citation'
  | 'competitor_dominance'
  | 'provider_disparity'
  | 'prompt_weakness'
  | 'improvement';

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

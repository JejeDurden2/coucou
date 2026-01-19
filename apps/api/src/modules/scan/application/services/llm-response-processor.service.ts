import { Injectable, Logger } from '@nestjs/common';

import { GEOResponseParserService, type LLMResult } from '../../domain';
import type { LLMResponse } from '../ports/llm.port';

@Injectable()
export class LLMResponseProcessorService {
  private readonly logger = new Logger(LLMResponseProcessorService.name);

  process(response: LLMResponse, brandName: string, brandVariants: string[]): LLMResult {
    const parseResult = GEOResponseParserService.parse(response.content);

    if (!parseResult.success || !parseResult.response) {
      this.logger.warn(
        `Failed to parse GEO response from ${response.provider}/${response.model}: ${parseResult.error}`,
      );
      return {
        provider: response.provider,
        model: response.model,
        rawResponse: response.content,
        isCited: false,
        position: null,
        brandKeywords: [],
        queryKeywords: [],
        competitorMentions: [],
        latencyMs: response.latencyMs,
        parseSuccess: false,
      };
    }

    const insights = GEOResponseParserService.extractInsights(
      parseResult.response,
      brandName,
      brandVariants,
    );

    return {
      provider: response.provider,
      model: response.model,
      rawResponse: response.content,
      isCited: insights.position !== null,
      position: insights.position,
      brandKeywords: insights.brandKeywords,
      queryKeywords: insights.queryKeywords,
      competitorMentions: insights.competitors,
      latencyMs: response.latencyMs,
      parseSuccess: true,
    };
  }
}

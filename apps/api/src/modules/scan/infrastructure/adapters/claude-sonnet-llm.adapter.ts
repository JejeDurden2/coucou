import { Injectable } from '@nestjs/common';
import { LLMModel } from '@coucou-ia/shared';

import { LoggerService } from '../../../../common/logger';
import { AnthropicClientService } from '../../../../common/infrastructure/anthropic/anthropic-client.service';
import { BaseAnthropicAdapter } from './base-anthropic.adapter';

@Injectable()
export class ClaudeSonnetLLMAdapter extends BaseAnthropicAdapter {
  protected readonly model = LLMModel.CLAUDE_SONNET_4_5;

  constructor(anthropicClient: AnthropicClientService, logger: LoggerService) {
    super(anthropicClient, logger);
    logger.setContext(ClaudeSonnetLLMAdapter.name);
  }
}

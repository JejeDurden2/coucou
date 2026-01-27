import { Injectable, Logger } from '@nestjs/common';
import { LLMModel } from '@coucou-ia/shared';

import { AnthropicClientService } from '../../../../common/infrastructure/anthropic/anthropic-client.service';
import { BaseAnthropicAdapter } from './base-anthropic.adapter';

@Injectable()
export class ClaudeSonnetLLMAdapter extends BaseAnthropicAdapter {
  protected readonly logger = new Logger(ClaudeSonnetLLMAdapter.name);
  protected readonly model = LLMModel.CLAUDE_SONNET_4_5;

  constructor(anthropicClient: AnthropicClientService) {
    super(anthropicClient);
  }
}

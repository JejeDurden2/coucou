import { Injectable, Logger } from '@nestjs/common';
import { LLMModel } from '@coucou-ia/shared';

import { AnthropicClientService } from '../../../../common/infrastructure/anthropic/anthropic-client.service';
import { BaseAnthropicAdapter } from './base-anthropic.adapter';

@Injectable()
export class ClaudeOpusLLMAdapter extends BaseAnthropicAdapter {
  protected readonly logger = new Logger(ClaudeOpusLLMAdapter.name);
  protected readonly model = LLMModel.CLAUDE_OPUS_4_5;

  constructor(anthropicClient: AnthropicClientService) {
    super(anthropicClient);
  }
}

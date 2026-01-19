import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMModel } from '@coucou-ia/shared';

import { BaseAnthropicAdapter } from './base-anthropic.adapter';

@Injectable()
export class ClaudeOpusLLMAdapter extends BaseAnthropicAdapter {
  protected readonly logger = new Logger(ClaudeOpusLLMAdapter.name);
  protected readonly model = LLMModel.CLAUDE_OPUS_4_5;

  constructor(configService: ConfigService) {
    super(configService);
  }
}

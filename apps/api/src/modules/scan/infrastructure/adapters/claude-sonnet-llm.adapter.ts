import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMModel } from '@coucou-ia/shared';

import { BaseAnthropicAdapter } from './base-anthropic.adapter';

@Injectable()
export class ClaudeSonnetLLMAdapter extends BaseAnthropicAdapter {
  protected readonly logger = new Logger(ClaudeSonnetLLMAdapter.name);
  protected readonly model = LLMModel.CLAUDE_SONNET_4_5;

  constructor(configService: ConfigService) {
    super(configService);
  }
}

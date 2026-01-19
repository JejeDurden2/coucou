import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BaseAnthropicAdapter } from './base-anthropic.adapter';

@Injectable()
export class ClaudeOpusLLMAdapter extends BaseAnthropicAdapter {
  protected readonly logger = new Logger(ClaudeOpusLLMAdapter.name);
  protected readonly model = 'claude-opus-4-5-20250514';

  constructor(configService: ConfigService) {
    super(configService);
  }
}

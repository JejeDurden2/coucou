import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BaseAnthropicAdapter } from './base-anthropic.adapter';

@Injectable()
export class ClaudeSonnetLLMAdapter extends BaseAnthropicAdapter {
  protected readonly logger = new Logger(ClaudeSonnetLLMAdapter.name);
  protected readonly model = 'claude-sonnet-4-5-20250514';

  constructor(configService: ConfigService) {
    super(configService);
  }
}

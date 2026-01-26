import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BaseAnthropicAdapter } from './base-anthropic.adapter';

@Injectable()
export class AnthropicLLMAdapter extends BaseAnthropicAdapter {
  protected readonly logger = new Logger(AnthropicLLMAdapter.name);
  protected readonly model = 'claude-haiku-3-5-20241022';

  constructor(configService: ConfigService) {
    super(configService);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BaseOpenAIAdapter } from './base-openai.adapter';

@Injectable()
export class GPT4oLLMAdapter extends BaseOpenAIAdapter {
  protected readonly logger = new Logger(GPT4oLLMAdapter.name);
  protected readonly model = 'gpt-4o';

  constructor(configService: ConfigService) {
    super(configService);
  }
}

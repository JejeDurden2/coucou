import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BaseOpenAIAdapter } from './base-openai.adapter';

@Injectable()
export class GPT52LLMAdapter extends BaseOpenAIAdapter {
  protected readonly logger = new Logger(GPT52LLMAdapter.name);
  protected readonly model = 'gpt-5.2';

  constructor(configService: ConfigService) {
    super(configService);
  }
}

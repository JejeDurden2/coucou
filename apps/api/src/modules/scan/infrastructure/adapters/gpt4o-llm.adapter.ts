import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMModel } from '@coucou-ia/shared';

import { BaseOpenAIAdapter } from './base-openai.adapter';

@Injectable()
export class GPT4oLLMAdapter extends BaseOpenAIAdapter {
  protected readonly logger = new Logger(GPT4oLLMAdapter.name);
  protected readonly model = LLMModel.GPT_4O;

  constructor(configService: ConfigService) {
    super(configService);
  }
}

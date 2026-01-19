import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMModel } from '@coucou-ia/shared';

import { BaseOpenAIAdapter } from './base-openai.adapter';

@Injectable()
export class GPT52LLMAdapter extends BaseOpenAIAdapter {
  protected readonly logger = new Logger(GPT52LLMAdapter.name);
  protected readonly model = LLMModel.GPT_5_2;

  constructor(configService: ConfigService) {
    super(configService);
  }
}

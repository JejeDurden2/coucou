import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMModel } from '@coucou-ia/shared';

import { BaseOpenAIAdapter } from './base-openai.adapter';

@Injectable()
export class OpenAILLMAdapter extends BaseOpenAIAdapter {
  protected readonly logger = new Logger(OpenAILLMAdapter.name);
  protected readonly model = LLMModel.GPT_4O_MINI;

  constructor(configService: ConfigService) {
    super(configService);
  }
}

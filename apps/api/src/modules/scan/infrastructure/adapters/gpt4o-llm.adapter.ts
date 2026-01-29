import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMModel } from '@coucou-ia/shared';

import { LoggerService } from '../../../../common/logger';
import { BaseOpenAIAdapter } from './base-openai.adapter';

@Injectable()
export class GPT4oLLMAdapter extends BaseOpenAIAdapter {
  protected readonly model = LLMModel.GPT_4O;

  constructor(configService: ConfigService, logger: LoggerService) {
    super(configService, logger);
    logger.setContext(GPT4oLLMAdapter.name);
  }
}

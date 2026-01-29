import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMModel } from '@coucou-ia/shared';

import { LoggerService } from '../../../../common/logger';
import { BaseOpenAIAdapter } from './base-openai.adapter';

@Injectable()
export class OpenAILLMAdapter extends BaseOpenAIAdapter {
  protected readonly model = LLMModel.GPT_4O_MINI;

  constructor(configService: ConfigService, logger: LoggerService) {
    super(configService, logger);
    logger.setContext(OpenAILLMAdapter.name);
  }
}

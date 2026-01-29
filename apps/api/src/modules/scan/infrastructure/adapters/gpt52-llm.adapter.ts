import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMModel } from '@coucou-ia/shared';

import { LoggerService } from '../../../../common/logger';
import { BaseOpenAIAdapter } from './base-openai.adapter';

@Injectable()
export class GPT52LLMAdapter extends BaseOpenAIAdapter {
  protected readonly model = LLMModel.GPT_5_2;

  constructor(configService: ConfigService, logger: LoggerService) {
    super(configService, logger);
    logger.setContext(GPT52LLMAdapter.name);
  }
}

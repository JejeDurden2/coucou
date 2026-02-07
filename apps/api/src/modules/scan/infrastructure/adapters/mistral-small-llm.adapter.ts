import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMModel } from '@coucou-ia/shared';

import { LoggerService } from '../../../../common/logger';
import { BaseMistralAdapter } from './base-mistral.adapter';

@Injectable()
export class MistralSmallLLMAdapter extends BaseMistralAdapter {
  protected readonly model = LLMModel.MISTRAL_SMALL_LATEST;

  constructor(configService: ConfigService, logger: LoggerService) {
    super(configService, logger);
    logger.setContext(MistralSmallLLMAdapter.name);
  }
}

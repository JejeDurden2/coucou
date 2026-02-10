import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMModel } from '@coucou-ia/shared';

import { LoggerService } from '../../../../common/logger';
import { BaseMistralAdapter } from './base-mistral.adapter';

@Injectable()
export class MistralMediumLLMAdapter extends BaseMistralAdapter {
  protected readonly model = LLMModel.MISTRAL_MEDIUM_LATEST;

  constructor(configService: ConfigService, logger: LoggerService) {
    super(configService, logger);
    logger.setContext(MistralMediumLLMAdapter.name);
  }
}

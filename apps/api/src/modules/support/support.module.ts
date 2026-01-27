import { Module } from '@nestjs/common';

import { ProjectModule } from '../project';
import { SendSupportRequestUseCase } from './application/use-cases/send-support-request.use-case';
import { SupportController } from './presentation/controllers/support.controller';

@Module({
  imports: [ProjectModule],
  controllers: [SupportController],
  providers: [SendSupportRequestUseCase],
})
export class SupportModule {}

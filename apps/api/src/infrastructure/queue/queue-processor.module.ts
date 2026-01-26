import { Module } from '@nestjs/common';

import { ScanModule } from '../../modules/scan';
import { ScanProcessor } from './scan.processor';

@Module({
  imports: [ScanModule],
  providers: [ScanProcessor],
})
export class QueueProcessorModule {}

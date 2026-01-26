import { Module, forwardRef } from '@nestjs/common';

import { ScanModule } from '../../modules/scan';
import { ScanProcessor } from './scan.processor';

@Module({
  imports: [forwardRef(() => ScanModule)],
  providers: [ScanProcessor],
})
export class QueueProcessorModule {}

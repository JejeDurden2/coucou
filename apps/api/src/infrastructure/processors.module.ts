import { Module } from '@nestjs/common';

import { ScanProcessor } from './queue/scan.processor';
import { ScanModule } from '../modules/scan';

/**
 * Module for BullMQ processors.
 * Must be loaded AFTER all business modules to avoid circular dependencies.
 */
@Module({
  imports: [ScanModule],
  providers: [ScanProcessor],
})
export class ProcessorsModule {}

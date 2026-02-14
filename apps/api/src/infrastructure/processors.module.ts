import { Module } from '@nestjs/common';

import { ScanProcessor } from './queue/scan.processor';
import { ScanModule } from '../modules/scan';
import { AuditModule } from '../modules/audit/audit.module';
import { AuditProcessor } from '../modules/audit/infrastructure/queue/audit.processor';
import { AuditPdfProcessor } from '../modules/audit/infrastructure/queue/audit-pdf.processor';

/**
 * Module for BullMQ processors.
 * Must be loaded AFTER all business modules to avoid circular dependencies.
 */
@Module({
  imports: [ScanModule, AuditModule],
  providers: [ScanProcessor, AuditProcessor, AuditPdfProcessor],
})
export class ProcessorsModule {}

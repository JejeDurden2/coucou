export { QueueModule } from './queue.module';
export { EmailQueueService, type QueueHealthStatus } from './email-queue.service';
export { EmailProcessor } from './email.processor';
export { ScanQueueService } from './scan-queue.service';
export { ScanProcessor } from './scan.processor';
export { EMAIL_QUEUE_NAME, SCAN_QUEUE_NAME } from './queue.config';
export type { EmailJobData, EmailJobType, EmailJobResult } from './types/email-job.types';
export type { ScanJobData, ScanJobResult } from './types/scan-job.types';

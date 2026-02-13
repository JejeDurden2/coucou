import { Module } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

import { EMAIL_QUEUE_NAME, SCAN_QUEUE_NAME, SENTIMENT_QUEUE_NAME, AUDIT_QUEUE_NAME, AUDIT_PDF_QUEUE_NAME } from './queue.config';
import { bullBoardAuthMiddleware } from './bull-board-auth.middleware';

@Module({
  imports: [
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
      middleware: bullBoardAuthMiddleware,
    }),
    BullBoardModule.forFeature({
      name: EMAIL_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: SCAN_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: SENTIMENT_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: AUDIT_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: AUDIT_PDF_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
  ],
})
export class BullBoardConfigModule {}

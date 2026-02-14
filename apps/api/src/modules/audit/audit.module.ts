import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { ProjectModule } from '../project';
import { PromptModule } from '../prompt';
import { ScanModule } from '../scan';
import { SentimentModule } from '../sentiment';
import { BillingModule } from '../billing/billing.module';
import { AuthModule } from '../auth/auth.module';
import { AUDIT_PDF_QUEUE_NAME } from '../../infrastructure/queue/queue.config';
import { AUDIT_ORDER_REPOSITORY } from './domain/repositories/audit-order.repository';
import { AUDIT_AGENT_PORT } from './domain/ports/audit-agent.port';
import { AUDIT_PDF_PORT } from './domain/ports/audit-pdf.port';
import { AUDIT_ANALYZER_PORT } from './domain/ports/audit-analyzer.port';
import { BriefAssemblerService } from './application/services/brief-assembler.service';
import { CreateAuditCheckoutUseCase } from './application/use-cases/create-audit-checkout.use-case';
import { HandleAuditPaymentUseCase } from './application/use-cases/handle-audit-payment.use-case';
import { CompleteAuditUseCase } from './application/use-cases/complete-audit.use-case';
import { GetLatestAuditUseCase } from './application/use-cases/get-latest-audit.use-case';
import { GetAuditHistoryUseCase } from './application/use-cases/get-audit-history.use-case';
import { GetAuditPdfUseCase } from './application/use-cases/get-audit-pdf.use-case';
import { GenerateAuditPdfUseCase } from './application/use-cases/generate-audit-pdf.use-case';
import { GetLatestAuditPdfUseCase } from './application/use-cases/get-latest-audit-pdf.use-case';
import { GetReportUrlUseCase } from './application/use-cases/get-report-url.use-case';
import { HandleCrawlCompleteUseCase } from './application/use-cases/handle-crawl-complete.use-case';
import { RefundAuditUseCase } from './application/use-cases/refund-audit.use-case';
import { AnalyzeWithMistralUseCase } from './application/use-cases/analyze-with-mistral.use-case';
import { PrismaAuditOrderRepository } from './infrastructure/persistence/prisma-audit-order.repository';
import { TwinAgentAdapter } from './infrastructure/adapters/twin-agent.adapter';
import { ReactPdfAdapter } from './infrastructure/adapters/react-pdf.adapter';
import { MistralAuditAnalyzerAdapter } from './infrastructure/adapters/mistral-audit-analyzer.adapter';
import { AuditQueueService } from './infrastructure/queue/audit-queue.service';
import { AuditProcessor } from './infrastructure/queue/audit.processor';
import { AuditPdfQueueService } from './infrastructure/queue/audit-pdf-queue.service';
import { AuditPdfProcessor } from './infrastructure/queue/audit-pdf.processor';
import { AuditEmailNotificationService } from './application/services/audit-email-notification.service';
import { AuditPdfTokenService } from './infrastructure/services/audit-pdf-token.service';
import { AuditController } from './presentation/audit.controller';
import { AuditPdfDownloadController } from './presentation/audit-pdf-download.controller';
import { TwinWebhookController } from './presentation/twin-webhook.controller';

@Module({
  imports: [
    forwardRef(() => ProjectModule),
    PromptModule,
    ScanModule,
    SentimentModule,
    forwardRef(() => BillingModule),
    forwardRef(() => AuthModule),
    BullModule.registerQueue({ name: AUDIT_PDF_QUEUE_NAME }),
  ],
  controllers: [AuditController, AuditPdfDownloadController, TwinWebhookController],
  providers: [
    BriefAssemblerService,
    CreateAuditCheckoutUseCase,
    HandleAuditPaymentUseCase,
    CompleteAuditUseCase,
    HandleCrawlCompleteUseCase,
    RefundAuditUseCase,
    AnalyzeWithMistralUseCase,
    GetLatestAuditUseCase,
    GetAuditHistoryUseCase,
    GetAuditPdfUseCase,
    GetLatestAuditPdfUseCase,
    GenerateAuditPdfUseCase,
    GetReportUrlUseCase,
    AuditQueueService,
    AuditProcessor,
    AuditPdfQueueService,
    AuditPdfProcessor,
    AuditEmailNotificationService,
    AuditPdfTokenService,
    {
      provide: AUDIT_ORDER_REPOSITORY,
      useClass: PrismaAuditOrderRepository,
    },
    {
      provide: AUDIT_AGENT_PORT,
      useClass: TwinAgentAdapter,
    },
    {
      provide: AUDIT_PDF_PORT,
      useClass: ReactPdfAdapter,
    },
    {
      provide: AUDIT_ANALYZER_PORT,
      useClass: MistralAuditAnalyzerAdapter,
    },
  ],
  exports: [
    HandleAuditPaymentUseCase,
    AUDIT_ORDER_REPOSITORY,
    AUDIT_AGENT_PORT,
    BriefAssemblerService,
    AuditEmailNotificationService,
    AuditPdfQueueService,
  ],
})
export class AuditModule {}

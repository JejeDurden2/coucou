/**
 * Script to manually retry a specific audit step for a project.
 *
 * Usage:
 *   pnpm audit:retry <projectId> <step>
 *
 *   step = crawl | analysis | pdf
 *
 * Examples:
 *   pnpm audit:retry clxyz123 crawl      # Re-trigger Twin crawl
 *   pnpm audit:retry clxyz123 analysis    # Re-run Mistral analysis
 *   pnpm audit:retry clxyz123 pdf         # Re-generate PDF report
 *
 * In production (Railway):
 *   railway run pnpm audit:retry <projectId> <step>
 */

import { bootstrapScript } from '../src/common';
import {
  AuditScriptModule,
  AuditScriptQueueService,
} from '../src/modules/audit/audit-script.module';
import {
  AUDIT_ORDER_REPOSITORY,
  type AuditOrderRepository,
} from '../src/modules/audit/domain';

const VALID_STEPS = ['crawl', 'analysis', 'pdf'] as const;
type AuditStep = (typeof VALID_STEPS)[number];

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: pnpm audit:retry <projectId> <step>');
    console.error('  step = crawl | analysis | pdf');
    process.exit(1);
  }

  const [projectId, stepArg] = args;

  if (!VALID_STEPS.includes(stepArg as AuditStep)) {
    console.error(`Invalid step "${stepArg}". Must be one of: ${VALID_STEPS.join(', ')}`);
    process.exit(1);
  }

  const step = stepArg as AuditStep;

  await bootstrapScript([AuditScriptModule], async (app) => {
    const repository = app.get<AuditOrderRepository>(AUDIT_ORDER_REPOSITORY);
    const queueService = app.get(AuditScriptQueueService);

    // 1. Find the latest audit for the project
    const auditOrder = await repository.findLatestByProjectId(projectId);
    if (!auditOrder) {
      console.error(`No audit found for project ${projectId}`);
      process.exit(1);
    }

    console.log(`Found audit ${auditOrder.id} (status: ${auditOrder.status})`);

    // 2. Check refund status
    if (auditOrder.isRefunded) {
      console.error(`Audit ${auditOrder.id} has been refunded. Cannot retry.`);
      console.error('The user must start a new audit checkout.');
      process.exit(1);
    }

    // 3. Apply reset and enqueue job
    const previousStatus = auditOrder.status;
    let jobId: string;

    switch (step) {
      case 'crawl': {
        const result = auditOrder.resetForCrawlRetry();
        if (!result.ok) {
          console.error(`Cannot reset for crawl retry: ${result.error.message}`);
          process.exit(1);
        }
        await repository.save(result.value);
        jobId = await queueService.addRunAuditJob({
          auditOrderId: auditOrder.id,
          projectId: auditOrder.projectId,
          userId: auditOrder.userId,
        });
        break;
      }

      case 'analysis': {
        const result = auditOrder.resetForAnalysisRetry();
        if (!result.ok) {
          console.error(`Cannot reset for analysis retry: ${result.error.message}`);
          process.exit(1);
        }
        await repository.save(result.value);
        jobId = await queueService.addAnalyzeJob({
          auditOrderId: auditOrder.id,
        });
        break;
      }

      case 'pdf': {
        const result = auditOrder.resetForPdfRetry();
        if (!result.ok) {
          console.error(`Cannot reset for PDF retry: ${result.error.message}`);
          process.exit(1);
        }
        await repository.save(result.value);
        jobId = await queueService.addPdfJob({
          auditOrderId: auditOrder.id,
        });
        break;
      }
    }

    console.log('');
    console.log(`Audit ${auditOrder.id} retry summary:`);
    console.log(`  Step:      ${step}`);
    console.log(`  Status:    ${previousStatus} → ${step === 'crawl' ? 'PAID' : 'ANALYZING'}`);
    console.log(`  Job ID:    ${jobId}`);
    console.log(`  Project:   ${projectId}`);
    console.log('');
    console.log('Done! The job has been enqueued and will be processed shortly.');
  });
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});

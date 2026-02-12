import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuditBrief } from '@coucou-ia/shared';

import { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';
import { LoggerService } from '../../../../common/logger';
import { AuditAgentTriggerError } from '../../domain/errors/audit.errors';
import type { AuditAgentPort } from '../../domain/ports/audit-agent.port';

const MAX_RETRIES = 3;
const TIMEOUT_MS = 30_000;
const INITIAL_BACKOFF_MS = 1_000;

@Injectable()
export class TwinAgentAdapter implements AuditAgentPort {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(TwinAgentAdapter.name);
  }

  async triggerAudit(
    brief: AuditBrief,
  ): Promise<Result<{ agentId: string }, DomainError>> {
    const triggerId = this.configService.get<string>('TWIN_TRIGGER_ID', '');
    const url = `https://build.twin.so/triggers/${triggerId}/webhook`;
    const auditId = brief.callback.auditId;

    let lastError = '';

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const start = Date.now();

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(brief),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        const latencyMs = Date.now() - start;

        if (response.ok) {
          const body = (await response.json()) as { id?: string };
          const agentId = body.id ?? 'unknown';

          this.logger.info('Twin agent triggered', {
            auditId,
            agentId,
            status: 'triggered',
            latencyMs,
          });

          return Result.ok({ agentId });
        }

        lastError = `HTTP ${response.status}`;
        this.logger.warn('Twin agent trigger failed', {
          auditId,
          attempt,
          status: response.status,
          latencyMs,
        });
      } catch (error) {
        const latencyMs = Date.now() - start;
        lastError =
          error instanceof Error ? error.message : 'Unknown error';

        this.logger.warn('Twin agent trigger error', {
          auditId,
          attempt,
          error: lastError,
          latencyMs,
        });
      }

      if (attempt < MAX_RETRIES) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        await this.sleep(backoff);
      }
    }

    this.logger.error('Twin agent trigger exhausted retries', {
      auditId,
      maxRetries: MAX_RETRIES,
      lastError,
    });

    return Result.err(new AuditAgentTriggerError(lastError));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

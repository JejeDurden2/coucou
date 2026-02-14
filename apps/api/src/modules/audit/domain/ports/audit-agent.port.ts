import type { TwinCrawlInput } from '@coucou-ia/shared';

import type { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';

export const AUDIT_AGENT_PORT = Symbol('AUDIT_AGENT_PORT');

export interface AuditAgentPort {
  triggerCrawl(
    input: TwinCrawlInput,
  ): Promise<Result<{ agentId: string }, DomainError>>;
}

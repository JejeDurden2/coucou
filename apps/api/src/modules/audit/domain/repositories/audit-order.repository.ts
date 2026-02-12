import type { AuditOrder } from '../entities/audit-order.entity';

export const AUDIT_ORDER_REPOSITORY = Symbol('AUDIT_ORDER_REPOSITORY');

export interface AuditOrderRepository {
  save(auditOrder: AuditOrder): Promise<AuditOrder>;
  findById(id: string): Promise<AuditOrder | null>;
  findByProjectId(projectId: string): Promise<AuditOrder[]>;
  findByUserId(userId: string): Promise<AuditOrder[]>;
  findActiveByProjectId(projectId: string): Promise<AuditOrder | null>;
  findLatestByProjectId(projectId: string): Promise<AuditOrder | null>;
  findTimedOutAudits(): Promise<AuditOrder[]>;
}

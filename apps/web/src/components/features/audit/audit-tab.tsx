'use client';

import { AuditStatus } from '@coucou-ia/shared';

import { useLatestAudit, useCreateAuditCheckout } from '@/hooks/use-audit';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { useProject } from '@/hooks/use-projects';
import { Card, CardContent } from '@/components/ui/card';

import { AuditEmptyState } from './audit-empty-state';
import { AuditProcessing } from './audit-processing';
import { AuditError } from './audit-error';
import { AuditResults } from './audit-results';

function AuditSkeleton(): React.ReactNode {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-4 w-80 rounded bg-muted animate-pulse" />
      </div>
      <Card>
        <CardContent className="py-12">
          <div className="space-y-4">
            <div className="h-4 w-full rounded bg-muted animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AuditTabProps {
  projectId: string;
}

export function AuditTab({ projectId }: AuditTabProps): React.ReactNode {
  const { data: audit, isLoading: isAuditLoading } = useLatestAudit(projectId);
  const { data: stats } = useDashboardStats(projectId);
  const { data: project } = useProject(projectId);
  const createCheckout = useCreateAuditCheckout(projectId);

  if (isAuditLoading) {
    return <AuditSkeleton />;
  }

  if (!audit || !audit.hasAudit) {
    return (
      <AuditEmptyState
        stats={stats}
        brandName={project?.brandName ?? ''}
        domain={project?.domain ?? ''}
        onLaunchAudit={() => createCheckout.mutate()}
        isLaunching={createCheckout.isPending}
      />
    );
  }

  if (
    audit.status === AuditStatus.PENDING ||
    audit.status === AuditStatus.PAID ||
    audit.status === AuditStatus.PROCESSING
  ) {
    return (
      <AuditProcessing
        paidAt={audit.paidAt}
        startedAt={audit.startedAt}
      />
    );
  }

  if (
    audit.status === AuditStatus.COMPLETED ||
    audit.status === AuditStatus.PARTIAL
  ) {
    return (
      <AuditResults
        status={audit.status}
        result={audit.result}
        reportUrl={audit.reportUrl}
        brandName={project?.brandName ?? ''}
      />
    );
  }

  return (
    <AuditError
      status={audit.status}
      onRetry={() => createCheckout.mutate()}
      isRetrying={createCheckout.isPending}
    />
  );
}

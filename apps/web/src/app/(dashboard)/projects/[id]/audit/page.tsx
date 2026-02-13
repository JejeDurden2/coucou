'use client';

import { use } from 'react';
import { AuditStatus } from '@coucou-ia/shared';

import { useLatestAudit, useCreateAuditCheckout } from '@/hooks/use-audit';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { useProject } from '@/hooks/use-projects';
import { Card, CardContent } from '@/components/ui/card';
import {
  AuditEmptyState,
  AuditProcessing,
  AuditError,
  AuditResults,
} from '@/components/features/audit';

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

interface AuditPageProps {
  params: Promise<{ id: string }>;
}

export default function AuditPage({ params }: AuditPageProps): React.ReactNode {
  const { id: projectId } = use(params);
  const { data: audit, isLoading: isAuditLoading } = useLatestAudit(projectId);
  const { data: stats } = useDashboardStats(projectId);
  const { data: project } = useProject(projectId);
  const createCheckout = useCreateAuditCheckout(projectId);

  if (isAuditLoading) {
    return <AuditSkeleton />;
  }

  // No audit exists
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

  // In progress states
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

  // Completed states
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

  // Error states (FAILED, TIMEOUT, SCHEMA_ERROR)
  return (
    <AuditError
      status={audit.status}
      onRetry={() => createCheckout.mutate()}
      isRetrying={createCheckout.isPending}
    />
  );
}

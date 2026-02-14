'use client';

import { useSearchParams } from 'next/navigation';
import { AuditStatus } from '@coucou-ia/shared';

import { useLatestAudit, useCreateAuditCheckout } from '@/hooks/use-audit';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { useProject } from '@/hooks/use-projects';
import { Card, CardContent } from '@/components/ui/card';

import { AuditEmptyState } from './audit-empty-state';
import { AuditProcessing } from './audit-processing';
import { AuditError } from './audit-error';
import { AuditDashboard } from './audit-dashboard';

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
  const searchParams = useSearchParams();
  const justPaid = searchParams.get('success') === 'true';
  const { data: audit, isLoading: isAuditLoading } = useLatestAudit(projectId, justPaid);
  const { data: stats } = useDashboardStats(projectId);
  const { data: project } = useProject(projectId);
  const createCheckout = useCreateAuditCheckout(projectId);

  if (isAuditLoading) {
    return <AuditSkeleton />;
  }

  // User just returned from Stripe payment, waiting for webhook to confirm
  if (justPaid && (!audit || !audit.hasAudit)) {
    return (
      <AuditProcessing
        status={AuditStatus.PAID}
        pagesAnalyzedClient={null}
        competitorsAnalyzed={[]}
      />
    );
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

  // In-progress states: PAID, CRAWLING
  if (
    audit.status === AuditStatus.PAID ||
    audit.status === AuditStatus.CRAWLING
  ) {
    return (
      <AuditProcessing
        status={audit.status}
        pagesAnalyzedClient={null}
        competitorsAnalyzed={[]}
      />
    );
  }

  if (audit.status === AuditStatus.ANALYZING) {
    return (
      <AuditProcessing
        status={audit.status}
        pagesAnalyzedClient={audit.pagesAnalyzedClient}
        competitorsAnalyzed={audit.competitorsAnalyzed}
      />
    );
  }

  // Completed state: dashboard summary
  if (audit.status === AuditStatus.COMPLETED) {
    return (
      <AuditDashboard
        projectId={projectId}
        audit={audit}
        onRelaunch={() => createCheckout.mutate()}
        isRelaunching={createCheckout.isPending}
      />
    );
  }

  // Failed state
  return (
    <AuditError
      failureReason={'failureReason' in audit ? audit.failureReason : null}
    />
  );
}

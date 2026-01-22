'use client';

import { SubscriptionStatus } from '@coucou-ia/shared';

import { Badge } from '@/components/ui/badge';
import { formatDateFr } from '@/lib/utils';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export function SubscriptionStatusBadge({
  status,
  cancelAtPeriodEnd,
  currentPeriodEnd,
}: SubscriptionStatusBadgeProps): React.ReactNode {
  if (!status) {
    return null;
  }

  if (cancelAtPeriodEnd && currentPeriodEnd) {
    return (
      <Badge variant="warning">Se termine le {formatDateFr(currentPeriodEnd)}</Badge>
    );
  }

  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return <Badge variant="success">Actif</Badge>;
    case SubscriptionStatus.PAST_DUE:
      return <Badge variant="destructive">Paiement en retard</Badge>;
    case SubscriptionStatus.CANCELED:
      return <Badge variant="muted">Annulé</Badge>;
    default:
      return null;
  }
}

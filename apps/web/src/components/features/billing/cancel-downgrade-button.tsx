'use client';

import { Button } from '@/components/ui/button';

interface CancelDowngradeButtonProps {
  onCancel: () => void;
  isPending: boolean;
}

export function CancelDowngradeButton({
  onCancel,
  isPending,
}: CancelDowngradeButtonProps): React.ReactNode {
  return (
    <Button variant="default" size="sm" onClick={onCancel} disabled={isPending}>
      {isPending ? 'Réactivation...' : "Réactiver l'abonnement"}
    </Button>
  );
}

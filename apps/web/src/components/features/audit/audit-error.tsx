'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AuditErrorProps {
  failureReason: string | null;
}

const SUPPORT_MAILTO =
  'mailto:support@coucou-ia.com?subject=Audit%20GEO%20en%20erreur&body=Bonjour%2C%0A%0AMon%20audit%20GEO%20a%20rencontr%C3%A9%20une%20erreur.%20Pourriez-vous%20v%C3%A9rifier%20%3F%0A%0AMerci';

export function AuditError({ failureReason }: AuditErrorProps): React.ReactNode {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-balance">Audit GEO</h1>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center text-center py-12 space-y-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            {failureReason ?? "L'analyse a rencontré un problème."}
          </p>
          <p className="text-xs text-muted-foreground max-w-md">
            Si vous avez été débité, un remboursement sera effectué automatiquement.
          </p>
          <div className="pt-2">
            <Button variant="outline" asChild>
              <a href={SUPPORT_MAILTO}>Contacter le support</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

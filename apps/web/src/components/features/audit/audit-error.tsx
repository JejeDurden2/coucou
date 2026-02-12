'use client';

import { AlertTriangle } from 'lucide-react';
import { AuditStatus } from '@coucou-ia/shared';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AuditErrorProps {
  status: AuditStatus.FAILED | AuditStatus.TIMEOUT | AuditStatus.SCHEMA_ERROR;
  onRetry: () => void;
  isRetrying: boolean;
}

function getErrorMessage(status: AuditStatus): string {
  if (status === AuditStatus.TIMEOUT) {
    return "L'analyse prend plus de temps que prévu. Notre équipe a été notifiée.";
  }
  return "L'analyse a rencontré un problème.";
}

export function AuditError({ status, onRetry, isRetrying }: AuditErrorProps): React.ReactNode {
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
            {getErrorMessage(status)}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="outline" asChild>
              <a href="mailto:support@coucou-ia.com">Contacter le support</a>
            </Button>
            <Button onClick={onRetry} disabled={isRetrying}>
              {isRetrying ? 'Redirection...' : "Relancer l'audit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

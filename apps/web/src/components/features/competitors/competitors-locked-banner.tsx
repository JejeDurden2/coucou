'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const CompetitorsLockedBanner = memo(function CompetitorsLockedBanner() {
  return (
    <div className="relative">
      {/* Blurred background placeholder */}
      <div className="absolute inset-0 blur-sm opacity-30 pointer-events-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-36 bg-muted rounded-lg" />
          ))}
        </div>
      </div>

      {/* Lock overlay */}
      <Card className="relative z-10 mx-auto max-w-md mt-16 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="size-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-balance">Analyse des concurrents</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Découvrez quels concurrents sont cités par les IA, leur position et leur évolution
                dans le temps.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="size-4" aria-hidden="true" />
              <span>Tendances, positions par modèle, keywords...</span>
            </div>
            <Button asChild className="w-full">
              <Link href="/billing">Passer à SOLO</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

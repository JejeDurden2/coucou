'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Lock, Brain } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const SentimentLockedBanner = memo(function SentimentLockedBanner() {
  return (
    <div className="relative">
      {/* Blurred background placeholder */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
          {Array.from({ length: 2 }, (_, i) => (
            <div key={`full-${i}`} className="h-24 bg-muted rounded-lg sm:col-span-2" />
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
              <h3 className="text-lg font-semibold text-balance">Débloquez l'analyse sentiment</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Découvrez comment les IA perçoivent votre marque : thèmes associés, points positifs
                et axes d'amélioration.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Brain className="size-4" aria-hidden="true" />
              <span>Analyse GPT + Claude chaque semaine</span>
            </div>
            <Button asChild className="w-full">
              <Link href="/billing">Passer au plan Solo</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

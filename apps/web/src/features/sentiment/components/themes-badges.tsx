'use client';

import { memo, useMemo } from 'react';
import { Tag } from 'lucide-react';
import type { ThemeWithMetadata } from '@coucou-ia/shared';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ThemesBadgesProps {
  themes: ThemeWithMetadata[];
}

function getSentimentColor(sentiment: 'positive' | 'negative' | 'neutral'): string {
  switch (sentiment) {
    case 'positive':
      return 'border-green-500/50 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300';
    case 'negative':
      return 'border-red-500/50 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
    case 'neutral':
      return 'border-muted bg-muted/30 text-muted-foreground';
  }
}

export const ThemesBadges = memo(function ThemesBadges({ themes }: ThemesBadgesProps) {
  // Mémoriser le tri pour éviter recalcul à chaque render
  const sortedThemes = useMemo(
    () => [...themes].sort((a, b) => b.weight - a.weight),
    [themes],
  );

  if (sortedThemes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Tag className="size-4 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="text-sm font-medium">Thèmes associés</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {sortedThemes.map((theme) => (
            <div key={theme.name} className="flex items-center gap-1.5">
              <Badge variant="outline" className={cn('text-sm', getSentimentColor(theme.sentiment))}>
                {theme.name}
              </Badge>
              <span
                className="text-xs text-muted-foreground tabular-nums"
                aria-label={`Importance: ${theme.weight} pourcent`}
              >
                {theme.weight}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

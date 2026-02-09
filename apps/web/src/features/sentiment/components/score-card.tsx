'use client';

import { memo } from 'react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { getSentimentVariant, variantTextStyles } from '../lib/sentiment-variant';

interface ScoreCardProps {
  score: number;
  themes: string[];
}

export const ScoreCard = memo(function ScoreCard({ score, themes }: ScoreCardProps) {
  const { variant, icon: Icon } = getSentimentVariant(score);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          Score Sentiment
          <InfoTooltip term="sentiment" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Icon className={cn('size-8', variantTextStyles[variant])} aria-hidden="true" />
          <span className={cn('text-3xl font-bold tabular-nums', variantTextStyles[variant])}>
            {Math.round(score)}%
          </span>
        </div>
        {themes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {themes.slice(0, 3).map((theme) => (
              <Badge key={theme} variant="muted" className="text-xs">
                {theme}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

'use client';

import { memo } from 'react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { getSentimentVariant, variantTextStyles } from '../lib/sentiment-variant';

interface ScoreCardProps {
  score: number;
}

export const ScoreCard = memo(function ScoreCard({ score }: ScoreCardProps) {
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
      </CardContent>
    </Card>
  );
});

'use client';

import { memo } from 'react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSentimentVariant, variantTextStyles } from '../lib/sentiment-variant';

interface ScoreCardProps {
  provider: 'gpt' | 'claude';
  score: number;
  themes: string[];
}

const PROVIDER_CONFIG = {
  gpt: {
    label: 'Score GPT',
    badgeVariant: 'chatgpt' as const,
  },
  claude: {
    label: 'Score Claude',
    badgeVariant: 'claude' as const,
  },
} as const;

export const ScoreCard = memo(function ScoreCard({ provider, score, themes }: ScoreCardProps) {
  const { variant, icon: Icon } = getSentimentVariant(score);
  const config = PROVIDER_CONFIG[provider];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
          <Badge variant={config.badgeVariant}>{provider.toUpperCase()}</Badge>
        </div>
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

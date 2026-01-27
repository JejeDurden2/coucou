'use client';

import { memo } from 'react';
import { Check, X, MessageCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KeywordsListProps {
  positive: string[];
  negative: string[];
}

export const KeywordsList = memo(function KeywordsList({ positive, negative }: KeywordsListProps) {
  if (positive.length === 0 && negative.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-4 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="text-sm font-medium">Mots-clés associés</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Positive keywords */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase text-pretty">
              Points positifs
            </p>
            <ul className="space-y-1.5">
              {positive.map((keyword) => (
                <li key={keyword} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-success flex-shrink-0" aria-hidden="true" />
                  <span>{keyword}</span>
                </li>
              ))}
              {positive.length === 0 && <li className="text-sm text-muted-foreground">Aucun</li>}
            </ul>
          </div>

          {/* Negative keywords */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase text-pretty">
              Points négatifs
            </p>
            <ul className="space-y-1.5">
              {negative.map((keyword) => (
                <li key={keyword} className="flex items-center gap-2 text-sm">
                  <X className="size-4 text-destructive flex-shrink-0" aria-hidden="true" />
                  <span>{keyword}</span>
                </li>
              ))}
              {negative.length === 0 && <li className="text-sm text-muted-foreground">Aucun</li>}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

'use client';

import { memo } from 'react';
import { Tag } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ThemesBadgesProps {
  themes: string[];
}

export const ThemesBadges = memo(function ThemesBadges({ themes }: ThemesBadgesProps) {
  if (themes.length === 0) {
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
          {themes.map((theme) => (
            <Badge key={theme} variant="outline" className="text-sm">
              {theme}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

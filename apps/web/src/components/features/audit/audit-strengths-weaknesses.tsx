'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuditStrengthsWeaknessesProps {
  strengths: string[];
  weaknesses: string[];
}

export function AuditStrengthsWeaknesses({ strengths, weaknesses }: AuditStrengthsWeaknessesProps): React.ReactNode {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-balance">
            <ThumbsUp className="size-4 text-green-500" />
            Points forts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {strengths.map((s) => (
              <li key={s} className="flex gap-2 text-sm">
                <span className="text-green-500 shrink-0">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-balance">
            <ThumbsDown className="size-4 text-red-500" />
            Points faibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {weaknesses.map((w) => (
              <li key={w} className="flex gap-2 text-sm">
                <span className="text-red-500 shrink-0">−</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

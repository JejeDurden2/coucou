'use client';

import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

type InsightType = 'positive' | 'warning' | 'neutral';

interface InsightCardProps {
  type: InsightType;
  message: string | undefined;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

const TYPE_CONFIG: Record<
  InsightType,
  { icon: typeof CheckCircle2; iconClass: string; bgClass: string }
> = {
  positive: {
    icon: CheckCircle2,
    iconClass: 'text-success',
    bgClass: 'bg-success/5',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-destructive',
    bgClass: 'bg-destructive/5',
  },
  neutral: {
    icon: Info,
    iconClass: 'text-muted-foreground',
    bgClass: 'bg-muted/50',
  },
};

export function InsightCard({
  type,
  message,
  ctaLabel,
  ctaHref,
  className,
}: InsightCardProps): React.ReactNode {
  if (!message) return null;

  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between',
        config.bgClass,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('size-5 shrink-0', config.iconClass)} aria-hidden="true" />
        <p className="line-clamp-2 text-pretty text-sm">{message}</p>
      </div>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="shrink-0 text-sm font-medium text-primary hover:underline">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

import type { LucideIcon } from 'lucide-react';
import { Smile, Meh, Frown } from 'lucide-react';

export type SentimentVariant = 'success' | 'warning' | 'destructive';

interface SentimentStyle {
  variant: SentimentVariant;
  icon: LucideIcon;
}

const POSITIVE_THRESHOLD = 60;
const NEUTRAL_THRESHOLD = 40;

export function getSentimentVariant(score: number): SentimentStyle {
  if (score >= POSITIVE_THRESHOLD) {
    return { variant: 'success', icon: Smile };
  }
  if (score >= NEUTRAL_THRESHOLD) {
    return { variant: 'warning', icon: Meh };
  }
  return { variant: 'destructive', icon: Frown };
}

export const variantTextStyles: Record<SentimentVariant, string> = {
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
};

export const variantBgStyles: Record<SentimentVariant, string> = {
  success: 'bg-success/10 border-success/20',
  warning: 'bg-warning/10 border-warning/20',
  destructive: 'bg-destructive/10 border-destructive/20',
};

export const AUDIT_PRICE_LABEL = '250 € HT';

const SCORE_THRESHOLD_GOOD = 70;
const SCORE_THRESHOLD_MEDIUM = 40;

export function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLD_GOOD) return 'text-green-500';
  if (score >= SCORE_THRESHOLD_MEDIUM) return 'text-yellow-500';
  return 'text-red-500';
}

export function getBarColor(score: number): string {
  if (score >= SCORE_THRESHOLD_GOOD) return 'bg-green-500';
  if (score >= SCORE_THRESHOLD_MEDIUM) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function getStrokeColor(score: number): string {
  if (score >= SCORE_THRESHOLD_GOOD) return 'stroke-green-500';
  if (score >= SCORE_THRESHOLD_MEDIUM) return 'stroke-yellow-500';
  return 'stroke-red-500';
}

export function getVerdictColor(verdict: string | null): string {
  switch (verdict) {
    case 'excellente':
      return 'bg-green-500/15 text-green-400 border-green-500/30';
    case 'correcte':
      return 'bg-lime-500/15 text-lime-400 border-lime-500/30';
    case 'à renforcer':
      return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    case 'insuffisante':
      return 'bg-red-500/15 text-red-400 border-red-500/30';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
}

const FINDING_BORDER_COLORS = [
  'border-l-red-500',
  'border-l-yellow-500',
  'border-l-blue-500',
] as const;

export function getFindingBorderColor(index: number): string {
  return FINDING_BORDER_COLORS[index] ?? 'border-l-muted-foreground';
}

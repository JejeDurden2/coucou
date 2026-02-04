const PODIUM_STYLES: Record<number, string> = {
  1: 'bg-primary/10 border-primary/30',
  2: 'bg-primary/5 border-primary/20',
  3: 'bg-primary/5 border-primary/10',
};

export function getPodiumStyle(rank: number | null): string | undefined {
  if (rank === null) return undefined;
  return PODIUM_STYLES[Math.round(rank)];
}

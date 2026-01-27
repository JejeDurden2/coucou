const PODIUM_STYLES: Record<number, string> = {
  1: 'bg-amber-500/5 border-amber-500/20',
  2: 'bg-slate-300/5 border-slate-400/20',
  3: 'bg-orange-600/5 border-orange-500/20',
};

export function getPodiumStyle(rank: number | null): string | undefined {
  if (rank === null) return undefined;
  return PODIUM_STYLES[Math.round(rank)];
}

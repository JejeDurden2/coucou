const PODIUM_STYLES: Record<number, string> = {
  1: 'bg-amber-500/5 border-amber-500/20 shadow-[inset_0_1px_1px_rgba(251,191,36,0.1)]',
  2: 'bg-slate-300/5 border-slate-400/20 shadow-[inset_0_1px_1px_rgba(148,163,184,0.1)]',
  3: 'bg-orange-600/5 border-orange-500/20 shadow-[inset_0_1px_1px_rgba(234,88,12,0.1)]',
};

export function getPodiumStyle(rank: number | null): string | undefined {
  if (rank === null) return undefined;
  return PODIUM_STYLES[Math.round(rank)];
}

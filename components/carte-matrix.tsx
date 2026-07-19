import { ressourcesShared, type CarteUseCase } from "@/content/ressources";

// Matrice impact x faisabilite, Server Component sans etat. Le visuel (grille
// 3x3 + pastilles) est purement decoratif (aria-hidden) ; la legende ordonnee
// en dessous est le seul contenu accessible, comme demande par la spec.

// Centre de chaque colonne/ligne d'une grille 3x3, en pourcentage (1/6, 3/6, 5/6).
const CELL_CENTER = [1 / 6, 1 / 2, 5 / 6];

// Petit decalage (en points de pourcentage) quand plusieurs cas partagent la
// meme cellule, assez pour lever la collision visuelle sans sortir de la case.
const COLLISION_OFFSETS: [number, number][] = [
  [0, 0],
  [7, -7],
  [-7, 7],
  [7, 7],
  [-7, -7],
];

export function CarteMatrix({ useCases }: { useCases: CarteUseCase[] }) {
  const cellCounts = new Map<string, number>();
  const points = useCases.map((useCase, index) => {
    const key = `${useCase.impact}-${useCase.faisabilite}`;
    const indexInCell = cellCounts.get(key) ?? 0;
    cellCounts.set(key, indexInCell + 1);
    const [offsetX, offsetY] = COLLISION_OFFSETS[indexInCell % COLLISION_OFFSETS.length];

    return {
      title: useCase.title,
      index,
      left: CELL_CENTER[useCase.faisabilite - 1] * 100 + offsetX,
      // Impact haut = en haut de la matrice, donc on inverse l'axe vertical.
      top: (1 - CELL_CENTER[useCase.impact - 1]) * 100 + offsetY,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div aria-hidden className="mx-auto flex w-full max-w-sm flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.12em] text-foreground-dim uppercase">
          {ressourcesShared.axisImpact}
        </span>

        <div className="relative aspect-square w-full">
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }).map((_, cell) => (
              <div key={cell} className="border border-border" />
            ))}
          </div>
          {points.map((point) => (
            <span
              key={point.title}
              className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-primary/15 font-mono text-[10px] text-primary"
              style={{ left: `${point.left}%`, top: `${point.top}%` }}
            >
              {point.index + 1}
            </span>
          ))}
        </div>

        <span className="self-end font-mono text-[10px] tracking-[0.12em] text-foreground-dim uppercase">
          {ressourcesShared.axisFaisabilite}
        </span>
      </div>

      <ol className="flex flex-col gap-2">
        {useCases.map((useCase, index) => (
          <li
            key={useCase.title}
            className="flex items-baseline gap-3 text-sm leading-relaxed text-muted-foreground"
          >
            <span className="font-mono text-primary tabular-nums">{index + 1}.</span>
            <span>{useCase.title}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

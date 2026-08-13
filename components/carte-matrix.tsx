import { cn } from "@/lib/utils";
import { ressourcesShared, type CarteUseCase } from "@/content/ressources";

// Matrice impact × faisabilité, Server Component sans état. Le visuel signature
// de la carte : grille 3×3 avec les libellés de quadrants, axes fléchés, et une
// pastille numérotée par cas. Le cas n°1 (le chemin recommandé) est plein.
// Quand `linked` est vrai, chaque pastille et chaque ligne de légende sont des
// ancres vers la section du cas (#cas-N) : la matrice devient une table des
// matières. La légende sous la grille reste la lecture accessible complète.

// Centre de chaque colonne/ligne d'une grille 3x3, en pourcentage (1/6, 3/6, 5/6).
const CELL_CENTER = [1 / 6, 1 / 2, 5 / 6];

// Petit décalage (en points de pourcentage) quand plusieurs cas partagent la
// même cellule, assez pour lever la collision visuelle sans sortir de la case.
const COLLISION_OFFSETS: [number, number][] = [
  [0, 0],
  [7, -7],
  [-7, 7],
  [7, 7],
  [-7, -7],
];

const quadrantClasses =
  "pointer-events-none absolute font-mono text-[9px] tracking-[0.1em] text-foreground-dim uppercase";

export function CarteMatrix({
  useCases,
  linked = false,
}: {
  useCases: CarteUseCase[];
  linked?: boolean;
}) {
  const cellCounts = new Map<string, number>();
  const points = useCases.map((useCase, index) => {
    const key = `${useCase.impact}-${useCase.faisabilite}`;
    const indexInCell = cellCounts.get(key) ?? 0;
    cellCounts.set(key, indexInCell + 1);
    const [offsetX, offsetY] = COLLISION_OFFSETS[indexInCell % COLLISION_OFFSETS.length];

    return {
      title: useCase.title,
      metric: useCase.metric,
      index,
      left: CELL_CENTER[useCase.faisabilite - 1] * 100 + offsetX,
      // Impact haut = en haut de la matrice, donc on inverse l'axe vertical.
      top: (1 - CELL_CENTER[useCase.impact - 1]) * 100 + offsetY,
    };
  });

  const dotClasses = (index: number) =>
    cn(
      "absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono text-xs tabular-nums",
      index === 0
        ? "border-primary bg-primary text-primary-foreground"
        : "border-primary bg-card text-primary",
      linked &&
        "outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        {/* Axe vertical : écrit de bas en haut, la flèche pointe vers le haut. */}
        <span
          aria-hidden
          className="self-center font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase [writing-mode:vertical-rl] rotate-180"
        >
          {ressourcesShared.axisImpact} →
        </span>

        <div className="relative aspect-square w-full">
          <div aria-hidden className="absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }).map((_, cell) => (
              <div key={cell} className="border border-border" />
            ))}
          </div>

          {/* Libellés de quadrants : la lecture de la carte en quatre mots. */}
          <span aria-hidden className={cn(quadrantClasses, "top-1.5 left-2")}>
            {ressourcesShared.quadrantTopLeft}
          </span>
          <span aria-hidden className={cn(quadrantClasses, "top-1.5 right-2 text-primary")}>
            {ressourcesShared.quadrantTopRight}
          </span>
          <span aria-hidden className={cn(quadrantClasses, "bottom-1.5 left-2")}>
            {ressourcesShared.quadrantBottomLeft}
          </span>
          <span aria-hidden className={cn(quadrantClasses, "right-2 bottom-1.5")}>
            {ressourcesShared.quadrantBottomRight}
          </span>

          {points.map((point) =>
            linked ? (
              <a
                key={point.title}
                href={`#cas-${point.index + 1}`}
                aria-label={`Cas ${point.index + 1} : ${point.title}`}
                className={dotClasses(point.index)}
                style={{ left: `${point.left}%`, top: `${point.top}%` }}
              >
                {point.index + 1}
              </a>
            ) : (
              <span
                key={point.title}
                aria-hidden
                className={dotClasses(point.index)}
                style={{ left: `${point.left}%`, top: `${point.top}%` }}
              >
                {point.index + 1}
              </span>
            )
          )}
        </div>
      </div>

      <span
        aria-hidden
        className="self-end font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase"
      >
        {ressourcesShared.axisFaisabilite} →
      </span>

      {/* La légende est la lecture accessible : numéro, titre, ordre de grandeur. */}
      <ol className="flex flex-col">
        {useCases.map((useCase, index) => {
          const row = (
            <>
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] tabular-nums",
                  index === 0
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary text-primary"
                )}
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm leading-snug text-muted-foreground">
                {useCase.title}
              </span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-primary">
                {useCase.metric}
              </span>
            </>
          );

          return (
            <li key={useCase.title} className="border-t border-border first:border-t-0">
              {linked ? (
                <a
                  href={`#cas-${index + 1}`}
                  className="flex items-center gap-3 rounded-sm py-2.5 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {row}
                </a>
              ) : (
                <div className="flex items-center gap-3 py-2.5">{row}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

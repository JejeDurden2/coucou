import { cn } from "@/lib/utils";

// Marque Coucou IA : tete de coucou en papier plie (origami), monochrome.
// La couleur vient de currentColor : `text-primary` (bleu electrique) sur fond
// sombre, `text-primary-foreground` (encre) sur fond clair. L’oeil est un vrai
// trou (fill-rule evenodd) : le fond traverse sur n’importe quel support.
// Geometrie construite : 9 sommets sur un cercle de rayon 10, ancrages du bec
// a -44, -18 et +10 degres, base du bec parallele aux aretes du visage.
export function LogoMark({
  className,
  animated = false,
  style,
}: {
  className?: string;
  /* Joue le pliage origami au montage (.lm-anim, globals.css). Rejouer = remonter via key. */
  animated?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("shrink-0", animated && "lm-anim", className)}
      style={style}
    >
      <polygon
        fill="currentColor"
        points="12.25,6.3 5.53,8.93 2.6,16 5.53,23.07 12.25,25.7"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12.95 6.15V25.85L19.67 23.07L22.45 17.74L22.11 12.91L19.79 9.05ZM15.1 12.1a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0-4.2 0Z"
      />
      <polygon
        fill="currentColor"
        points="21.16,10.07 30.3,13.5 23.03,16.63 22.72,12.72"
      />
    </svg>
  );
}

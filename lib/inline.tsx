import Link from "next/link";
import type { ReactNode } from "react";

// Micro-markdown des textes du blog : liens [texte](/chemin) et gras **texte**.
// Le texte nu de la même syntaxe vit dans lib/inline-text.ts, sans React.
// Zéro dépendance : le corps d'un article reste une donnée typée, jamais du JSX
// dispersé dans le contenu. Les liens internes portent le maillage SEO.
const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

const linkClasses =
  "rounded-sm text-foreground underline decoration-border underline-offset-4 outline-none transition-colors hover:text-primary hover:decoration-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// ponytail: un seul passage de regex, pas de tokenizer. Le jour où le contenu
// demande du code inline ou de l'italique, ajouter une alternative au motif.
export function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(pattern)) {
    const [raw, label, href, bold] = match;
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }
    cursor = match.index + raw.length;

    if (bold) {
      nodes.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {bold}
        </strong>
      );
    } else if (href.startsWith("/")) {
      nodes.push(
        <Link key={match.index} href={href} className={linkClasses}>
          {label}
        </Link>
      );
    } else {
      nodes.push(
        <a key={match.index} href={href} className={linkClasses} rel="noreferrer">
          {label}
        </a>
      );
    }
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }
  return nodes;
}

// Petits assembleurs markdown. Rien d'une bibliothèque : cinq fonctions qui
// évitent de recoller des chaînes à la main dans lib/markdown/pages.ts.

export type MarkdownDocument = {
  // Chemin canonique de la page HTML équivalente.
  path: string;
  title: string;
  description: string;
  body: string;
};

/** Assemble des blocs en sautant les vides, une ligne blanche entre chacun. */
export function blocks(...parts: (string | null | undefined | false)[]): string {
  return parts.filter((part): part is string => Boolean(part && part.trim())).join("\n\n");
}

export function heading(level: 2 | 3 | 4, text: string): string {
  return `${"#".repeat(level)} ${text}`;
}

export function list(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

export function link(label: string, href: string): string {
  return `[${label}](${href})`;
}

/** Tableau markdown à deux colonnes ou plus. `rows` doit avoir la largeur de `head`. */
export function table(head: readonly string[], rows: readonly (readonly string[])[]): string {
  const line = (cells: readonly string[]) => `| ${cells.join(" | ")} |`;
  return [line(head), line(head.map(() => "---")), ...rows.map(line)].join("\n");
}

/** Section « Questions fréquentes » : une question en h3, sa réponse dessous. */
export function faqSection(
  title: string,
  items: readonly { question: string; answer: string }[]
): string {
  if (items.length === 0) return "";
  return blocks(
    heading(2, title),
    ...items.map((item) => blocks(heading(3, item.question), item.answer))
  );
}

// Le micro-markdown de lib/inline ([texte](/chemin), **gras**) est déjà du
// markdown : les textes de contenu passent tels quels, on nettoie seulement
// les espaces insécables qui gênent la lecture d'un agent.
export function plainText(text: string): string {
  return text.replace(/ /g, " ");
}

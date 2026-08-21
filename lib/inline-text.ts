// Texte nu d'une chaîne à micro-markdown : métadonnées, JSON-LD, RSS, markdown,
// comptage des mots. Rien ne doit sortir du site avec des crochets ou des
// astérisques.
//
// Séparé de lib/inline.tsx : le rendu React du micro-markdown vit là-bas, cette
// fonction-ci est du texte pur. Les modules de contenu (content/blog.ts) et les
// représentations non-HTML l'appellent sans tirer React derrière eux.
export function plain(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}

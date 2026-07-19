"use client";

// L’année seule en feuille client : le rendu statique fige new Date() au
// build, le client la corrige après le 1er janvier (suppressHydrationWarning).
export function FooterYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}

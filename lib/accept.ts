// Négociation de contenu par l'en-tête Accept (RFC 9110 §12.5.1), pour servir
// du markdown aux agents et du HTML aux navigateurs sur la même URL.
// Convention : https://acceptmarkdown.com
//
// Fonctions pures, sans dépendance à Next : proxy.ts les appelle, les tests
// les appellent directement.

export const HTML_TYPE = "text/html";
export const MARKDOWN_TYPE = "text/markdown";

// Ordre significatif : sans en-tête Accept, le premier type gagne.
export const PRODUCES = [HTML_TYPE, MARKDOWN_TYPE] as const;

export type Produced = (typeof PRODUCES)[number];

type AcceptEntry = {
  type: string;
  q: number;
  // 2 = type/sous-type, 1 = type/*, 0 = */*. Un intervalle plus précis
  // l'emporte sur un moins précis, quel que soit son q.
  specificity: 0 | 1 | 2;
};

function parseAccept(header: string): AcceptEntry[] {
  return header.split(",").flatMap((raw) => {
    const parts = raw.trim().split(";").map((part) => part.trim());
    const type = parts[0]?.toLowerCase() ?? "";
    if (type === "") return [];

    let q = 1;
    for (const param of parts.slice(1)) {
      const [name, value] = param.split("=").map((part) => part.trim());
      if (name?.toLowerCase() !== "q") continue;
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
    }

    const specificity = type === "*/*" ? 0 : type.endsWith("/*") ? 1 : 2;
    return [{ type, q, specificity }];
  });
}

function matches(entry: AcceptEntry, candidate: string): boolean {
  if (entry.type === "*/*") return true;
  if (entry.type.endsWith("/*")) {
    return candidate.startsWith(entry.type.slice(0, -1));
  }
  return entry.type === candidate;
}

/**
 * Le type que le serveur doit produire, ou `null` quand le client refuse tout
 * ce qu'on sait produire (le seul cas qui justifie un 406). Un en-tête absent
 * ou vide retombe sur le HTML.
 */
export function preferredType(header: string | null | undefined): Produced | null {
  if (!header) return PRODUCES[0];
  const entries = parseAccept(header);
  if (entries.length === 0) return PRODUCES[0];

  let best: Produced | null = null;
  let bestQ = -1;
  let bestPosition = Number.POSITIVE_INFINITY;

  for (const candidate of PRODUCES) {
    // Pour chaque candidat, l'intervalle correspondant le plus précis. C'est
    // ce qui fait que « text/html;q=0, */* » rejette bien le HTML au lieu de
    // laisser le joker le repêcher.
    let matched: AcceptEntry | null = null;
    let matchedPosition = Number.POSITIVE_INFINITY;

    for (const [index, entry] of entries.entries()) {
      if (!matches(entry, candidate)) continue;
      if (
        matched === null ||
        entry.specificity > matched.specificity ||
        (entry.specificity === matched.specificity && index < matchedPosition)
      ) {
        matched = entry;
        matchedPosition = index;
      }
    }

    if (matched === null || matched.q <= 0) continue;

    // Entre candidats : le q le plus haut gagne, à égalité l'ordre du client
    // tranche, pour que « text/markdown, text/html » donne bien du markdown.
    if (
      matched.q > bestQ ||
      (matched.q === bestQ && matchedPosition < bestPosition)
    ) {
      bestQ = matched.q;
      bestPosition = matchedPosition;
      best = candidate;
    }
  }

  return best;
}

/**
 * Ajoute `Accept` au Vary existant sans écraser les valeurs de Next
 * (rsc, next-router-state-tree...). Sans ça, un CDN sert la variante HTML
 * en cache à l'agent qui demande du markdown, ou l'inverse.
 */
export function appendVaryAccept(headers: Headers): void {
  const existing = headers.get("Vary");
  if (!existing) {
    headers.set("Vary", "Accept");
    return;
  }
  const tokens = existing.split(",").map((token) => token.trim().toLowerCase());
  if (tokens.includes("*") || tokens.includes("accept")) return;
  headers.set("Vary", `${existing}, Accept`);
}

// Fichiers markdown servis tels quels depuis public/ : leur URL finit par
// « .md » sans être le miroir markdown d'une page HTML. Le proxy doit les
// laisser passer, sinon on renvoie un 404 markdown à la place du fichier.
export const STATIC_MARKDOWN_FILES: readonly string[] = [
  "/charte-ia-modele.md",
  "/agent-instructions.md",
];

// Extensions servies telles quelles depuis public/ ou par un route handler
// dédié (sitemap, RSS, robots) : une seule représentation, rien à négocier.
const PASSTHROUGH_EXTENSIONS = new Set([
  "css",
  "ico",
  "jpeg",
  "jpg",
  "js",
  "json",
  "map",
  "pdf",
  "png",
  "svg",
  "txt",
  "webmanifest",
  "webp",
  "woff",
  "woff2",
  "xml",
]);

export type Negotiation =
  | { kind: "passthrough" }
  | { kind: "html" }
  | { kind: "markdown"; path: string }
  | { kind: "not-acceptable" };

/**
 * Décide quoi faire d'une requête. `path` du résultat markdown est le chemin
 * canonique de la page (suffixe « .md » retiré), celui que connaît le registre.
 */
export function negotiate(pathname: string, acceptHeader: string | null): Negotiation {
  if (STATIC_MARKDOWN_FILES.includes(pathname)) return { kind: "passthrough" };

  // Une URL en « .md » sert du markdown quelle que soit la négociation : c'est
  // la cible du Link rel="alternate", suivie par des robots qui n'envoient
  // parfois aucun en-tête Accept.
  if (pathname.endsWith(".md")) {
    return { kind: "markdown", path: normalizePath(pathname.slice(0, -3)) };
  }

  const extension = pathname.split("/").pop()?.split(".").slice(1).pop();
  if (extension !== undefined && PASSTHROUGH_EXTENSIONS.has(extension.toLowerCase())) {
    return { kind: "passthrough" };
  }
  // Images générées par Next (app/opengraph-image.tsx) : pas d'extension.
  if (pathname.endsWith("/opengraph-image")) return { kind: "passthrough" };

  const chosen = preferredType(acceptHeader);
  if (chosen === MARKDOWN_TYPE) return { kind: "markdown", path: normalizePath(pathname) };
  if (chosen === null) return { kind: "not-acceptable" };
  return { kind: "html" };
}

/** « /secteurs/immobilier/ » et « » se ramènent à « /secteurs/immobilier » et « / ». */
export function normalizePath(pathname: string): string {
  if (pathname === "" || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

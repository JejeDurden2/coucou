// Passerelle entre les sources du site et le lanceur de tests de Node
// (`node --test`), sans ajouter de dépendance.
//
// Deux choses que Node ne sait pas faire seul :
//   1. l'alias « @/ » du tsconfig, et les imports sans extension ;
//   2. les imports d'images que Next transforme en StaticImageData.
// Le reste (le typage TypeScript) est retiré par --experimental-strip-types.

import { statSync } from "node:fs";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const root = pathToFileURL(`${process.cwd()}/`);

// « .ts » avant la chaîne vide : « @/content/blog » doit résoudre le fichier
// content/blog.ts, jamais le dossier content/blog/ qui porte le même nom.
const CANDIDATE_SUFFIXES = [".ts", ".tsx", "", "/index.ts", "/index.tsx"];
const ASSET_PATTERN = /\.(svg|png|jpe?g|webp|avif|gif|css)$/;
const ASSET_MARK = "?next-asset";

// Ce que `import logo from "./logo.svg"` vaut sous Next : un objet décrit par
// StaticImageData. Les tests ne regardent jamais dedans, ils ont seulement
// besoin que le module se charge.
const ASSET_SOURCE =
  'export default { src: "/stub.svg", height: 1, width: 1, blurWidth: 0, blurHeight: 0 };';

function isFile(url) {
  try {
    return statSync(url).isFile();
  } catch {
    return false;
  }
}

function resolveAlias(specifier) {
  const target = new URL(specifier.slice(2), root);
  if (ASSET_PATTERN.test(target.pathname)) return `${target.href}${ASSET_MARK}`;
  for (const suffix of CANDIDATE_SUFFIXES) {
    const candidate = new URL(`${target.href}${suffix}`);
    if (isFile(candidate)) return candidate.href;
  }
  return target.href;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return { url: resolveAlias(specifier), shortCircuit: true };
    }
    // Import relatif sans extension, depuis un module déjà résolu.
    if (specifier.startsWith(".") && context.parentURL) {
      const target = new URL(specifier, context.parentURL);
      if (!isFile(target)) {
        for (const suffix of [".ts", ".tsx"]) {
          const candidate = new URL(`${target.href}${suffix}`);
          if (isFile(candidate)) return { url: candidate.href, shortCircuit: true };
        }
      }
    }
    return nextResolve(specifier, context);
  },

  load(url, context, nextLoad) {
    if (url.endsWith(ASSET_MARK)) {
      return { format: "module", shortCircuit: true, source: ASSET_SOURCE };
    }
    return nextLoad(url, context);
  },
});

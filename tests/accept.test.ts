import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  HTML_TYPE,
  MARKDOWN_TYPE,
  appendVaryAccept,
  negotiate,
  normalizePath,
  preferredType,
} from "@/lib/accept";

// Négociation de contenu : les quatre points que vérifie acceptmarkdown.com
// (markdown servi sur Accept, Vary: Accept, 406 quand rien ne convient,
// q-values respectées), plus les chemins qui doivent passer sans négociation.

describe("preferredType", () => {
  it("retombe sur le HTML sans en-tête Accept", () => {
    assert.equal(preferredType(null), HTML_TYPE);
    assert.equal(preferredType(""), HTML_TYPE);
  });

  it("sert du markdown quand le client le demande seul", () => {
    assert.equal(preferredType("text/markdown"), MARKDOWN_TYPE);
  });

  it("sert du HTML au navigateur", () => {
    assert.equal(
      preferredType("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
      HTML_TYPE
    );
  });

  it("sert du HTML sur un joker seul", () => {
    assert.equal(preferredType("*/*"), HTML_TYPE);
  });

  it("respecte les q-values", () => {
    assert.equal(preferredType("text/markdown;q=0.9, text/html;q=1"), HTML_TYPE);
    assert.equal(preferredType("text/markdown;q=1, text/html;q=0.9"), MARKDOWN_TYPE);
  });

  it("tranche à égalité de q par l'ordre du client", () => {
    assert.equal(preferredType("text/markdown, text/html"), MARKDOWN_TYPE);
    assert.equal(preferredType("text/html, text/markdown"), HTML_TYPE);
  });

  it("respecte un q=0 explicite malgré un joker (RFC 9110 §12.5.1)", () => {
    assert.equal(preferredType("text/html;q=0, */*"), MARKDOWN_TYPE);
    assert.equal(preferredType("text/markdown;q=0, */*"), HTML_TYPE);
  });

  it("préfère l'intervalle le plus précis au joker", () => {
    assert.equal(preferredType("text/*;q=0.5, text/markdown;q=0.9"), MARKDOWN_TYPE);
  });

  it("rend null quand le client refuse tout ce qu'on produit", () => {
    assert.equal(preferredType("application/pdf"), null);
    assert.equal(preferredType("text/html;q=0, text/markdown;q=0"), null);
    assert.equal(preferredType("image/png, image/webp"), null);
  });

  it("accepte text/* comme intervalle", () => {
    assert.equal(preferredType("text/*"), HTML_TYPE);
  });
});

describe("appendVaryAccept", () => {
  it("pose Accept quand il n'y a pas de Vary", () => {
    const headers = new Headers();
    appendVaryAccept(headers);
    assert.equal(headers.get("Vary"), "Accept");
  });

  it("ajoute Accept sans écraser les jetons de Next", () => {
    const headers = new Headers({ Vary: "rsc, next-router-state-tree" });
    appendVaryAccept(headers);
    assert.equal(headers.get("Vary"), "rsc, next-router-state-tree, Accept");
  });

  it("n'ajoute pas Accept deux fois", () => {
    const headers = new Headers({ Vary: "rsc, accept" });
    appendVaryAccept(headers);
    assert.equal(headers.get("Vary"), "rsc, accept");
  });

  it("laisse Vary: * intact", () => {
    const headers = new Headers({ Vary: "*" });
    appendVaryAccept(headers);
    assert.equal(headers.get("Vary"), "*");
  });
});

describe("negotiate", () => {
  it("rend le HTML à un navigateur", () => {
    assert.deepEqual(negotiate("/secteurs", "text/html,*/*;q=0.8"), { kind: "html" });
  });

  it("rend le markdown sur Accept: text/markdown", () => {
    assert.deepEqual(negotiate("/secteurs", "text/markdown"), {
      kind: "markdown",
      path: "/secteurs",
    });
  });

  it("rend le markdown sur une URL suffixée .md, quel que soit Accept", () => {
    assert.deepEqual(negotiate("/secteurs/immobilier.md", "text/html"), {
      kind: "markdown",
      path: "/secteurs/immobilier",
    });
    assert.deepEqual(negotiate("/secteurs/immobilier.md", null), {
      kind: "markdown",
      path: "/secteurs/immobilier",
    });
  });

  it("laisse passer les fichiers markdown servis depuis public/", () => {
    assert.deepEqual(negotiate("/charte-ia-modele.md", "text/html"), { kind: "passthrough" });
    assert.deepEqual(negotiate("/agent-instructions.md", "text/markdown"), {
      kind: "passthrough",
    });
  });

  it("laisse passer les fichiers à représentation unique", () => {
    for (const path of [
      "/llms.txt",
      "/robots.txt",
      "/sitemap.xml",
      "/blog/rss.xml",
      "/icon.svg",
      "/brand/logo-coucou-ia.svg",
      "/opengraph-image",
      "/blog/agent-ia-production-lecons/opengraph-image",
    ]) {
      assert.deepEqual(negotiate(path, "text/markdown"), { kind: "passthrough" }, path);
    }
  });

  it("répond 406 quand le client refuse HTML et markdown", () => {
    assert.deepEqual(negotiate("/", "application/pdf"), { kind: "not-acceptable" });
  });

  it("ne répond jamais 406 sans en-tête Accept", () => {
    assert.deepEqual(negotiate("/", null), { kind: "html" });
  });

  it("normalise la racine et les barres finales", () => {
    assert.deepEqual(negotiate("/", "text/markdown"), { kind: "markdown", path: "/" });
    assert.deepEqual(negotiate("/secteurs/", "text/markdown"), {
      kind: "markdown",
      path: "/secteurs",
    });
  });
});

describe("normalizePath", () => {
  it("ramène la racine et les barres finales", () => {
    assert.equal(normalizePath(""), "/");
    assert.equal(normalizePath("/"), "/");
    assert.equal(normalizePath("/blog/"), "/blog");
    assert.equal(normalizePath("/blog"), "/blog");
  });
});

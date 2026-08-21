import assert from "node:assert/strict";
import { describe, it } from "node:test";

import sitemap from "@/app/sitemap";
import { siteUrl } from "@/content/site";
import { markdownDocument, markdownPaths, notFoundMarkdown } from "@/lib/markdown/pages";
import { blocks, faqSection, list, table } from "@/lib/markdown/builder";

// Le miroir markdown doit couvrir tout ce que le sitemap annonce : une URL
// citable par un agent qui ne renverrait rien serait pire qu'une absence.

const sitemapPaths = sitemap().map((entry) =>
  entry.url === siteUrl ? "/" : entry.url.slice(siteUrl.length)
);

describe("registre markdown", () => {
  it("couvre chaque URL du sitemap", () => {
    const missing = sitemapPaths.filter((path) => !markdownDocument(path));
    assert.deepEqual(missing, []);
  });

  it("n'expose aucun document hors du sitemap", () => {
    const extra = markdownPaths().filter((path) => !sitemapPaths.includes(path));
    assert.deepEqual(extra, []);
  });

  it("résout les alias sondés par les agents", () => {
    assert.equal(markdownDocument("/index"), markdownDocument("/"));
    assert.equal(markdownDocument("/about"), markdownDocument("/fondateur"));
    assert.equal(markdownDocument("/privacy"), markdownDocument("/confidentialite"));
  });

  it("rend undefined sur un chemin inconnu", () => {
    assert.equal(markdownDocument("/pas-une-page"), undefined);
  });
});

describe("documents markdown", () => {
  it("ouvre chacun sur un H1 unique suivi du résumé", () => {
    for (const path of markdownPaths()) {
      const doc = markdownDocument(path);
      assert.ok(doc, path);
      const lines = doc.body.split("\n");
      assert.equal(lines[0], `# ${doc.title}`, path);
      assert.equal(lines[2], `> ${doc.description}`, path);
      assert.equal(
        lines.filter((line) => line.startsWith("# ")).length,
        1,
        `${path} doit n'avoir qu'un H1`
      );
    }
  });

  it("termine chacun sur les repères de contact et d'index", () => {
    for (const path of markdownPaths()) {
      const body = markdownDocument(path)?.body ?? "";
      assert.match(body, /Contact : jerome@coucou-ia\.com/, path);
      assert.ok(body.includes(`${siteUrl}/llms.txt`), path);
      assert.ok(body.includes(`${siteUrl}/agent-instructions.md`), path);
    }
  });

  it("porte assez de texte pour être cité", () => {
    for (const path of markdownPaths()) {
      const body = markdownDocument(path)?.body ?? "";
      assert.ok(body.length > 500, `${path} ne fait que ${body.length} caractères`);
    }
  });

  it("n'emploie ni tiret cadratin ni demi-cadratin", () => {
    for (const path of markdownPaths()) {
      const body = markdownDocument(path)?.body ?? "";
      assert.doesNotMatch(body, /[—–]/, path);
    }
  });

  it("ne laisse fuir ni espace insécable ni balise HTML", () => {
    for (const path of markdownPaths()) {
      const body = markdownDocument(path)?.body ?? "";
      assert.doesNotMatch(body, / /, `${path} contient une espace insécable`);
      assert.doesNotMatch(body, /<\/?(div|span|p|section)\b/i, path);
    }
  });

  it("détaille la page d'accueil : offres, méthode et FAQ", () => {
    const body = markdownDocument("/")?.body ?? "";
    assert.match(body, /## On trouve où l’IA rapporte/);
    assert.match(body, /### Trouver\./);
    assert.match(body, /### 01\. Point de départ/);
    assert.match(body, /## Les questions qu’on nous pose vraiment\./);
  });

  it("rend le corps d'un article de blog, blocs compris", () => {
    const body = markdownDocument("/blog/business-case-ia")?.body ?? "";
    assert.match(body, /## À retenir/);
    assert.match(body, /Catégorie : /);
    assert.ok(body.length > 4000, `article trop court : ${body.length}`);
  });

  it("rend le tableau d'une comparaison", () => {
    const body = markdownDocument("/comparaison/esn")?.body ?? "";
    assert.match(body, /\| Le critère \| Coucou IA \|/);
    assert.match(body, /\| --- \|/);
  });

  it("rend la page contact avec les identifiants de la société", () => {
    const body = markdownDocument("/contact")?.body ?? "";
    assert.match(body, /SIREN 100498070/);
    assert.match(body, /jerome@coucou-ia\.com/);
    assert.match(body, /460 avenue de Pessicart/);
  });
});

describe("corps markdown du 404", () => {
  const body = notFoundMarkdown("/pas-une-page");

  it("dit clairement que la page n'existe pas", () => {
    assert.match(body, /^# 404 : page introuvable/);
    assert.ok(body.includes("/pas-une-page"));
  });

  it("donne de quoi rebondir : sitemap, llms.txt, instructions, hubs", () => {
    for (const target of [
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/llms.txt`,
      `${siteUrl}/agent-instructions.md`,
      `${siteUrl}/secteurs`,
      `${siteUrl}/contact`,
    ]) {
      assert.ok(body.includes(target), target);
    }
  });

  it("rappelle ce que fait l'entreprise", () => {
    assert.match(body, /## Ce que fait Coucou IA/);
    assert.match(body, /jerome@coucou-ia\.com/);
  });
});

describe("assembleurs markdown", () => {
  it("saute les blocs vides", () => {
    assert.equal(blocks("a", "", null, undefined, false, "b"), "a\n\nb");
  });

  it("rend une liste et un tableau bien formés", () => {
    assert.equal(list(["a", "b"]), "- a\n- b");
    assert.equal(
      table(["x", "y"], [["1", "2"]]),
      "| x | y |\n| --- | --- |\n| 1 | 2 |"
    );
  });

  it("rend une FAQ, et rien du tout sans question", () => {
    assert.equal(faqSection("Titre", []), "");
    assert.equal(
      faqSection("Titre", [{ question: "Q", answer: "R" }]),
      "## Titre\n\n### Q\n\nR"
    );
  });
});

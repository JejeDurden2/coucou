import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import sitemap from "@/app/sitemap";
import { contact } from "@/content/contact";
import { confidentialite, mentionsLegales } from "@/content/legal";
import { recoveryLinks } from "@/content/not-found";
import { ctaLabel, footerLegalLinks, siteUrl } from "@/content/site";
import { STATIC_MARKDOWN_FILES } from "@/lib/accept";
import { agentRewrites, legacyRedirects, varyAcceptHeaders } from "@/lib/site-routes";

// Ce que les agents lisent avant de citer un site : le fichier d'instructions,
// l'index llms.txt, les pages de confiance, et les alias qu'ils sondent.

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const llms = read("public/llms.txt");
const agentInstructions = read("public/agent-instructions.md");

describe("fichier d'instructions pour agents", () => {
  it("est servi tel quel, jamais réécrit par la négociation", () => {
    assert.ok(STATIC_MARKDOWN_FILES.includes("/agent-instructions.md"));
  });

  it("dit quand solliciter Coucou IA, et quand s'abstenir", () => {
    assert.match(agentInstructions, /^## Quand solliciter Coucou IA$/m);
    assert.match(agentInstructions, /^## Quand ne pas nous recommander$/m);
  });

  it("nomme des cas d'usage précis", () => {
    // Le fichier est écrit en lignes courtes : on compare sur le texte remis
    // à plat, une expression ne doit pas passer à travers un retour à la ligne.
    const flat = agentInstructions.replace(/\s+/g, " ").toLowerCase();
    for (const cue of [
      "business case",
      "trois semaines",
      "journée de formation",
      "openclaw",
      "alpes-maritimes",
    ]) {
      assert.ok(flat.includes(cue), cue);
    }
  });

  it("explique comment transmettre une demande", () => {
    assert.match(agentInstructions, /^## Comment nous transmettre une demande$/m);
    assert.ok(agentInstructions.includes("jerome@coucou-ia.com"));
    assert.ok(agentInstructions.includes(`${siteUrl}/contact`));
  });

  it("explique la négociation markdown", () => {
    assert.ok(agentInstructions.includes("Accept: text/markdown"));
    assert.ok(agentInstructions.includes("/index.md"));
  });

  it("interdit d'inventer un prix ou une référence", () => {
    assert.match(agentInstructions, /Ne citez jamais de prix/);
  });

  it("n'emploie pas de tiret cadratin", () => {
    assert.doesNotMatch(agentInstructions, /[—–]/);
  });
});

describe("llms.txt", () => {
  it("porte la section « quand solliciter »", () => {
    assert.match(llms, /^## Quand solliciter Coucou IA/m);
  });

  it("renvoie vers le fichier d'instructions et la page contact", () => {
    assert.ok(llms.includes(`${siteUrl}/agent-instructions.md`));
    assert.ok(llms.includes(`${siteUrl}/contact`));
  });

  it("documente la négociation markdown", () => {
    assert.match(llms, /^## Servir le contenu en markdown/m);
    assert.ok(llms.includes("Vary: Accept"));
  });

  it("n'emploie pas de tiret cadratin", () => {
    assert.doesNotMatch(llms, /[—–]/);
  });
});

describe("pages de confiance", () => {
  const length = (paragraphs: readonly string[]) =>
    paragraphs.join(" ").length;

  it("la page contact tient largement plus de 500 caractères", () => {
    const body = [contact.intro, ...contact.sections.flatMap((s) => [
      s.heading,
      ...s.paragraphs,
      ...(s.items ?? []),
    ])];
    assert.ok(length(body) > 500, `page contact : ${length(body)} caractères`);
  });

  it("les pages légales tiennent plus de 500 caractères", () => {
    for (const page of [mentionsLegales, confidentialite]) {
      const body = page.sections.flatMap((section) => [
        section.heading,
        ...section.paragraphs,
      ]);
      assert.ok(length(body) > 500, `${page.title} : ${length(body)} caractères`);
    }
  });

  it("la page contact ne publie aucun prix", () => {
    const body = JSON.stringify(contact);
    assert.doesNotMatch(body, /\d\s?(€|euros)/i);
  });

  it("la page contact ne dédouble pas le CTA", () => {
    assert.doesNotMatch(JSON.stringify(contact), new RegExp(ctaLabel));
  });
});

describe("maillage des pages agents", () => {
  it("expose /contact dans le sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    assert.ok(urls.includes(`${siteUrl}/contact`));
  });

  it("lie /contact depuis le pied de page", () => {
    assert.ok(footerLegalLinks.some((entry) => entry.href === "/contact"));
  });

  it("pointe le 404 vers le sitemap, llms.txt et les instructions", () => {
    const hrefs = recoveryLinks.map((entry) => entry.href);
    for (const href of ["/sitemap.xml", "/llms.txt", "/agent-instructions.md", "/contact"]) {
      assert.ok(hrefs.includes(href), href);
    }
  });
});

describe("routage du site", () => {
  it("réécrit /about et /privacy vers les pages françaises", () => {
    assert.deepEqual(agentRewrites, [
      { source: "/about", destination: "/fondateur" },
      { source: "/privacy", destination: "/confidentialite" },
    ]);
  });

  it("ajoute Accept au Vary sans perdre les jetons de Next", () => {
    const rule = varyAcceptHeaders[0];
    assert.equal(rule?.source, "/:path*");
    const vary = rule?.headers.find((header) => header.key === "Vary")?.value ?? "";
    assert.ok(vary.split(",").map((token) => token.trim()).includes("Accept"));
    for (const token of [
      "rsc",
      "next-router-state-tree",
      "next-router-prefetch",
      "next-router-segment-prefetch",
    ]) {
      assert.ok(vary.includes(token), token);
    }
  });

  it("garde les redirections héritées de l'ancien site", () => {
    assert.ok(legacyRedirects.some((entry) => entry.source === "/lexique/:slug"));
  });
});

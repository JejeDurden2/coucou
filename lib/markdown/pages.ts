// Le miroir markdown du site. Une entrée par URL du sitemap, construite à
// partir des mêmes modules de contenu que les pages React : la copie reste
// écrite à un seul endroit, le markdown n'est qu'une seconde représentation.
//
// Servi par app/api/markdown/[[...slug]]/route.ts sur l'URL canonique quand
// le client envoie « Accept: text/markdown », et sur l'URL suffixée « .md ».

import { agents, agentsCopy, agentsHub } from "@/content/agents";
import { articles, blogHub, type BlogArticle, type BlogBlock } from "@/content/blog";
import { casUsageHub, casUsagePages } from "@/content/cas-usage-pages";
import { comparaisons, comparaisonsCopy, comparaisonsHub } from "@/content/comparaisons";
import { contact } from "@/content/contact";
import { finalCta } from "@/content/cta";
import { faq } from "@/content/faq";
import { fondateur, fondateurPage } from "@/content/fondateur";
import { glossaire, glossaireHub, glossaireShared } from "@/content/glossaire";
import { grille } from "@/content/grille";
import { hero } from "@/content/hero";
import { kit, kitFaq, kitFaqTitle } from "@/content/kit";
import { confidentialite, mentionsLegales, type LegalPage } from "@/content/legal";
import { method } from "@/content/method";
import { notFound, recoveryLinks } from "@/content/not-found";
import { outilsHub } from "@/content/outils";
import { problem } from "@/content/problem";
import { realisations } from "@/content/realisations";
import { ressources, ressourcesHub, ressourcesShared } from "@/content/ressources";
import { secteurs, secteursHub } from "@/content/secteurs";
import { services, starter } from "@/content/services";
import { contactEmail, description, siteName, siteUrl } from "@/content/site";
import { spokes } from "@/content/spokes";
import { useCases } from "@/content/use-cases";
import { villeCommon, villes } from "@/content/villes";
import {
  blocks,
  faqSection,
  heading,
  link,
  list,
  plainText,
  table,
  type MarkdownDocument,
} from "@/lib/markdown/builder";

// Rappel de fin de document : un agent qui ne lit qu'une page sait quand même
// où mène l'action, et où trouver le reste du site.
function footer(path: string): string {
  return blocks(
    "---",
    list([
      `Page HTML : ${siteUrl}${path === "/" ? "" : path}`,
      `Contact : ${contactEmail}`,
      `Point de départ (échange gratuit de 30 minutes) : ${siteUrl}/contact`,
      `Index pour agents : ${siteUrl}/llms.txt`,
      `Quand solliciter Coucou IA : ${siteUrl}/agent-instructions.md`,
    ])
  );
}

function document({
  path,
  title,
  description: summary,
  body,
}: {
  path: string;
  title: string;
  description: string;
  body: string;
}): MarkdownDocument {
  // plainText partout, titre et résumé compris : les espaces insécables de la
  // copie française gênent la lecture d'un agent, et le corps ne doit pas dire
  // autre chose que les métadonnées du document.
  return {
    path,
    title: plainText(title),
    description: plainText(summary),
    body: plainText(blocks(`# ${title}`, `> ${summary}`, body, footer(path))),
  };
}

// Une entrée de hub : titre lié, puis la phrase qui la résume.
function hubEntries(
  entries: readonly { name: string; href: string; description: string }[]
): string {
  return list(entries.map((entry) => `${link(entry.name, entry.href)} : ${entry.description}`));
}

function businessCaseBlock(businessCase: {
  context: string;
  metric: string;
  result: string;
  label: string;
}): string {
  return blocks(
    heading(2, `${spokes.businessCaseLabel} (${businessCase.label.toLowerCase()})`),
    businessCase.context,
    `**${businessCase.metric}** : ${businessCase.result}`
  );
}

function legalDocument(path: string, page: LegalPage, summary: string): MarkdownDocument {
  return document({
    path,
    title: page.title,
    description: summary,
    body: blocks(
      `Dernière mise à jour : ${page.updated}`,
      ...page.sections.map((section) =>
        blocks(heading(2, section.heading), ...section.paragraphs)
      )
    ),
  });
}

function blogBlockToMarkdown(block: BlogBlock): string {
  switch (block.kind) {
    case "h2":
      return heading(2, block.text);
    case "h3":
      return heading(3, block.text);
    case "p":
      return block.text;
    case "list":
      return block.ordered
        ? block.items.map((item, index) => `${index + 1}. ${item}`).join("\n")
        : list(block.items);
    case "quote":
      return block.source ? `> ${block.text}\n>\n> Source : ${block.source}` : `> ${block.text}`;
    case "callout":
      return blocks(`**${block.title}**`, block.body);
    case "stat":
      return `**${block.value}** : ${block.label}${block.caption ? `. ${block.caption}` : ""}`;
  }
}

function blogDocument(article: BlogArticle): MarkdownDocument {
  return document({
    path: `/blog/${article.slug}`,
    title: article.title,
    description: article.metaDescription,
    body: blocks(
      list([
        `Catégorie : ${article.category}`,
        `Publié le ${article.publishedAt}`,
        article.updatedAt ? `Mis à jour le ${article.updatedAt}` : "",
        `Auteur : ${fondateur.name}, ${fondateur.role.toLowerCase()} de ${siteName}`,
      ].filter(Boolean)),
      article.lede,
      blocks(heading(2, "À retenir"), list(article.keyTakeaways)),
      ...article.blocks.map(blogBlockToMarkdown),
      article.faq ? faqSection(spokes.faqTitle, article.faq) : ""
    ),
  });
}

function homeDocument(): MarkdownDocument {
  return document({
    path: "/",
    title: `${siteName} : ${hero.headlineSetup} ${hero.headlinePayoff}`,
    description,
    body: blocks(
      hero.lede,
      blocks(heading(2, hero.mapLabel), list(hero.mapItems.map((item) => `${item.category} : ${item.line}`))),
      blocks(heading(2, problem.title), problem.body, list(problem.pains)),
      blocks(
        heading(2, realisations.title),
        realisations.sub,
        ...realisations.items.map((item) =>
          blocks(
            heading(3, `${item.name} (${item.sector})`),
            item.description,
            list([
              `${item.stat.value} : ${item.stat.label}`,
              `Site : ${item.url}`,
              `Statut : ${realisations.statusLabel.toLowerCase()}`,
            ]),
            item.quote ? `> ${item.quote.text}\n>\n> ${item.quote.author}` : ""
          )
        ),
        realisations.closer
      ),
      blocks(
        heading(2, services.title),
        services.sub,
        ...services.offers.map((offer) =>
          blocks(
            heading(3, `${offer.verb} ${offer.title}`),
            offer.hook,
            list(offer.deliverables),
            `${services.livrableLabel} : ${offer.livrable}`
          )
        )
      ),
      blocks(
        heading(2, starter.title),
        starter.sub,
        ...starter.offers.map((offer) =>
          blocks(heading(3, `${offer.title} (${offer.format})`), offer.hook, list(offer.points))
        )
      ),
      blocks(
        heading(2, method.title),
        method.sub,
        ...method.steps.map((step) =>
          blocks(heading(3, `${step.number}. ${step.title}`), step.description, `_${step.detail}_`)
        )
      ),
      blocks(
        heading(2, useCases.title),
        useCases.sub,
        ...useCases.cases.map((useCase) =>
          blocks(
            heading(3, useCase.title),
            useCase.description,
            `${useCase.gainLabel} : ${useCase.gain}.`,
            `En détail : ${link(useCase.title, `/cas-usage/${useCase.slug}`)}`
          )
        ),
        useCases.disclaimer
      ),
      blocks(
        heading(2, `${fondateur.name}, ${fondateur.role.toLowerCase()}`),
        fondateur.bio,
        fondateur.closer,
        `${fondateur.linkedinLabel} : ${fondateur.linkedinUrl}`
      ),
      faqSection(faq.title, faq.items),
      blocks(heading(2, finalCta.title), finalCta.sub)
    ),
  });
}

function buildDocuments(): MarkdownDocument[] {
  return [
    homeDocument(),

    document({
      path: "/fondateur",
      title: fondateurPage.metaTitle,
      description: fondateurPage.metaDescription,
      body: blocks(
        heading(2, `${fondateur.name}, ${fondateur.role.toLowerCase()} de ${siteName}`),
        fondateur.bio,
        fondateur.closer,
        `${fondateur.linkedinLabel} : ${fondateur.linkedinUrl}`
      ),
    }),

    document({
      path: "/contact",
      title: contact.h1,
      description: contact.metaDescription,
      body: blocks(
        contact.intro,
        ...contact.sections.map((section) =>
          blocks(heading(2, section.heading), ...section.paragraphs, section.items ? list(section.items) : "")
        )
      ),
    }),

    legalDocument(
      "/mentions-legales",
      mentionsLegales,
      "Identité de l'éditeur, hébergement, propriété intellectuelle et responsabilité."
    ),
    legalDocument(
      "/confidentialite",
      confidentialite,
      "Cookies, données transmises et droits RGPD."
    ),

    // Hubs et spokes secteurs.
    document({
      path: "/secteurs",
      title: secteursHub.h1,
      description: secteursHub.metaDescription,
      body: blocks(
        secteursHub.intro,
        hubEntries(
          secteurs.map((secteur) => ({
            name: secteur.name,
            href: `/secteurs/${secteur.slug}`,
            description: secteur.intro,
          }))
        )
      ),
    }),
    ...secteurs.map((secteur) =>
      document({
        path: `/secteurs/${secteur.slug}`,
        title: secteur.h1,
        description: secteur.metaDescription,
        body: blocks(
          secteur.intro,
          blocks(heading(2, spokes.secteur.painsTitle), list(secteur.painPoints)),
          blocks(
            heading(2, spokes.secteur.useCasesTitle),
            ...secteur.useCases.map((useCase) =>
              blocks(heading(3, useCase.title), useCase.description)
            )
          ),
          blocks(heading(2, secteur.compliance.title), secteur.compliance.body),
          businessCaseBlock(secteur.businessCase),
          faqSection(spokes.faqTitle, secteur.faq),
          blocks(heading(2, spokes.methodRecap.title), spokes.methodRecap.body)
        ),
      })
    ),

    // Hubs et spokes cas d'usage.
    document({
      path: "/cas-usage",
      title: "Cas d’usage IA en production",
      description: casUsageHub.metaDescription,
      body: blocks(
        casUsageHub.intro,
        hubEntries(
          casUsagePages.map((page) => ({
            name: page.name,
            href: `/cas-usage/${page.slug}`,
            description: page.intro,
          }))
        )
      ),
    }),
    ...casUsagePages.map((page) =>
      document({
        path: `/cas-usage/${page.slug}`,
        title: page.name,
        description: page.metaDescription,
        body: blocks(
          page.intro,
          blocks(
            heading(2, spokes.casUsage.beforeAfterTitle),
            blocks(heading(3, spokes.casUsage.beforeLabel), list(page.before)),
            blocks(heading(3, spokes.casUsage.afterLabel), list(page.after))
          ),
          blocks(heading(2, spokes.casUsage.whyNotSaasTitle), page.whyNotSaas),
          blocks(heading(2, spokes.casUsage.prerequisitesTitle), list(page.prerequisites)),
          businessCaseBlock(page.businessCase),
          faqSection(spokes.faqTitle, page.faq)
        ),
      })
    ),

    // Zones d'intervention.
    ...villes.map((ville) =>
      document({
        path: `/${ville.slug}`,
        title: ville.h1,
        description: ville.metaDescription,
        body: blocks(
          ville.intro,
          blocks(heading(2, ville.contexte.title), ...ville.contexte.paragraphs),
          blocks(
            heading(2, villeCommon.carteTitle),
            list(ville.carte.map((item) => `${item.category} : ${item.line}`))
          ),
          blocks(
            heading(2, villeCommon.metiersTitle),
            hubEntries(
              ville.metiers.map((metier) => ({
                name: metier.name,
                href: metier.href,
                description: metier.description,
              }))
            )
          ),
          businessCaseBlock(ville.businessCase),
          faqSection(spokes.faqTitle, ville.faq),
          blocks(
            heading(2, villeCommon.liensTitle),
            list(ville.liens.map((lien) => link(lien.name, lien.href)))
          )
        ),
      })
    ),

    // Cartes des possibles.
    document({
      path: "/ressources",
      title: ressourcesHub.h1,
      description: ressourcesHub.metaDescription,
      body: blocks(
        ressourcesHub.intro,
        hubEntries(
          ressources.map((ressource) => ({
            name: ressource.name,
            href: `/ressources/${ressource.slug}`,
            description: ressource.pitch,
          }))
        )
      ),
    }),
    ...ressources.map((ressource) =>
      document({
        path: `/ressources/${ressource.slug}`,
        title: `${ressourcesHub.h1} : ${ressource.name}`,
        description: ressource.metaDescription,
        body: blocks(
          ressource.lede,
          blocks(
            heading(2, ressourcesShared.axesTitle),
            list([
              `${ressourcesShared.axisImpact} : ${ressource.axes.impact}`,
              `${ressourcesShared.axisFaisabilite} : ${ressource.axes.faisabilite}`,
            ])
          ),
          ...ressource.useCases.map((useCase) =>
            blocks(
              heading(2, useCase.title),
              useCase.problem,
              useCase.solution,
              list([
                `${ressourcesShared.branchementLabel} : ${useCase.branchement}`,
                `${useCase.metricLabel} : ${useCase.metric}`,
                `${ressourcesShared.axisImpact} : ${useCase.impact}/3`,
                `${ressourcesShared.axisFaisabilite} : ${useCase.faisabilite}/3`,
              ]),
              blocks(heading(3, ressourcesShared.questionsTitle), list(useCase.questions))
            )
          ),
          blocks(heading(2, ressource.compliance.title), ressource.compliance.body),
          blocks(heading(2, ressourcesShared.verdictTitle), ressource.verdict),
          ressource.closing
        ),
      })
    ),

    // Comparaisons.
    document({
      path: "/comparaison",
      title: comparaisonsHub.h1,
      description: comparaisonsHub.metaDescription,
      body: blocks(
        comparaisonsHub.intro,
        hubEntries(
          comparaisons.map((page) => ({
            name: page.hubTitle,
            href: `/comparaison/${page.slug}`,
            description: page.hubDescription,
          }))
        )
      ),
    }),
    ...comparaisons.map((page) =>
      document({
        path: `/comparaison/${page.slug}`,
        title: page.hubTitle,
        description: page.metaDescription,
        body: blocks(
          page.intro,
          blocks(heading(2, comparaisonsCopy.verdictLabel), page.verdict),
          blocks(
            heading(2, comparaisonsCopy.tableTitle),
            table(
              [comparaisonsCopy.criterionHead, comparaisonsCopy.coucouHead, page.otherColumn],
              page.comparison.map((row) => [row.criterion, row.coucou, row.other])
            )
          ),
          blocks(
            heading(2, comparaisonsCopy.differencesTitle),
            ...page.differences.map((difference) =>
              blocks(heading(3, difference.title), difference.body)
            )
          ),
          blocks(heading(2, page.whenOther.title), page.whenOther.body, list(page.whenOther.cases)),
          faqSection(spokes.faqTitle, page.faq)
        ),
      })
    ),

    // Agents IA analysés et installables.
    document({
      path: "/agents-ia",
      title: agentsHub.h1,
      description: agentsHub.metaDescription,
      body: blocks(
        agentsHub.intro,
        hubEntries(
          agents.map((page) => ({
            name: page.hubTitle,
            href: `/agents-ia/${page.slug}`,
            description: page.hubDescription,
          }))
        )
      ),
    }),
    ...agents.map((page) =>
      document({
        path: `/agents-ia/${page.slug}`,
        title: page.hubTitle,
        description: page.metaDescription,
        body: blocks(
          page.intro,
          blocks(heading(2, agentsCopy.verdictLabel), page.verdict),
          blocks(
            heading(2, agentsCopy.factsTitle),
            list(page.facts.map((fact) => `${fact.label} : ${fact.value}`))
          ),
          blocks(
            heading(2, agentsCopy.strengthsTitle),
            ...page.strengths.map((point) => blocks(heading(3, point.title), point.body))
          ),
          blocks(
            heading(2, agentsCopy.risksTitle),
            ...page.risks.map((point) => blocks(heading(3, point.title), point.body))
          ),
          blocks(
            heading(2, page.forWho.title || agentsCopy.forWhoDefaultTitle),
            page.forWho.body,
            list(page.forWho.cases)
          ),
          page.offer
            ? blocks(
                heading(2, page.offer.title),
                page.offer.intro,
                list(page.offer.items),
                page.offer.honest
              )
            : "",
          faqSection(spokes.faqTitle, page.faq)
        ),
      })
    ),

    // Glossaire.
    document({
      path: "/glossaire",
      title: glossaireHub.h1,
      description: glossaireHub.metaDescription,
      body: blocks(
        glossaireHub.intro,
        hubEntries(
          glossaire.map((terme) => ({
            name: terme.name,
            href: `/glossaire/${terme.slug}`,
            description: terme.definition,
          }))
        )
      ),
    }),
    ...glossaire.map((terme) =>
      document({
        path: `/glossaire/${terme.slug}`,
        title: terme.h1,
        description: terme.metaDescription,
        body: blocks(
          blocks(heading(2, glossaireShared.definitionLabel), terme.definition),
          blocks(heading(2, glossaireShared.explanationTitle), terme.explanation),
          blocks(heading(2, glossaireShared.whatItChangesTitle), terme.whatItChanges),
          blocks(heading(2, glossaireShared.exampleTitle), terme.example)
        ),
      })
    ),

    // Blog.
    document({
      path: "/blog",
      title: blogHub.h1,
      description: blogHub.metaDescription,
      body: blocks(
        blogHub.intro,
        hubEntries(
          articles.map((article) => ({
            name: article.title,
            href: `/blog/${article.slug}`,
            description: article.lede,
          }))
        ),
        `Flux RSS : ${siteUrl}/blog/rss.xml`
      ),
    }),
    ...articles.map(blogDocument),

    // Outils gratuits.
    document({
      path: "/outils",
      title: outilsHub.h1,
      description: outilsHub.metaDescription,
      body: blocks(outilsHub.intro, hubEntries(outilsHub.items)),
    }),
    document({
      path: "/outils/par-ou-commencer",
      title: grille.h1,
      description: grille.metaDescription,
      body: blocks(
        grille.intro,
        blocks(
          heading(2, "Comment ça marche"),
          list([
            grille.steps.sector,
            grille.steps.useCase,
            grille.steps.answers,
          ])
        ),
        "L'outil est interactif : ouvrez la page HTML pour dérouler les questions."
      ),
    }),
    document({
      path: "/outils/kit-de-demarrage",
      title: kit.h1,
      description: kit.metaDescription,
      body: blocks(
        kit.intro,
        "L'outil est interactif : ouvrez la page HTML pour répondre aux questions et obtenir votre kit.",
        faqSection(kitFaqTitle, kitFaq)
      ),
    }),
  ];
}

const documentsByPath: Map<string, MarkdownDocument> = new Map(
  buildDocuments().map((doc) => [doc.path, doc])
);

// Chemins qui pointent vers un document existant.
// « /index » : le miroir « .md » de la page d'accueil a besoin d'un nom de
// fichier, « /.md » n'en est pas un.
// « /about » et « /privacy » : les adresses que les agents sondent pour
// vérifier une entreprise. Elles sont réécrites vers les pages françaises
// dans next.config.ts, le markdown suit la même correspondance.
const ALIASES = {
  "/index": "/",
  "/about": "/fondateur",
  "/privacy": "/confidentialite",
} as const;

type Alias = keyof typeof ALIASES;

function isAlias(path: string): path is Alias {
  return path in ALIASES;
}

/** Le document markdown d'un chemin canonique, ou `undefined` s'il n'existe pas. */
export function markdownDocument(path: string): MarkdownDocument | undefined {
  return documentsByPath.get(isAlias(path) ? ALIASES[path] : path);
}

/** Tous les chemins couverts, pour les tests et la page 404. */
export function markdownPaths(): string[] {
  return [...documentsByPath.keys()];
}

/** Corps markdown du 404 : statut 404 et de quoi rebondir. */
export function notFoundMarkdown(path: string): string {
  return plainText(
    blocks(
      "# 404 : page introuvable",
      `> Aucune page à l'adresse \`${path}\` sur ${siteUrl}.`,
      heading(2, notFound.recoveryTitle),
      list([
        link("Accueil", siteUrl),
        ...recoveryLinks.map((entry) => link(entry.label, `${siteUrl}${entry.href}`)),
      ]),
      heading(2, "Ce que fait Coucou IA"),
      description,
      `Contact : ${contactEmail}`
    )
  );
}

export type { MarkdownDocument };

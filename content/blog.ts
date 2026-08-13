// Blog (/blog et /blog/[slug]). Un fichier par article dans content/blog/,
// assemblés ici : ce n'est pas un barrel de composants, c'est la donnée du blog.
// Aucune image d'article, jamais : la page tient par la typographie et les blocs.
// Coucou IA est unipersonnelle : « je », jamais « notre équipe ». Aucun prix.
// Chiffres = exemples étiquetés, jamais une référence client validée.

import type { FaqItem } from "@/content/secteurs";
import { plain } from "@/lib/inline";
import { agentIaProductionLecons } from "@/content/blog/agent-ia-production-lecons";
import { aiActPmeObligations } from "@/content/blog/ai-act-pme-obligations";
import { businessCaseIa } from "@/content/blog/business-case-ia";
import { diagDataIaBpifrance } from "@/content/blog/diag-data-ia-bpifrance";
import { openclawVsHermesAgent } from "@/content/blog/openclaw-vs-hermes-agent";
import { prixProjetIa } from "@/content/blog/prix-projet-ia";

// Quatre catégories, verrouillées : au-delà, le blog se disperse.
export type BlogCategory = "méthode" | "décryptage" | "cas concret" | "coulisses";

// Corps d'article. Union minimale : tout ce qui manque se dit avec ces blocs.
// Les textes de p / list / quote / callout acceptent le micro-markdown de
// lib/inline (liens [texte](/chemin) et gras **texte**).
export type BlogBlock =
  // `id` alimente l'ancre du sommaire : unique dans l'article, sans accent.
  | { kind: "h2"; id: string; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "quote"; text: string; source?: string }
  | { kind: "callout"; title: string; body: string }
  // Rendu selon la spec metric-block (design-system §7) : chiffre court.
  | { kind: "stat"; label: string; value: string; caption?: string };

export type BlogArticle = {
  slug: string;
  title: string;
  // ≤ 60 caractères, « | Coucou IA » compris.
  metaTitle: string;
  // ~150 caractères, mots-clés en tête.
  metaDescription: string;
  category: BlogCategory;
  // "AAAA-MM-JJ", lue en UTC pour que l'affichage ne glisse pas d'un jour.
  publishedAt: string;
  updatedAt?: string;
  // Chapô : une à deux phrases sous le H1.
  lede: string;
  // « À retenir » : 3 à 5 puces citables telles quelles par un moteur de réponse.
  keyTakeaways: string[];
  blocks: BlogBlock[];
  // Alimente le JSON-LD FAQPage quand elle existe.
  faq?: FaqItem[];
  // Maillage : slugs résolus via resolveRelated (lib/seo). Jamais de lien mort.
  relatedArticles: string[];
  relatedCasUsage: string[];
  relatedSecteurs: string[];
};

// Du plus récent au plus ancien : le hub et le flux RSS lisent ce tableau tel quel.
export const articles: BlogArticle[] = [
  agentIaProductionLecons,
  diagDataIaBpifrance,
  prixProjetIa,
  aiActPmeObligations,
  businessCaseIa,
  openclawVsHermesAgent,
].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt)
);

// Copie du hub /blog.
export const blogHub = {
  metaTitle: "Blog IA pour dirigeants de PME | Coucou IA",
  metaDescription:
    "Le blog IA pour dirigeants de PME : méthode, décryptages sans jargon et cas concrets pour savoir par où commencer et ce que ça rapporte.",
  h1: "L’IA en entreprise, sans jargon",
  intro:
    "Ce que je vois sur le terrain, ce qui marche, ce qui coûte cher pour rien. Un article quand j’ai quelque chose d’utile à dire.",
  readMore: "Lire l’article",
};

// Copie transverse du gabarit article. Structurelle, jamais propre à un article.
export const blogArticleCopy = {
  takeawaysTitle: "À retenir",
  tocTitle: "Sommaire",
  faqTitle: "Questions fréquentes",
  relatedArticlesTitle: "À lire ensuite",
  relatedPagesTitle: "Pour aller plus loin",
  readingSuffix: "min de lecture",
  cta: {
    title: "Envie d’en parler pour votre entreprise ?",
    sub: "Trente minutes, gratuites, sans engagement. On regarde vos tâches répétitives et je vous dis franchement ce qui vaut le coup, et ce qui ne le vaut pas.",
  },
} as const;

// Texte brut d'un bloc : sert au comptage des mots, jamais à l'affichage.
function blockWords(block: BlogBlock): string {
  switch (block.kind) {
    case "list":
      return block.items.join(" ");
    case "quote":
      return `${block.text} ${block.source ?? ""}`;
    case "callout":
      return `${block.title} ${block.body}`;
    case "stat":
      return `${block.label} ${block.value} ${block.caption ?? ""}`;
    default:
      return block.text;
  }
}

// Temps de lecture calculé, jamais stocké : le contenu bouge, le chiffre suit.
export function readingMinutes(article: BlogArticle): number {
  const text = plain(
    [
      article.lede,
      ...article.keyTakeaways,
      ...article.blocks.map(blockWords),
      ...(article.faq ?? []).map((item) => `${item.question} ${item.answer}`),
    ].join(" ")
  );
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Dates en UTC : "2026-08-03" est lu minuit UTC, donc le fuseau du serveur ne
// peut pas afficher la veille.
const longDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const shortDate = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatLongDate(isoDate: string): string {
  return longDate.format(new Date(isoDate));
}

export function formatShortDate(isoDate: string): string {
  return shortDate.format(new Date(isoDate));
}

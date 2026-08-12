import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";
import { secteurs } from "@/content/secteurs";
import { casUsagePages } from "@/content/cas-usage-pages";
import { ressources } from "@/content/ressources";
import { comparaisons } from "@/content/comparaisons";
import { agents } from "@/content/agents";
import { glossaire } from "@/content/glossaire";
import { articles } from "@/content/blog";
import { villes } from "@/content/villes";

// Pas de lastModified : new Date() estampillait la date de build, un signal
// faux que Google apprend a ignorer. changeFrequency et priority sont ignores.
// Les spokes sont derives des tableaux de contenu, jamais listes en dur.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl },
    { url: `${siteUrl}/fondateur` },
    { url: `${siteUrl}/mentions-legales` },
    { url: `${siteUrl}/confidentialite` },
    { url: `${siteUrl}/secteurs` },
    { url: `${siteUrl}/cas-usage` },
    ...secteurs.map((secteur) => ({
      url: `${siteUrl}/secteurs/${secteur.slug}`,
    })),
    ...casUsagePages.map((casUsage) => ({
      url: `${siteUrl}/cas-usage/${casUsage.slug}`,
    })),
    // Pages locales, plates a la racine (/consultant-ia-<ville>).
    ...villes.map((ville) => ({
      url: `${siteUrl}/${ville.slug}`,
    })),
    // Les cartes (/ressources/[slug]/carte) sont noindex : jamais dans le sitemap.
    { url: `${siteUrl}/ressources` },
    ...ressources.map((ressource) => ({
      url: `${siteUrl}/ressources/${ressource.slug}`,
    })),
    { url: `${siteUrl}/comparaison` },
    ...comparaisons.map((comparaison) => ({
      url: `${siteUrl}/comparaison/${comparaison.slug}`,
    })),
    { url: `${siteUrl}/agents-ia` },
    ...agents.map((agent) => ({
      url: `${siteUrl}/agents-ia/${agent.slug}`,
    })),
    { url: `${siteUrl}/glossaire` },
    ...glossaire.map((terme) => ({
      url: `${siteUrl}/glossaire/${terme.slug}`,
    })),
    { url: `${siteUrl}/blog` },
    ...articles.map((article) => ({
      url: `${siteUrl}/blog/${article.slug}`,
    })),
    { url: `${siteUrl}/outils` },
    { url: `${siteUrl}/outils/par-ou-commencer` },
    { url: `${siteUrl}/outils/kit-de-demarrage` },
  ];
}

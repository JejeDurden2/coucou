import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";
import { secteurs } from "@/content/secteurs";
import { casUsagePages } from "@/content/cas-usage-pages";
import { ressources } from "@/content/ressources";
import { comparaisons } from "@/content/comparaisons";
import { glossaire } from "@/content/glossaire";

// Pas de lastModified : new Date() estampillait la date de build, un signal
// faux que Google apprend a ignorer. changeFrequency et priority sont ignores.
// Les spokes sont derives des tableaux de contenu, jamais listes en dur.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl },
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
    // Les cartes (/ressources/[slug]/carte) sont noindex : jamais dans le sitemap.
    ...ressources.map((ressource) => ({
      url: `${siteUrl}/ressources/${ressource.slug}`,
    })),
    { url: `${siteUrl}/comparaison` },
    ...comparaisons.map((comparaison) => ({
      url: `${siteUrl}/comparaison/${comparaison.slug}`,
    })),
    { url: `${siteUrl}/glossaire` },
    ...glossaire.map((terme) => ({
      url: `${siteUrl}/glossaire/${terme.slug}`,
    })),
    { url: `${siteUrl}/outils/par-ou-commencer` },
  ];
}

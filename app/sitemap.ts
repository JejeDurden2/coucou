import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";

// Pas de lastModified : new Date() estampillait la date de build, un signal
// faux que Google apprend a ignorer. changeFrequency et priority sont ignores.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl },
    { url: `${siteUrl}/mentions-legales` },
    { url: `${siteUrl}/confidentialite` },
  ];
}

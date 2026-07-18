import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";

// Autorise tous les robots, y compris les crawlers IA (GPTBot, ClaudeBot,
// PerplexityBot, Google-Extended) : sans acces, ces moteurs ne peuvent pas citer le site.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

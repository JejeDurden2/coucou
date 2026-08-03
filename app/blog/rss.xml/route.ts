// Flux RSS du blog, écrit à la main : zéro dépendance pour une trentaine de
// lignes de XML. Titre, chapô, lien et date de publication, en français.

import { articles, blogHub } from "@/content/blog";
import { plain } from "@/lib/inline";
import { siteUrl } from "@/content/site";

// Le flux ne dépend que du contenu : prérendu au build, comme le sitemap.
export const dynamic = "force-static";

const feedUrl = `${siteUrl}/blog/rss.xml`;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Les dates de contenu sont des jours ("AAAA-MM-JJ") : on les publie à midi UTC
// pour qu'aucun lecteur ne les affiche la veille.
function pubDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toUTCString();
}

export function GET(): Response {
  const items = articles
    .map((article) => {
      const url = `${siteUrl}/blog/${article.slug}`;
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(plain(article.lede))}</description>
      <category>${escapeXml(article.category)}</category>
      <pubDate>${pubDate(article.publishedAt)}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(blogHub.h1)}</title>
    <link>${siteUrl}/blog</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(blogHub.metaDescription)}</description>
    <language>fr</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}

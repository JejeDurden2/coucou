import type { Metadata } from "next";

import { BlogHub } from "@/components/sections/blog-hub";
import { Cta } from "@/components/sections/cta";
import { breadcrumbGraph, pageMetadata } from "@/lib/seo";
import { articles, blogHub } from "@/content/blog";
import { siteUrl } from "@/content/site";

export const metadata: Metadata = pageMetadata({
  title: blogHub.metaTitle,
  description: blogHub.metaDescription,
  path: "/blog",
});

export default function BlogHubPage() {
  // Un seul fil d’ariane : le <Breadcrumb> visible et le JSON-LD partagent
  // ce tableau (même modèle que app/glossaire/[slug]/page.tsx).
  const breadcrumb = [{ label: "Accueil", href: "/" }, { label: "Blog" }];
  const url = `${siteUrl}/blog`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${url}#blog`,
        name: blogHub.h1,
        description: blogHub.metaDescription,
        url,
        inLanguage: "fr-FR",
        publisher: {
          "@type": "Organization",
          name: "COUCOU IA",
          url: siteUrl,
        },
        blogPost: articles.map((article) => ({
          "@type": "BlogPosting",
          "@id": `${siteUrl}/blog/${article.slug}#article`,
          headline: article.title,
          description: article.metaDescription,
          datePublished: article.publishedAt,
          url: `${siteUrl}/blog/${article.slug}`,
        })),
      },
      breadcrumbGraph(url, breadcrumb),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main id="contenu">
        <BlogHub />
        <Cta placement="blog-hub" />
      </main>
    </>
  );
}

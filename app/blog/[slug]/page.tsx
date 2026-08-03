import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticleTemplate } from "@/components/sections/blog-article";
import { pageMetadata, resolveRelated } from "@/lib/seo";
import { articles } from "@/content/blog";
import { casUsagePages } from "@/content/cas-usage-pages";
import { fondateur } from "@/content/fondateur";
import { secteurs } from "@/content/secteurs";
import { siteUrl } from "@/content/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((entry) => entry.slug === slug);
  if (!article) {
    return {};
  }
  return pageMetadata({
    title: article.metaTitle,
    description: article.metaDescription,
    path: `/blog/${slug}`,
    article: {
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [fondateur.name],
    },
  });
}

export default async function BlogArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = articles.find((entry) => entry.slug === slug);
  if (!article) {
    notFound();
  }

  // Maillage. Les articles frères gardent leur catégorie pour l'affichage, donc
  // la résolution est écrite ici ; resolveRelated couvre les pages secteurs et
  // cas d’usage. Dans les deux cas, un slug sans correspondance disparaît :
  // jamais de lien mort.
  const relatedArticles = article.relatedArticles.flatMap((related) => {
    const target = articles.find((entry) => entry.slug === related);
    return target
      ? [
          {
            href: `/blog/${target.slug}`,
            title: target.title,
            category: target.category,
          },
        ]
      : [];
  });
  const relatedPages = [
    ...resolveRelated(article.relatedCasUsage, casUsagePages, "/cas-usage"),
    ...resolveRelated(article.relatedSecteurs, secteurs, "/secteurs"),
  ];

  // Un seul fil d’ariane : le <Breadcrumb> visible et le JSON-LD BreadcrumbList
  // partagent ce tableau. Dernier maillon sans href : c’est la page courante.
  const breadcrumb = [
    { label: "Accueil", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: article.title },
  ];

  const url = `${siteUrl}/blog/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: article.title,
        description: article.metaDescription,
        datePublished: article.publishedAt,
        ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
        inLanguage: "fr-FR",
        url,
        author: {
          "@type": "Person",
          name: fondateur.name,
          url: fondateur.linkedinUrl,
        },
        publisher: {
          "@type": "Organization",
          name: "COUCOU IA",
          url: siteUrl,
        },
        isPartOf: {
          "@type": "Blog",
          "@id": `${siteUrl}/blog#blog`,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: breadcrumb.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.label,
          // item est optionnel pour la page courante (dernier maillon sans href).
          ...(crumb.href ? { item: `${siteUrl}${crumb.href}` } : {}),
        })),
      },
      ...(article.faq && article.faq.length > 0
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: article.faq.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer,
                },
              })),
            },
          ]
        : []),
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
        <BlogArticleTemplate
          article={article}
          breadcrumb={breadcrumb}
          relatedArticles={relatedArticles}
          relatedPages={relatedPages}
        />
      </main>
    </>
  );
}

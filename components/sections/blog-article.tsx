import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Breadcrumb, type Crumb } from "@/components/breadcrumb";
import { MetricBlock } from "@/components/metric-block";
import { RelatedLinks } from "@/components/spoke-partials";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { inline } from "@/lib/inline";
import { bookingUrl, ctaLabel } from "@/content/site";
import {
  blogArticleCopy,
  formatLongDate,
  readingMinutes,
  type BlogArticle,
  type BlogBlock,
  type BlogCategory,
} from "@/content/blog";

// Gabarit d’un article (Server Component, zéro "use client"). Aucune image :
// le rythme vient de la typographie et des blocs. Ordre : en-tête, « À retenir »
// citable, corps à 65ch avec sommaire collant à droite (CSS seul), FAQ, maillage,
// CTA sobre. Une colonne sous 1024 px, le sommaire disparaît.

const linkFocus =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function ArticleBlock({ block }: { block: BlogBlock }) {
  switch (block.kind) {
    case "h2":
      return (
        // scroll-mt : le header collant (64 px) ne recouvre pas l’ancre visée.
        <h2
          id={block.id}
          className="mt-8 scroll-mt-24 type-h2 text-foreground"
        >
          <span aria-hidden className="mb-4 block h-0.5 w-8 bg-primary" />
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="mt-4 type-h4 text-foreground">
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
          {inline(block.text)}
        </p>
      );
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List
          className={`flex flex-col gap-3 pl-6 text-lg leading-relaxed text-muted-foreground marker:font-mono marker:text-foreground-dim ${
            block.ordered ? "list-decimal marker:tabular-nums" : "list-disc"
          }`}
        >
          {block.items.map((item) => (
            <li key={item} className="text-pretty pl-1">
              {inline(item)}
            </li>
          ))}
        </List>
      );
    }
    case "quote":
      return (
        <figure className="border-l-2 border-primary pl-6">
          <blockquote className="text-pretty text-lg leading-relaxed text-foreground">
            {inline(block.text)}
          </blockquote>
          {block.source ? (
            <figcaption className="mt-3 type-label text-muted-foreground">
              {block.source}
            </figcaption>
          ) : null}
        </figure>
      );
    case "callout":
      return (
        <div className="rounded-lg border border-border bg-card p-6 lg:p-8">
          <p className="type-h5 text-foreground">
            {block.title}
          </p>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            {inline(block.body)}
          </p>
        </div>
      );
    case "stat":
      return (
        <div className="my-2">
          <MetricBlock value={block.value} label={block.label} marked />
          {block.caption ? (
            <p className="mt-4 max-w-[52ch] text-pretty text-sm leading-relaxed text-muted-foreground">
              {block.caption}
            </p>
          ) : null}
        </div>
      );
  }
}

export function BlogArticleTemplate({
  article,
  breadcrumb,
  relatedArticles,
  relatedPages,
}: {
  article: BlogArticle;
  breadcrumb: Crumb[];
  relatedArticles: { href: string; title: string; category: BlogCategory }[];
  relatedPages: { href: string; name: string }[];
}) {
  const headings = article.blocks.filter((block) => block.kind === "h2");

  return (
    <>
      {/* En-tête : la méta en mono, le titre, le chapô, le tick bleu signature. */}
      <section>
        <div className="mx-auto max-w-[1200px] px-6 pt-12 pb-12 lg:pt-16 lg:pb-16">
          <Breadcrumb items={breadcrumb} />
          <ScrollReveal className="mt-8 max-w-[52rem]">
            <p className="type-label text-muted-foreground">
              {article.category}
              <span aria-hidden> · </span>
              {formatLongDate(article.publishedAt)}
              <span aria-hidden> · </span>
              <span className="tabular-nums">
                {readingMinutes(article)} {blogArticleCopy.readingSuffix}
              </span>
            </p>
            <h1 className="mt-4 type-h1">
              {article.title}
            </h1>
            <p className="mt-6 max-w-[58ch] text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
              {article.lede}
            </p>
            <span aria-hidden className="mt-8 block h-0.5 w-10 bg-primary" />
          </ScrollReveal>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_240px] lg:gap-16">
            <div className="min-w-0">
              {/* Le bloc citable : il vit avant le corps, pas en conclusion. */}
              <ScrollReveal className="max-w-[65ch] rounded-lg border border-border bg-card p-6 lg:p-8">
                <h2 className="type-label text-muted-foreground">
                  {blogArticleCopy.takeawaysTitle}
                </h2>
                <ul className="mt-5 flex flex-col gap-4">
                  {article.keyTakeaways.map((takeaway) => (
                    <li key={takeaway} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
                      />
                      <span className="text-pretty leading-relaxed text-foreground">
                        {inline(takeaway)}
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>

              <div className="mt-14 flex max-w-[65ch] flex-col gap-6">
                {article.blocks.map((block, index) => (
                  <ArticleBlock key={index} block={block} />
                ))}
              </div>

              {article.faq && article.faq.length > 0 ? (
                <div className="mt-16 max-w-[65ch] border-t border-border pt-12">
                  <h2 className="type-h2">
                    {blogArticleCopy.faqTitle}
                  </h2>
                  <dl className="mt-8 flex flex-col gap-8">
                    {article.faq.map((item) => (
                      <div key={item.question}>
                        <dt className="text-pretty font-semibold text-foreground">
                          {item.question}
                        </dt>
                        <dd className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                          {item.answer}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
            </div>

            {/* Sommaire : desktop uniquement, ancres pures, aucun JS. */}
            {headings.length > 0 ? (
              <nav
                aria-label={blogArticleCopy.tocTitle}
                className="hidden lg:block"
              >
                <div className="sticky top-24">
                  <p className="type-label text-muted-foreground">
                    {blogArticleCopy.tocTitle}
                  </p>
                  <ul className="mt-5 flex flex-col gap-3 border-l border-border pl-4">
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          className={`rounded-sm text-sm leading-snug text-muted-foreground transition-colors hover:text-foreground ${linkFocus}`}
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
            ) : null}
          </div>
        </div>
      </section>

      {relatedArticles.length > 0 ? (
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
            <ScrollReveal>
              <h2 className="type-h3">
                {blogArticleCopy.relatedArticlesTitle}
              </h2>
            </ScrollReveal>
            <ul className="mt-8 border-t border-border">
              {relatedArticles.map((related) => (
                <li key={related.href}>
                  <Link
                    href={related.href}
                    className={`flex flex-col gap-2 border-b border-border py-6 transition-colors hover:border-input sm:flex-row sm:items-baseline sm:justify-between sm:gap-8 ${linkFocus}`}
                  >
                    <span className="type-h5 text-foreground">
                      {related.title}
                    </span>
                    <span className="type-label text-muted-foreground">
                      {related.category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <RelatedLinks
        heading={blogArticleCopy.relatedPagesTitle}
        links={relatedPages}
      />

      {/* CTA sobre : pas de lueur d'ambiance sur les pages blog. Un seul libellé. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="flex max-w-[46rem] flex-col gap-6">
            <h2 className="type-h3">
              {blogArticleCopy.cta.title}
            </h2>
            <p className="max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground">
              {blogArticleCopy.cta.sub}
            </p>
            <div>
              <Button
                nativeButton={false}
                render={<a href={bookingUrl(`blog-${article.slug}`)} />}
                size="lg"
              >
                {ctaLabel}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

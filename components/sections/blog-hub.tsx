import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Breadcrumb } from "@/components/breadcrumb";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  articles,
  blogArticleCopy,
  blogHub,
  formatLongDate,
  formatShortDate,
  readingMinutes,
} from "@/content/blog";

// Hub /blog (Server Component). Aucune image : la hiérarchie vient du type.
// Le dernier article prend toute la largeur, les suivants tiennent dans une
// liste serrée séparée par des filets. Une colonne sous 768 px.
const focusClasses =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function BlogHub() {
  const [featured, ...rest] = articles;

  return (
    <section>
      <div className="mx-auto max-w-[1200px] px-6 pt-12 pb-24 lg:pt-16 lg:pb-32">
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Blog" }]} />

        <ScrollReveal className="mt-8 max-w-[46rem]">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {blogHub.eyebrow}
          </p>
          <h1 className="mt-4 text-balance font-display text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl">
            {blogHub.h1}
          </h1>
          <p className="mt-6 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
            {blogHub.intro}
          </p>
        </ScrollReveal>

        {featured ? (
          <ScrollReveal className="mt-14">
            <Link
              href={`/blog/${featured.slug}`}
              className={`group/une block rounded-lg border border-border bg-card p-8 transition-colors hover:border-input lg:p-12 ${focusClasses}`}
            >
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {featured.category}
                <span aria-hidden> · </span>
                {formatLongDate(featured.publishedAt)}
              </p>
              <h2 className="mt-5 max-w-[26ch] text-balance font-display text-3xl leading-[1.06] font-bold tracking-[-0.03em] text-foreground lg:text-[2.75rem]">
                {featured.title}
              </h2>
              <p className="mt-5 max-w-[62ch] text-pretty text-lg leading-relaxed text-muted-foreground">
                {featured.lede}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-primary">
                  {blogHub.readMore}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.12em] tabular-nums text-foreground-dim">
                  {readingMinutes(featured)} {blogArticleCopy.readingSuffix}
                </span>
              </div>
            </Link>
          </ScrollReveal>
        ) : null}

        {rest.length > 0 ? (
          <ul className="mt-16 border-t border-border">
            {rest.map((article, index) => (
              <li key={article.slug}>
                <ScrollReveal delay={index * 0.04}>
                  <Link
                    href={`/blog/${article.slug}`}
                    className={`group/post grid grid-cols-1 gap-3 border-b border-border py-8 transition-colors hover:border-input lg:grid-cols-[9rem_1fr] lg:gap-10 ${focusClasses}`}
                  >
                    <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground lg:pt-2">
                      {formatShortDate(article.publishedAt)}
                    </span>
                    <div>
                      <h2 className="flex items-start justify-between gap-4 text-balance font-display text-xl leading-snug font-medium tracking-[-0.01em] text-foreground lg:text-2xl">
                        {article.title}
                        <ArrowUpRight
                          aria-hidden
                          className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover/post:text-foreground"
                        />
                      </h2>
                      <p className="mt-3 max-w-[68ch] text-pretty text-sm leading-relaxed text-muted-foreground">
                        {article.metaDescription}
                      </p>
                      <p className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-foreground-dim">
                        {article.category}
                        <span aria-hidden> · </span>
                        <span className="tabular-nums">
                          {readingMinutes(article)} {blogArticleCopy.readingSuffix}
                        </span>
                      </p>
                    </div>
                  </Link>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

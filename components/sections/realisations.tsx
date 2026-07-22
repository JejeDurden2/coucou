import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/scroll-reveal";
import { realisations } from "@/content/realisations";

// Preuve par le produit : deux cartes cliquables vers des produits en ligne,
// construits par Coucou IA. La vérifiabilité (le lien sort du site) est le
// marqueur de confiance, pas une citation.

export function Realisations() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <ScrollReveal className="max-w-[46rem]">
          <h2 className="text-balance font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.02em] lg:text-[2.75rem]">
            {realisations.title}
          </h2>
          <p className="mt-5 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground">
            {realisations.sub}
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          {realisations.items.map((item, index) => (
            <ScrollReveal key={item.name} delay={index * 0.04}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/rea flex h-full flex-col rounded-lg border border-border bg-card p-8 outline-none transition-colors hover:border-foreground-dim focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    {item.sector}
                  </span>
                  <Badge
                    variant="outline"
                    className="font-mono uppercase tracking-[0.1em] text-muted-foreground"
                  >
                    {realisations.statusLabel}
                  </Badge>
                </div>

                <h3 className="mt-5 flex items-center gap-2 font-display text-[1.75rem] leading-none font-bold tracking-[-0.02em]">
                  <span className="underline-offset-4 group-hover/rea:underline">
                    {item.name}
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-5 shrink-0 text-muted-foreground transition-colors group-hover/rea:text-foreground"
                  />
                </h3>
                <p className="mt-4 mb-8 max-w-[52ch] text-pretty leading-relaxed text-muted-foreground">
                  {item.description}
                </p>

                {item.quote ? (
                  <figure className="mb-8 border-l-2 border-border pl-4">
                    <blockquote className="text-pretty leading-relaxed text-muted-foreground">
                      «&nbsp;{item.quote.text}&nbsp;»
                    </blockquote>
                    <figcaption className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      {item.quote.author}
                    </figcaption>
                  </figure>
                ) : null}

                <div className="mt-auto flex items-start gap-3 border-t border-border pt-6">
                  <span aria-hidden className="mt-1 h-0.5 w-4 shrink-0 bg-primary" />
                  <div>
                    <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      {realisations.metricLabel}
                    </span>
                    <p className="mt-1.5 text-pretty leading-relaxed tabular-nums text-foreground">
                      {item.metric}
                    </p>
                  </div>
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <p className="mt-8 flex items-start gap-3 text-sm text-muted-foreground">
            <span aria-hidden className="mt-1.5 h-0.5 w-4 shrink-0 bg-primary" />
            <span className="max-w-[82ch]">{realisations.closer}</span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

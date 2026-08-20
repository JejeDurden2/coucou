import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MetricBlock } from "@/components/metric-block";
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
          <h2 className="type-h2">
            {realisations.title}
          </h2>
          <p className="mt-5 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground">
            {realisations.sub}
          </p>
        </ScrollReveal>

        <ScrollReveal className="mt-12">
          <div className="relative">
            <div
              aria-hidden
              className="trace-grid pointer-events-none absolute -inset-x-6 -inset-y-6"
            />
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
              {realisations.items.map((item, index) => (
                <MetricBlock
                  key={item.name}
                  value={item.stat.value}
                  label={item.stat.label}
                  marked={index === 0}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {realisations.items.map((item, index) => (
            <ScrollReveal key={item.name} delay={index * 0.04}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/rea flex h-full flex-col rounded-lg border border-border bg-card p-8 outline-none transition-colors hover:border-foreground-dim focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">{item.sector}</span>
                  <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                    <span aria-hidden className="size-1.5 rounded-full bg-success" />
                    {realisations.statusLabel}
                  </Badge>
                </div>

                <h3 className="mt-5 flex items-center gap-3 type-metric text-[1.75rem]">
                  {/* unoptimized : SVG servi tel quel, l'optimiseur d'images le refuse. */}
                  <Image
                    src={item.logo}
                    alt=""
                    aria-hidden
                    unoptimized
                    className="size-9 shrink-0"
                  />
                  <span className="underline-offset-4 group-hover/rea:underline">
                    {item.name}
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-5 shrink-0 text-muted-foreground transition group-hover/rea:-translate-y-0.5 group-hover/rea:translate-x-0.5 group-hover/rea:text-foreground"
                  />
                </h3>
                <p className="mt-4 max-w-[52ch] text-pretty leading-relaxed text-muted-foreground">
                  {item.description}
                </p>

                {item.quote ? (
                  <figure className="mt-8 border-l-2 border-border pl-4">
                    <blockquote className="text-pretty leading-relaxed text-muted-foreground">
                      «&nbsp;{item.quote.text}&nbsp;»
                    </blockquote>
                    <figcaption className="mt-3 text-sm text-foreground-dim">
                      {item.quote.author}
                    </figcaption>
                  </figure>
                ) : null}
              </a>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <p className="mt-8 max-w-[82ch] text-sm text-muted-foreground">
            {realisations.closer}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

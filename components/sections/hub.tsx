import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Breadcrumb } from "@/components/breadcrumb";
import { ScrollReveal } from "@/components/scroll-reveal";

// Hub template (/secteurs, /cas-usage): H1 + intro, then a card grid to the
// spokes. An empty items list renders the intro with no cards, no crash, since
// the spoke content arrives in parallel.
type HubItem = { name: string; description: string; href: string };

export function HubSection({
  breadcrumbLabel,
  h1,
  intro,
  items,
}: {
  breadcrumbLabel: string;
  h1: string;
  intro: string;
  items: HubItem[];
}) {
  return (
    <section>
      <div className="mx-auto max-w-[1200px] px-6 pt-12 pb-24 lg:pt-16 lg:pb-32">
        <Breadcrumb
          items={[{ label: "Accueil", href: "/" }, { label: breadcrumbLabel }]}
        />
        <ScrollReveal className="mt-8 max-w-[46rem]">
          <h1 className="text-balance font-display text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl">
            {h1}
          </h1>
          <p className="mt-6 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
            {intro}
          </p>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <ScrollReveal key={item.href} delay={index * 0.04}>
              <Link
                href={item.href}
                className="group/hub flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-6 outline-none transition-colors hover:border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <h2 className="font-display text-xl leading-snug font-medium tracking-[-0.01em] text-foreground">
                  {item.name}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 font-mono text-xs uppercase tracking-[0.1em] text-primary">
                  Découvrir
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

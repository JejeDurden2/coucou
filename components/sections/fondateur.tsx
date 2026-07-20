import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { ScrollReveal } from "@/components/scroll-reveal";
import { fondateur } from "@/content/fondateur";
import portrait from "@/public/brand/jerome-desmares.jpg";

// Le visage derrière le CTA : photo réelle, parcours vérifiable (le lien
// LinkedIn sort du site, même logique que les réalisations).

export function Fondateur() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <ScrollReveal className="grid grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,16rem)_1fr] lg:gap-16">
          <Image
            src={portrait}
            alt={fondateur.photoAlt}
            placeholder="blur"
            sizes="(min-width: 768px) 16rem, 100vw"
            className="w-full max-w-[16rem] rounded-lg border border-border"
          />
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {fondateur.kicker}
            </span>
            <h2 className="mt-4 font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.02em] lg:text-[2.75rem]">
              {fondateur.name}
            </h2>
            <p className="mt-2 font-mono text-sm text-foreground-dim">
              {fondateur.role}
            </p>
            <p className="mt-5 max-w-[58ch] text-pretty text-lg leading-relaxed text-muted-foreground">
              {fondateur.bio}
            </p>
            <p className="mt-5 flex items-start gap-3">
              <span aria-hidden className="mt-2 h-0.5 w-4 shrink-0 bg-primary" />
              <span className="max-w-[58ch] text-pretty leading-relaxed text-foreground">
                {fondateur.closer}
              </span>
            </p>
            <a
              href={fondateur.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              {fondateur.linkedinLabel}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

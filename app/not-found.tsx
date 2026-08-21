import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { bookingUrl, ctaLabel } from "@/content/site";
import { notFound, recoveryLinks } from "@/content/not-found";

export const metadata: Metadata = {
  title: "Page introuvable",
  description:
    "Cette page n’existe pas ou plus. Retournez à l’accueil de Coucou IA.",
};

export default function NotFound() {
  return (
    <main id="contenu" className="flex min-h-[calc(100svh-4rem)] items-center">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-20 text-center">
        <p className="flex items-center justify-center gap-2.5 font-mono text-sm text-muted-foreground">
          <span aria-hidden className="size-2 shrink-0 rounded-sm bg-primary" />
          {notFound.accroche}
        </p>

        <h1 className="mx-auto mt-6 max-w-[24ch] type-h1">
          {notFound.headline}
        </h1>

        <p className="mx-auto mt-5 max-w-[46ch] text-pretty text-lg leading-relaxed text-muted-foreground">
          {notFound.sub}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button nativeButton={false} render={<a href={bookingUrl("404")} />} size="lg">
            {ctaLabel}
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button nativeButton={false} render={<Link href="/" />} variant="secondary" size="lg">
            {notFound.homeLabel}
          </Button>
        </div>

        {/* Repères de récupération : le visiteur retrouve une porte d'entrée,
            et l'agent qui a suivi un lien mort repart avec le plan du site,
            l'index llms.txt et les instructions qui lui sont destinées. */}
        <nav
          aria-label={notFound.recoveryTitle}
          className="mx-auto mt-16 max-w-[46rem] border-t border-border pt-8 text-left"
        >
          <h2 className="type-label text-muted-foreground">{notFound.recoveryTitle}</h2>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {recoveryLinks.map((entry) => (
              <li key={entry.href}>
                <a
                  href={entry.href}
                  className="rounded-sm text-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {entry.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}

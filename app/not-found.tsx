import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { bookingHref, ctaLabel } from "@/content/site";
import { notFound } from "@/content/not-found";

export const metadata: Metadata = {
  title: "Page introuvable",
  description:
    "Cette page n'existe pas ou plus. Retournez à l'accueil de Coucou IA.",
};

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-20 text-center">
        <p className="flex items-center justify-center gap-2.5 font-mono text-sm text-muted-foreground">
          <span aria-hidden className="size-2 shrink-0 rounded-sm bg-primary" />
          {notFound.accroche}
        </p>

        <h1 className="mx-auto mt-6 max-w-[24ch] text-balance font-display text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl">
          {notFound.headline}
        </h1>

        <p className="mx-auto mt-5 max-w-[46ch] text-pretty text-lg leading-relaxed text-muted-foreground">
          {notFound.sub}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button render={<a href={bookingHref} />} size="lg">
            {ctaLabel}
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button render={<Link href="/" />} variant="secondary" size="lg">
            {notFound.homeLabel}
          </Button>
        </div>
      </div>
    </main>
  );
}

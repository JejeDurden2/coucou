"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { errorPage } from "@/content/error";

// Error boundary racine : sans lui, une erreur de rendu affiche la page
// par défaut de Next, sans style ni ton. Client Component obligatoire (Next).
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="contenu" className="flex min-h-[calc(100svh-4rem)] items-center">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-20 text-center">
        <p className="flex items-center justify-center gap-2.5 font-mono text-sm text-muted-foreground">
          <span aria-hidden className="size-2 shrink-0 rounded-sm bg-primary" />
          {errorPage.accroche}
        </p>

        <h1 className="mx-auto mt-6 max-w-[24ch] type-h1">
          {errorPage.headline}
        </h1>

        <p className="mx-auto mt-5 max-w-[46ch] text-pretty text-lg leading-relaxed text-muted-foreground">
          {errorPage.sub}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button onClick={reset} size="lg">
            {errorPage.retryLabel}
          </Button>
          <Button nativeButton={false} render={<Link href="/" />} variant="secondary" size="lg">
            {errorPage.homeLabel}
          </Button>
        </div>
      </div>
    </main>
  );
}

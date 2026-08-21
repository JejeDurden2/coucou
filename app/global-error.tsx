"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { errorPage } from "@/content/error";

// Error boundary du layout racine : quand app/layout.tsx lui-même casse,
// app/error.tsx ne se rend pas. Ce composant remplace <html> et <body>,
// donc sans globals.css ni composants partagés. Il remonte l'erreur à Sentry.
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <main style={{ padding: "4rem 1.5rem", textAlign: "center", fontFamily: "system-ui" }}>
          <h1>{errorPage.headline}</h1>
          <p>{errorPage.sub}</p>
          <button type="button" onClick={reset}>
            {errorPage.retryLabel}
          </button>
        </main>
      </body>
    </html>
  );
}

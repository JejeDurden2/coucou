import { NextResponse, type NextRequest } from "next/server";

import { appendVaryAccept, negotiate } from "@/lib/accept";

// Négociation de contenu à l'entrée du site (convention acceptmarkdown.com).
// Un navigateur reçoit le HTML habituel, un agent qui envoie
// « Accept: text/markdown » reçoit le markdown de la même page, sur la même
// URL. Toute la logique de décision vit dans lib/accept.ts, testée à part.
//
// Next 16 : ce fichier s'appelle proxy.ts (ex-middleware.ts).

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const result = negotiate(pathname, request.headers.get("accept"));

  if (result.kind === "passthrough") {
    return NextResponse.next();
  }

  if (result.kind === "markdown") {
    const url = request.nextUrl.clone();
    url.pathname = `/api/markdown${result.path === "/" ? "" : result.path}`;
    const rewritten = NextResponse.rewrite(url);
    appendVaryAccept(rewritten.headers);
    return rewritten;
  }

  if (result.kind === "not-acceptable") {
    return new NextResponse(
      "406 Not Acceptable\n\nReprésentations disponibles : text/html, text/markdown\n",
      {
        status: 406,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          Vary: "Accept",
        },
      }
    );
  }

  const response = NextResponse.next();
  appendVaryAccept(response.headers);
  // RFC 8288 : le miroir markdown de la page, pour les robots qui suivent les
  // liens plutôt que de négocier.
  response.headers.set(
    "Link",
    `<${pathname === "/" ? "/index" : pathname}.md>; rel="alternate"; type="text/markdown"`
  );
  return response;
}

export const config = {
  // Tout sauf les routes internes de Next et l'API markdown elle-même.
  matcher: ["/((?!api/|_next/|_vercel/).*)"],
};

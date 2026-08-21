import type { NextConfig } from "next";

// Routage déclaratif du site, sorti de next.config.ts pour être lisible et
// testable seul : next.config.ts n'est qu'un assemblage, et il tire Sentry
// derrière lui.

type Redirects = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>;
type Rewrites = Awaited<ReturnType<NonNullable<NextConfig["rewrites"]>>>;
type Headers = Awaited<ReturnType<NonNullable<NextConfig["headers"]>>>;

// URLs de la version du site antérieure à ce dépôt (juillet 2026). Elles
// portaient encore 31 % des impressions Search Console en août et
// répondaient 404, sans redirection. Le lexique a simplement été renommé
// glossaire ; les pages GEO et leurs deux articles n'ont pas d'équivalent
// et pointent vers le hub le plus proche, l'intention étant abandonnée.
export const legacyRedirects: Redirects = [
  { source: "/lexique/:slug", destination: "/glossaire/:slug", permanent: true },
  { source: "/lexique", destination: "/glossaire", permanent: true },
  { source: "/geo-pour/:path*", destination: "/", permanent: true },
  { source: "/geo-pour", destination: "/", permanent: true },
  {
    source: "/blog/trafic-ia-convertit-23x-mieux-organique-google",
    destination: "/blog",
    permanent: true,
  },
  {
    source: "/blog/seo-vs-geo-differences-guide-complet-2026",
    destination: "/blog",
    permanent: true,
  },
];

// Les agents IA sondent /about, /contact et /privacy pour vérifier qu'il y a
// une vraie entreprise derrière un site. /contact est une page à part entière ;
// les deux autres servent la page française correspondante sous leur adresse
// anglaise, en 200. Une réécriture plutôt qu'une redirection : un vérificateur
// qui ne suit pas les 301 verrait une page manquante. Les pages gardent leur
// canonical français, rien ne se duplique dans l'index. lib/markdown/pages.ts
// applique la même correspondance côté markdown.
export const agentRewrites: Rewrites = [
  { source: "/about", destination: "/fondateur" },
  { source: "/privacy", destination: "/confidentialite" },
];

// Vary: Accept sur toutes les pages. Les deux représentations d'une même URL
// (HTML et markdown, voir proxy.ts) doivent avoir deux entrées de cache
// distinctes, sinon un CDN sert la première mise en cache aux deux publics.
//
// La valeur est écrite en entier, jetons de Next compris. Le rendu App Router
// pose son Vary avec setHeader (route-modules/app-page), ce qui écrase ce qu'un
// proxy ou cette configuration ont posé avant lui : la seule façon de garder
// les deux, c'est de tout redonner. Les quatre premiers jetons sont ceux de
// getVaryHeader ; si Next en ajoute, il faut les reporter ici.
export const varyAcceptHeaders: Headers = [
  {
    source: "/:path*",
    headers: [
      {
        key: "Vary",
        value:
          "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept",
      },
    ],
  },
];

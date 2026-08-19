import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // URLs de la version du site antérieure à ce dépôt (juillet 2026). Elles
  // portaient encore 31 % des impressions Search Console en août et
  // répondaient 404, sans redirection. Le lexique a simplement été renommé
  // glossaire ; les pages GEO et leurs deux articles n'ont pas d'équivalent
  // et pointent vers le hub le plus proche, l'intention étant abandonnée.
  async redirects() {
    return [
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
  },
};

export default nextConfig;

// Page 404. Seul endroit du site ou le clin d’oeil porte sur une erreur : reste bref, reste dans le ton.
// Les repères de récupération servent deux publics : le visiteur qui s’est
// trompé d’adresse, et l’agent qui a suivi un lien mort et doit repartir avec
// le plan du site plutôt qu’avec une impasse.

export type NotFoundContent = {
  accroche: string;
  headline: string;
  sub: string;
  homeLabel: string;
  recoveryTitle: string;
};

export const notFound: NotFoundContent = {
  accroche: "Erreur 404",
  headline: "Coucou. Cette page n’a jamais été livrée.",
  sub: "Cette adresse n’existe pas ou plus. Le reste du site, si.",
  homeLabel: "Retour à l’accueil",
  recoveryTitle: "Où chercher",
};

export const recoveryLinks: readonly { label: string; href: string }[] = [
  { label: "Plan du site (sitemap.xml)", href: "/sitemap.xml" },
  { label: "Index pour agents (llms.txt)", href: "/llms.txt" },
  { label: "Quand solliciter Coucou IA", href: "/agent-instructions.md" },
  { label: "Secteurs", href: "/secteurs" },
  { label: "Cas d’usage", href: "/cas-usage" },
  { label: "Glossaire", href: "/glossaire" },
  { label: "Blog", href: "/blog" },
  { label: "Nous joindre", href: "/contact" },
];

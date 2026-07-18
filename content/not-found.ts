// Page 404. Seul endroit du site ou le clin d'oeil porte sur une erreur : reste bref, reste dans le ton.

export type NotFoundContent = {
  accroche: string;
  headline: string;
  sub: string;
  homeLabel: string;
};

export const notFound: NotFoundContent = {
  accroche: "Erreur 404",
  headline: "Coucou. Cette page n'a jamais été livrée.",
  sub: "Cette adresse n'existe pas ou plus. Le reste du site, si.",
  homeLabel: "Retour à l'accueil",
};

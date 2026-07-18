// Section hero. L'accroche porte le clin d'oeil « Coucou », le reste est droit au but.
// Le libellé du CTA vient de site.ts (ctaLabel) : ne pas le dupliquer ici.

export type Hero = {
  accroche: string;
  headline: string;
  lede: string;
  reassurance: string;
  diagnosticNote: string;
};

export const hero: Hero = {
  accroche: "Coucou. On parle résultats, pas promesses.",
  headline: "L'IA qui rapporte vraiment, installée en production chez vous.",
  lede: "On identifie où l'IA crée de la valeur chez vous, puis on livre le système qui la produit. Mesuré.",
  reassurance: "30 minutes, gratuit, sans engagement.",
  diagnosticNote: "Si l'IA ne vous rapporte rien, on vous le dit franchement.",
};

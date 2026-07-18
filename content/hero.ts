// Section hero « la carte des possibles » : le client sait que l'IA compte,
// mais pas par où commencer. Nous, si. La carte montre ce que l'IA rend
// possible chez lui : six cas d'usage qui s'illuminent l'un après l'autre.
// Le libellé du CTA vient de site.ts (ctaLabel) : ne pas le dupliquer ici.

export type HeroMapItem = {
  // Catégorie mono en capitales, puis le bénéfice concret sur une ligne.
  category: string;
  line: string;
};

export type Hero = {
  // Bandeau mono au-dessus du titre.
  kicker: string;
  // Deux temps : le premier plein, le second tracé en creux (.text-hollow).
  headlineSolid: string;
  headlineHollow: string;
  lede: string;
  // Note mono à côté du CTA.
  reassurance: string;
  // Libellé de la carte (nom accessible de la liste + étiquette visible).
  mapLabel: string;
  mapItems: HeroMapItem[];
};

export const hero: Hero = {
  kicker: "Conseil IA pour les PME et ETI.",
  headlineSolid: "L'IA va changer votre quotidien.",
  headlineHollow: "On sait par où commencer.",
  lede: "Produire plus vite, ouvrir un marché, automatiser ce qui vous pèse : on trouve ce que l'IA rend possible pour vous, et on le met en production.",
  reassurance: "30 minutes, gratuit, sans engagement.",
  mapLabel: "La carte des possibles",
  mapItems: [
    { category: "Productivité", line: "Vos devis chiffrés en minutes, pas en jours" },
    { category: "Nouveaux marchés", line: "Votre offre en 12 langues" },
    { category: "Service client", line: "Des réponses même à 3 h du matin" },
    { category: "Compétences", line: "Vos données analysées, sans data scientist" },
    { category: "Automatisation", line: "Relances et saisie en pilote automatique" },
    { category: "Savoir-faire", line: "Vos archives, interrogeables en une question" },
  ],
};

// Section hero « la carte des possibles » : le client sait que l’IA compte,
// mais pas par où commencer. Nous, si. La carte montre ce que l’IA rend
// possible chez lui : six cas d’usage qui s’illuminent l’un après l’autre.
// Le libellé du CTA vient de site.ts (ctaLabel) : ne pas le dupliquer ici.

export type HeroMapItem = {
  // Catégorie mono en capitales, puis le bénéfice concret sur une ligne.
  category: string;
  line: string;
};

export type Hero = {
  // Bandeau mono au-dessus du titre.
  kicker: string;
  // Deux temps : le premier plein, le second tracé en creux (.text-hollow).
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
  kicker: "Conseil et développement IA pour les PME.",
  headlineSolid: "Tout le monde vous parle d’IA.",
  headlineHollow: "On la met au travail chez vous.",
  lede: "Devis, relances, messages clients, saisie : on trouve ce que l’IA prend en charge chez vous, on le chiffre, et on le met en production.",
  reassurance: "30 minutes, gratuit, sans engagement.",
  mapLabel: "La carte des possibles",
  mapItems: [
    { category: "Premier contact", line: "Chaque demande rappelée en 5 minutes" },
    { category: "Chiffrage", line: "Le devis prêt le jour de la visite" },
    { category: "Relances", line: "Vos relances partent, même la semaine chargée" },
    { category: "Langues", line: "Une réponse dans la langue du client, même à 3 h" },
    { category: "Terrain", line: "Vos visites dictées, votre logiciel à jour" },
    { category: "Savoir-faire", line: "Le bon document retrouvé en une question" },
  ],
};

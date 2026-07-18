// Section hero « instrument » : la courbe porte l'argument, le texte le signe.
// Le libellé du CTA vient de site.ts (ctaLabel) : ne pas le dupliquer ici.
// « L'IA vous doit des comptes » : rendre des comptes (l'exigence) et les
// comptes (les chiffres). Le clin d'œil de la marque tient dans ce double sens.

export type HeroReadout = {
  label: string;
  // Cible du compteur : l'unique count-up autorisé (design-system §6).
  value: number;
  prefix: string;
  suffix: string;
  caption: string;
};

export type Hero = {
  // Deux lignes, une par rendu : la seconde est tracée en creux (.text-hollow).
  headlineSolid: string;
  headlineHollow: string;
  lede: string;
  reassurance: string;
  note: string;
  readout: HeroReadout;
  axisY: string;
  axisX: string;
  baselineLabel: string;
  traceAlt: string;
};

export const hero: Hero = {
  headlineSolid: "L'IA vous doit",
  headlineHollow: "des comptes.",
  lede: "On chiffre le gain avant d'écrire une ligne de code, on livre en production, on mesure. Garanti par écrit.",
  reassurance: "30 minutes. Gratuit. Un avis franc.",
  note: "Si l'IA n'a rien à vous rapporter, vous le saurez à la fin de l'appel. Pas au bout de six mois de mission.",
  readout: {
    label: "Temps de traitement",
    value: 40,
    prefix: "-",
    suffix: " %",
    caption: "exemple illustratif",
  },
  axisY: "Gain mesuré ↑",
  axisX: "Temps →",
  baselineLabel: "Si rien ne change",
  traceAlt:
    "Courbe d'exemple : le gain mesuré monte par paliers après la mise en production, au-dessus de la ligne de base si rien ne change.",
};

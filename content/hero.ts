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
  prodLabel: string;
  legendLabel: string;
  traceAlt: string;
};

export const hero: Hero = {
  headlineSolid: "L'IA vous doit",
  headlineHollow: "des comptes.",
  lede: "On chiffre le gain avant d'écrire une ligne de code, on livre en production, on mesure. Garanti par écrit.",
  reassurance: "30 minutes. Gratuit. Un avis franc.",
  note: "Vous repartez avec les deux ou trois endroits où l'IA peut créer de la valeur chez vous. Souvent là où vous ne l'attendiez pas.",
  readout: {
    label: "Dernier relevé",
    value: 40,
    prefix: "-",
    suffix: " %",
    caption: "de temps de traitement, exemple illustratif",
  },
  axisY: "Gain mesuré ↑",
  axisX: "Temps →",
  baselineLabel: "Si rien ne change",
  prodLabel: "Mise en production",
  legendLabel: "Relevé mensuel",
  traceAlt:
    "Courbe d'exemple : le gain reste à zéro jusqu'à la mise en production, puis monte par paliers à chaque relevé mensuel avant de se stabiliser, nettement au-dessus de la ligne si rien ne change.",
};

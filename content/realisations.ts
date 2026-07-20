// Réalisations : deux produits construits par Coucou IA, en production.
// Preuve du métier « Construire ». Jamais présentés comme des clients :
// ce sont nos produits, et c'est ça l'argument. Chiffres repris des sites
// produits (livia.tech, lecturer.fr), vérifiables en un clic.

export type Realisation = {
  name: string;
  url: string;
  sector: string;
  description: string;
  metric: string;
  // Citation validée par son auteur avant publication, jamais inventée.
  quote?: { text: string; author: string };
};

export type RealisationsSection = {
  title: string;
  sub: string;
  statusLabel: string;
  metricLabel: string;
  closer: string;
  items: Realisation[];
};

export const realisations: RealisationsSection = {
  title: "On code ce qu'on conseille.",
  sub: "Deux produits IA que nous avons conçus, développés et mis en production. Pas des maquettes : ils sont en ligne, allez les voir.",
  statusLabel: "En production",
  metricLabel: "Résultat",
  closer:
    "Du problème métier à la production, nous avons tout construit nous-mêmes. C'est exactement le travail qu'on fait chez vous.",
  items: [
    {
      name: "Livia",
      url: "https://livia.tech",
      sector: "Formation professionnelle",
      description:
        "Un agent IA qui tient la conformité Qualiopi en continu : il surveille les 32 indicateurs, réclame les preuves manquantes et prépare l'audit.",
      metric: "la préparation d'un audit passe de 3 semaines à 2 jours",
      // Validée par Stevie Bengono le 20 juillet 2026.
      quote: {
        text: "Jérôme a pris Livia du premier besoin client à la production. Un agent IA qui suit les 32 indicateurs Qualiopi en continu, construit et fiabilisé en quelques mois. Je n'ai jamais eu à traduire entre le métier et la technique : il fait les deux.",
        author: "Stevie Bengono, cofondateur et CEO de Livia",
      },
    },
    {
      name: "Lecturer",
      url: "https://lecturer.fr",
      sector: "Enseignement supérieur",
      description:
        "La planification des cours et des intervenants, générée par l'IA : emplois du temps, disponibilités, conformité. À la place d'Excel et des mails.",
      metric: "la gestion administrative passe de 11 h à 1 h par semaine",
    },
  ],
};

// Copie de la grille d'auto-évaluation interactive (/outils/par-ou-commencer).
// La version jouable des « cartes des possibles » : ici, uniquement la copie de
// la page. Les secteurs, cas d'usage et questions viennent de content/ressources.ts
// (lecture seule, aucune duplication de données). L'espace insécable est écrit
//   (U+00A0) avant ? ! et dans « », comme l'exige le contrat de copie.

import { ressourcesShared } from "@/content/ressources";

export const grille = {
  metaTitle: "Par où commencer avec l'IA ? Testez vos cas | Coucou IA",
  metaDescription:
    "Comptable ou industriel ? Choisissez un cas d'usage, répondez à trois questions, et voyez tout de suite s'il mérite un vrai chiffrage chez vous.",
  // Nom propre pour le JSON-LD Service (pas la question du h1).
  serviceName: "Auto-évaluation IA : par où commencer",

  h1: "Par où commencer avec l'IA ?",
  intro:
    "Choisissez votre secteur, un cas d'usage, et répondez à trois questions. Au bout, un verdict franc : ce cas mérite un vrai chiffrage chez vous, ou pas encore.",

  // Étapes (indicateur de progression).
  steps: {
    sector: "Secteur",
    useCase: "Cas d'usage",
    answers: "Réponses",
  },

  // Étape 1 : secteur.
  sectorHeading: "Dans quel univers travaillez-vous ?",
  sectorCountLabel: "cas d'usage",
  escapeQuestion: "Ni l'un ni l'autre ?",
  escapeCasUsageLabel: "Voir tous les cas d'usage",

  // Étape 2 : cas d'usage.
  useCaseHeading: "Quel cas vous parle le plus ?",
  useCaseBack: "Changer de secteur",

  // Étape 3 : les trois questions.
  questionsIntro: "Trois questions, une réponse franche.",
  answerYes: "Oui",
  answerNo: "Non",
  answerUnsure: "Je ne sais pas",
  questionsHint: "Répondez aux trois questions pour voir le verdict.",
  submitVerdict: "Voir le verdict",
  questionsBack: "Choisir un autre cas",

  // Verdict.
  verdictEyebrow: "Le verdict",
  orderEyebrow: "Ordre de grandeur",
  illustrationLabel: ressourcesShared.illustrationLabel,
  verdicts: {
    // Trois oui.
    strong: {
      title: "Ce cas mérite un vrai chiffrage chez vous.",
      body: "Trois oui, c'est un signal net : du volume, des données, une vraie douleur. La prochaine étape, c'est de poser les chiffres sur votre situation à vous, pas sur une moyenne. Ce premier échange, c'est 30 min pour ça.",
    },
    // Un ou deux oui.
    medium: {
      title: "Ça se regarde, sans urgence.",
      body: "Un ou deux oui, le cas n'est pas à côté de la plaque, mais rien ne presse. Regardez d'abord ceux où vous avez répondu oui partout. Et si vous voulez en parler, la porte est ouverte.",
    },
    // Zéro oui.
    soft: {
      title: "La grille vous a évité d'investir au mauvais endroit, c'est déjà ça.",
      body: "Aucun oui, et c'est une bonne nouvelle : vous venez d'économiser le temps qu'on perd à lancer le mauvais chantier. Un autre cas collera peut-être mieux à votre réalité.",
    },
  },
  // Ajouté quand au moins une réponse est « je ne sais pas ».
  nuanceUnsure:
    "Vos « je ne sais pas », c'est un point à éclaircir, justement le genre de question qu'on règle en 30 min.",

  carteLinkLabel: "Voir la carte de votre secteur",
  retryLabel: "Tester un autre cas",
  restartLabel: "Recommencer",
} as const;

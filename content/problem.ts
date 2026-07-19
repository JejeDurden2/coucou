// Bandeau « probleme » : la paralysie du dirigeant, en langage client.
// Les « pains » sont des verbatims reformules, pas des temoignages attribues.

export type Problem = {
  title: string;
  body: string;
  pains: string[];
};

export const problem: Problem = {
  title: "Vous savez que l'IA compte. Et après ?",
  body: "Le sujet est partout, les avis se contredisent, et personne ne vous dit où l'IA rapporte vraiment chez vous. Alors vous attendez le bon moment. Ce qui vous manque n'est pas le bon moment : c'est le point de départ. Trouver le vôtre, c'est exactement notre métier.",
  pains: [
    "« On sait qu'il faut s'y mettre, mais par où commencer ? »",
    "« On a testé ChatGPT, concrètement ça n'a rien changé. »",
    "« Nos données sont partout, dans tous les sens. »",
  ],
};

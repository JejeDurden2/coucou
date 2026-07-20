// Le fondateur : le visage derrière le CTA. Parcours réel (LinkedIn),
// rien de gonflé. La promesse : l'interlocuteur du point de départ est
// aussi celui qui construit.

export type FondateurSection = {
  kicker: string;
  name: string;
  role: string;
  bio: string;
  closer: string;
  photoAlt: string;
  linkedinLabel: string;
  linkedinUrl: string;
};

export const fondateur: FondateurSection = {
  kicker: "Qui est derrière Coucou IA",
  name: "Jérôme Desmares",
  role: "Fondateur",
  bio: "Dix ans à construire des logiciels et à diriger des équipes de développement, pour le luxe, la fintech et l'édition comptable. Coucou IA applique ce que ces années ont appris : comprendre le métier d'abord, construire le système ensuite.",
  closer:
    "Pas de commercial, pas d'intermédiaire : du point de départ à la mise en production, vous gardez le même interlocuteur.",
  photoAlt: "Jérôme Desmares, fondateur de Coucou IA",
  linkedinLabel: "Vérifier sur LinkedIn",
  linkedinUrl: "https://www.linkedin.com/in/jeromedesmares",
};

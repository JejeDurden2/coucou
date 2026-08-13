// Le fondateur : le visage derrière le CTA. Parcours réel (LinkedIn),
// rien de gonflé. La promesse : l'interlocuteur du point de départ est
// aussi celui qui construit.

export type FondateurSection = {
  name: string;
  role: string;
  bio: string;
  closer: string;
  photoAlt: string;
  linkedinLabel: string;
  linkedinUrl: string;
};

// Meta de la page /fondateur (la marque est déjà dans le titre, pas de suffixe).
export const fondateurPage = {
  metaTitle: "Jérôme Desmares, fondateur de Coucou IA",
  metaDescription:
    "Dix ans à entreprendre et construire des logiciels : luxe, fintech, édition comptable. Du point de départ à la production, vous gardez le même interlocuteur.",
};

export const fondateur: FondateurSection = {
  name: "Jérôme Desmares",
  role: "Fondateur",
  bio: "Plus de dix ans à entreprendre, construire des logiciels et diriger des équipes de développement, pour le luxe, la fintech et l'édition comptable. Coucou IA applique ce que ces années ont appris : comprendre le métier d'abord, construire le système ensuite.",
  closer:
    "Du point de départ à la mise en production, vous gardez le même interlocuteur.",
  photoAlt: "Jérôme Desmares, fondateur de Coucou IA",
  linkedinLabel: "Vérifier sur LinkedIn",
  linkedinUrl: "https://www.linkedin.com/in/jeromedesmares",
};

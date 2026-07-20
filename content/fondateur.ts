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
  bio: "Dix ans à construire des logiciels : la montre connectée de Louis Vuitton, l'API de paiement de KohortPay, trois équipes de développeurs dirigées chez MyUnisoft, l'éditeur comptable. Formé à l'école 42. Livia et Lecturer, c'est lui aussi.",
  closer:
    "Au point de départ, c'est lui qui décroche. Pendant le développement, c'est lui qui code. Rien ne se perd entre les deux.",
  photoAlt: "Jérôme Desmares, fondateur de Coucou IA",
  linkedinLabel: "Vérifier sur LinkedIn",
  linkedinUrl: "https://www.linkedin.com/in/jeromedesmares",
};

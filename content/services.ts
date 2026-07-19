// Les deux métiers, mis en scène « le pli » : deux volets d’une même feuille
// (Trouver / Construire), la marque origami se plie à la charnière. Les deux
// closers répondent au sub : le rapport du cabinet, la démo de l’agence.

export type Service = {
  id: string;
  step: string;
  // Verbe affiché en display sur le volet ("Trouver.", "Construire.").
  verb: string;
  title: string;
  // Utilisée uniquement dans le JSON-LD de la page d’accueil.
  description: string;
  hook: string;
  deliverables: string[];
  livrable: string;
};

export type ServicesSection = {
  title: string;
  sub: string;
  // Libellé mono le long de la charnière du pli.
  spineLabel: string;
  livrableLabel: string;
  // Lève l’objection « je ne sais pas laquelle des deux offres me concerne ».
  ctaHook: string;
  offers: Service[];
};

export const services: ServicesSection = {
  title: "On trouve où l’IA rapporte. Puis on le construit.",
  sub: "Un cabinet vous laisse un rapport. Une agence, une démo. Nous, on plie les deux métiers en un seul : même interlocuteur du point de départ à la production.",
  spineLabel: "Rien ne se perd en route",
  livrableLabel: "Vous repartez avec",
  ctaHook:
    "Vous ne savez pas par lequel commencer ? C’est exactement à ça que sert le point de départ.",
  offers: [
    {
      id: "audit",
      step: "01",
      verb: "Trouver.",
      title: "Audit & stratégie IA",
      description:
        "On part de votre activité, pas de la techno. On regarde vos process, vos données et vos irritants, puis on chiffre le retour attendu de chaque opportunité.",
      hook: "On dresse votre carte des possibles : où l’IA rapporte chez vous, et où elle ne sert à rien.",
      deliverables: [
        "L’état des lieux : vos process, vos données, vos outils",
        "Les opportunités IA classées par impact et faisabilité",
        "Un business case chiffré pour chaque piste prioritaire",
        "Le cadre RGPD et AI Act posé dès la conception",
      ],
      livrable:
        "Une feuille de route chiffrée, classée par impact. Pas un rapport qui dort dans un tiroir.",
    },
    {
      id: "developpement",
      step: "02",
      verb: "Construire.",
      title: "Développement IA sur mesure",
      description:
        "Agents IA, RAG, automatisations : on développe ce dont le business case a prouvé la valeur. Intégré à vos outils, sécurisé, mesuré sur ses résultats.",
      hook: "On prend la feuille de route et on la construit : agents IA, RAG, automatisations, branchés sur vos outils.",
      deliverables: [
        "Des agents IA qui exécutent vos tâches de bout en bout",
        "Des systèmes RAG : l’IA répond à partir de VOS documents",
        "L’automatisation des documents et des flux répétitifs",
        "L’intégration à vos outils : ERP, CRM, Drive, mails",
      ],
      livrable:
        "Un système qui tourne en production, mesuré sur ses résultats. Pas une démo.",
    },
  ],
};

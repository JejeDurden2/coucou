// Les deux offres : Audit & stratégie IA / Développement IA sur mesure.

export type Service = {
  id: string;
  title: string;
  hook: string;
  description: string;
  deliverables: string[];
  livrable: string;
};

export type ServicesSection = {
  eyebrow: string;
  title: string;
  sub: string;
  livrableLabel: string;
  offers: Service[];
};

export const services: ServicesSection = {
  eyebrow: "Nos deux métiers",
  title: "Deux métiers, un seul objectif : votre ROI.",
  sub: "La vision stratégique d'un cabinet, les mains dans le code. Un seul interlocuteur du diagnostic à la production : rien ne se perd en route.",
  livrableLabel: "Livrable",
  offers: [
    {
      id: "audit",
      title: "Audit & stratégie IA",
      hook: "On dresse votre carte des possibles : où l'IA rapporte chez vous, et où elle ne sert à rien.",
      description:
        "On part de votre activité, pas de la techno. On regarde vos process, vos données et vos irritants, puis on chiffre le retour attendu de chaque opportunité.",
      deliverables: [
        "Diagnostic de l'existant : process, données et outils déjà en place",
        "Votre carte des possibles : les opportunités IA classées par impact et faisabilité",
        "Business case chiffré pour chaque piste prioritaire (ROI attendu)",
        "Feuille de route IA priorisée, réaliste pour vos équipes",
        "Cadre RGPD et AI Act pensé dès la conception",
      ],
      livrable:
        "Un plan d'action classé par impact, pas un rapport qui dort dans un tiroir.",
    },
    {
      id: "developpement",
      title: "Développement IA sur mesure",
      hook: "On construit le système, on le branche sur vos outils, on le met en production.",
      description:
        "Agents IA, RAG, automatisations : on développe ce dont le diagnostic a prouvé la valeur. Intégré à vos outils, sécurisé, mesuré sur ses résultats. Pas un POC de démo.",
      deliverables: [
        "Agents IA qui exécutent vos tâches de bout en bout",
        "Systèmes RAG : l'IA répond à partir de VOS documents et données",
        "Automatisation du traitement de documents et des flux répétitifs",
        "Intégration dans vos outils existants (ERP, CRM, Drive, mails)",
        "Mise en production, mesure du ROI et suivi dans le temps",
      ],
      livrable:
        "Un système qui tourne en production, mesuré sur ses résultats.",
    },
  ],
};

// Les trois temps de l’offre. Les deux métiers restent mis en scène « le pli » :
// deux volets d’une même feuille (Trouver / Construire), la marque origami se
// plie à la charnière. Le troisième temps (Faire tourner) est la bande sous le
// pli : le système vit après la livraison, quelqu’un le regarde. Les closers
// répondent au sub : le rapport du cabinet, la démo de l’agence, le chantier
// abandonné.

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
  title: "On trouve où l’IA rapporte. On le construit. On le fait tourner.",
  sub: "Un cabinet vous laisse un rapport. Une agence, une démo. Nous, on plie les deux métiers en un seul : même interlocuteur du point de départ au suivi en production.",
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
        "On part de votre activité. On regarde vos process, vos données et ce qui vous fait perdre du temps, puis on chiffre le retour attendu de chaque piste.",
      hook: "On dresse votre carte des possibles : où l’IA rapporte chez vous, et où elle ne sert à rien.",
      deliverables: [
        "L’état des lieux : vos process, vos données, vos outils",
        "Les pistes IA classées par impact et faisabilité",
        "Un business case chiffré pour chaque piste prioritaire",
        "Le cadre RGPD et AI Act posé dès la conception",
      ],
      livrable:
        "Une feuille de route chiffrée, classée par impact, prête à exécuter.",
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
        "Un système qui tourne en production, mesuré sur ses résultats.",
    },
    {
      id: "suivi",
      step: "03",
      verb: "Faire tourner.",
      title: "Suivi mensuel",
      description:
        "Un système IA vit : les modèles changent, vos outils et vos volumes aussi. On surveille le système en production, on corrige, on le fait évoluer, avec un point mensuel sur les résultats.",
      hook: "Un système IA vit : il faut quelqu’un qui le regarde. On surveille le vôtre en production, on corrige, on le fait évoluer.",
      deliverables: [
        "La surveillance du système en production, mois après mois",
        "Les corrections dès qu’un comportement dévie",
        "Les évolutions quand vos besoins ou vos outils changent",
        "Le point mensuel : résultats mesurés, décisions pour la suite",
      ],
      livrable:
        "Un système qui reste fiable dans le temps.",
    },
  ],
};

// « Commencer petit » : les deux portes d’entrée, petites et à délai publié
// (les délais sont publiés, jamais les prix). Répond à « c’est trop gros pour
// nous » juste avant le CTA de la section.

export type StarterOffer = {
  id: string;
  title: string;
  // Badge affiché sur la carte : le délai ou le format, publié volontairement.
  format: string;
  hook: string;
  points: string[];
};

export type StarterSection = {
  title: string;
  sub: string;
  offers: StarterOffer[];
};

export const starter: StarterSection = {
  title: "Commencez par un bout.",
  sub: "Deux formats courts pour voir l’IA tourner chez vous, sans engager un chantier. Vous décidez la suite après.",
  offers: [
    {
      id: "premier-agent",
      title: "Le premier agent",
      format: "En production en 3 semaines",
      hook: "Un seul cas d’usage, cadré lors du point de départ, en production en trois semaines.",
      points: [
        "Un périmètre serré : un seul cas d’usage",
        "Validation humaine sur les actions sensibles",
        "Un mois d’ajustements inclus",
      ],
    },
    {
      id: "formation",
      title: "La journée de formation",
      format: "Une journée dans vos locaux",
      hook: "Une journée avec votre équipe, sur vos cas réels et vos outils.",
      points: [
        "Vos cas, vos outils, vos données",
        "Les premiers réflexes acquis en pratiquant",
        "Deux ou trois usages en place dès le soir",
      ],
    },
  ],
};

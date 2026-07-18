// La garantie ROI : la piece maitresse. Ton sobre, zero clin d'oeil.
// Les metrics sont vrais par construction (faits structurels), pas des chiffres de performance.
// TODO fondateur : formaliser avec un juriste les modalites exactes de la garantie
// (perimetre, seuils, contrepartie) avant la mise en ligne.

export type GuaranteePrinciple = {
  title: string;
  description: string;
};

export type GuaranteeMetric = {
  value: string;
  label: string;
};

export type GuaranteeSection = {
  eyebrow: string;
  title: string;
  intro: string;
  principles: GuaranteePrinciple[];
  metrics: GuaranteeMetric[];
  metricsNote: string;
  trustTitle: string;
  trust: string;
};

export const guarantee: GuaranteeSection = {
  eyebrow: "La garantie",
  title: "ROI garanti. Le risque, c'est le nôtre.",
  intro:
    "Vous ne payez pas pour une réflexion, vous payez pour un résultat qui tourne. On chiffre le retour avant d'engager, on livre en production, et on s'engage sur ce que ça rapporte.",
  principles: [
    {
      title: "Un business case chiffré avant d'engager",
      description:
        "On ne démarre jamais un développement sans avoir chiffré le retour attendu. Vous voyez le gain estimé, le périmètre et le coût avant de dire oui.",
    },
    {
      title: "Livré en production, pas un POC mort",
      description:
        "Le prototype qui reste au labo, ce n'est pas un livrable, c'est un échec facturé. On livre un système intégré à vos outils et utilisé au quotidien.",
    },
    {
      title: "Un engagement écrit sur le résultat",
      description:
        "Si le ROI attendu n'est pas là, on l'assume : ce n'est pas à vous de payer pour un système qui ne produit pas. C'est écrit dans le contrat.",
    },
  ],
  metrics: [
    { value: "100 %", label: "des projets démarrent par un business case chiffré" },
    { value: "30 min", label: "de diagnostic gratuit, sans engagement" },
    { value: "0", label: "slide facturée sans système derrière" },
  ],
  metricsNote:
    "Trois engagements, vrais par construction. Les chiffres de performance, c'est votre diagnostic qui les établit.",
  trustTitle: "Vos données restent chez vous",
  trust:
    "Conçu dès le départ pour le RGPD et l'AI Act. Hébergement adapté, pas de fuite vers des modèles publics quand ce n'est pas voulu. La souveraineté des données est un point de départ, pas une option.",
};

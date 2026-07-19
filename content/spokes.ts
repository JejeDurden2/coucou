// Copie transverse des gabarits pSEO : hubs, spokes secteurs et cas d’usage.
// Les contenus par page restent dans secteurs.ts / cas-usage-pages.ts.

export const spokes = {
  hubCardCta: "Découvrir",
  businessCaseLabel: "Business case",
  faqTitle: "Questions fréquentes",
  methodRecap: {
    title: "Notre méthode, du point de départ à la production",
    body: "On part de votre activité, on chiffre le retour attendu, puis on livre un système en production, mesuré sur ses résultats.",
    methodLink: "La méthode en détail",
  },
  secteur: {
    painsTitle: "Ce qui vous coûte du temps aujourd’hui",
    useCasesTitle: "Où l’IA crée de la valeur chez vous",
    relatedHeading: "Cas d’usage associés",
  },
  casUsage: {
    beforeAfterTitle: "Avant, après",
    beforeLabel: "Aujourd’hui",
    afterLabel: "Avec le système en production",
    whyNotSaasTitle: "Pourquoi un outil générique ne suffit pas",
    prerequisitesTitle: "Ce dont nous avons besoin de votre côté",
    relatedHeading: "Secteurs concernés",
  },
} as const;

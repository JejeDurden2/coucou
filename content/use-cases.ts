// Cas d’usage. Chiffres = exemples illustratifs (gainLabel + disclaimer), jamais des références validées.

export type UseCase = {
  title: string;
  // Slug de la page cas d’usage correspondante (/cas-usage/[slug]).
  slug: string;
  description: string;
  gain: string;
  gainLabel: string;
};

export type UseCasesSection = {
  title: string;
  sub: string;
  disclaimer: string;
  cases: UseCase[];
};

export const useCases: UseCasesSection = {
  title: "Cinq exemples concrets. Le vôtre reste à écrire.",
  sub: "Voici où l’IA fait gagner du temps dans des entreprises comme la vôtre.",
  disclaimer:
    "Exemples illustratifs. Chaque chiffre dépend de votre contexte : le vrai, c’est le business case de VOTRE diagnostic qui l’établit.",
  cases: [
    {
      title: "Réponse aux appels d’offres",
      slug: "reponse-appels-offres",
      description:
        "Un agent rédige un premier jet de réponse ou de devis à partir de votre base documentaire : offres passées, catalogues, références. Vos équipes valident au lieu de repartir de zéro.",
      gain: "un premier jet en quelques minutes, plus en plusieurs heures",
      gainLabel: "Exemple",
    },
    {
      title: "Assistant support client",
      slug: "assistant-support-client",
      description:
        "Un assistant répond aux clients à partir de votre documentation produit et de l’historique de vos tickets. Il traite les questions récurrentes, vos agents gardent les cas complexes.",
      gain: "jusqu’à la moitié des demandes de niveau 1 traitées sans intervention",
      gainLabel: "Exemple",
    },
    {
      title: "Traitement de documents",
      slug: "traitement-documents",
      description:
        "L’IA lit, extrait et classe vos factures, contrats et comptes rendus. Fini la ressaisie : les données arrivent directement dans vos outils.",
      gain: "jusqu’à 80 % de temps de saisie manuelle en moins",
      gainLabel: "Exemple",
    },
    {
      title: "Recherche interne intelligente",
      slug: "recherche-interne",
      description:
        "Une recherche qui comprend le langage courant, sur vos données éparpillées (Drive, mails, ERP, SharePoint). Vos équipes trouvent la bonne info sans fouiller dix dossiers.",
      gain: "l’information retrouvée en secondes plutôt qu’en heures",
      gainLabel: "Exemple",
    },
    {
      title: "Qualification des leads",
      slug: "qualification-leads",
      description:
        "Chaque demande entrante est analysée, qualifiée et routée vers la bonne personne, automatiquement. Vos commerciaux se concentrent sur les leads qui comptent.",
      gain: "chaque demande qualifiée et routée en continu, sans tri manuel",
      gainLabel: "Exemple",
    },
  ],
};

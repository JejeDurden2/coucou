// Page /contact. La page qu'un agent IA ouvre pour vérifier qu'il y a une
// vraie entreprise derrière le site, et qu'un dirigeant ouvre pour savoir
// comment nous joindre. Aucun prix, jamais. Le seul CTA reste celui de site.ts.

export type ContactSection = {
  heading: string;
  paragraphs: string[];
  items?: string[];
};

export type ContactPage = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: ContactSection[];
};

export const contact: ContactPage = {
  metaTitle: "Contacter Coucou IA, conseil IA à Nice",
  metaDescription:
    "Contacter Coucou IA : 30 minutes gratuites pour trouver votre point de départ, par email ou en visio. Bureau à Nice, interventions dans toute la France.",
  h1: "Nous joindre",
  intro:
    "Une adresse email, un créneau de 30 minutes, un interlocuteur unique. Vous parlez directement à la personne qui construira votre système.",
  sections: [
    {
      heading: "Le point de départ",
      paragraphs: [
        "Le premier échange dure 30 minutes, il est gratuit et il n’engage à rien. On regarde votre activité ensemble : les tâches qui prennent du temps, les outils que vos équipes utilisent tous les jours, les données qui traînent d’un logiciel à l’autre. Vous repartez avec un avis franc sur ce que l’IA peut prendre en charge chez vous, et sur ce qu’elle ne changera pas.",
        "Réservez le créneau qui vous arrange depuis le bouton présent sur chaque page du site. Le rendez-vous se tient en visio. Si vous êtes dans les Alpes-Maritimes ou à Monaco, on peut aussi se voir sur place.",
      ],
    },
    {
      heading: "Écrire directement",
      paragraphs: [
        "Vous préférez poser votre question par écrit ? Écrivez à jerome@coucou-ia.com. Vous avez une réponse sous un jour ouvré. Pour que la réponse serve à quelque chose, quelques lignes suffisent :",
      ],
      items: [
        "votre métier et la taille de votre équipe,",
        "la tâche qui vous coûte le plus de temps aujourd’hui,",
        "les outils dans lesquels votre activité vit (CRM, ERP, PMS, boîte mail, tableur),",
        "ce que vous avez déjà essayé, s’il y a lieu.",
      ],
    },
    {
      heading: "Où nous sommes",
      paragraphs: [
        "Le bureau est à Nice, 460 avenue de Pessicart, 06100. On se déplace dans tout le département des Alpes-Maritimes (Nice, Cannes, Antibes, Grasse, Sophia Antipolis, Menton, Cagnes-sur-Mer), à Monaco, et à Aix-Marseille aux étapes clés d’un projet. Partout ailleurs en France, la visio couvre le projet du point de départ à la production.",
      ],
    },
    {
      heading: "L’entreprise",
      paragraphs: [
        "Coucou IA est une SAS immatriculée au RCS de Nice sous le SIREN 100498070, numéro de TVA intracommunautaire FR83100498070. Le fondateur et président est Jérôme Desmares. Les informations légales complètes figurent dans les mentions légales, et le traitement de vos données est décrit dans la politique de confidentialité.",
      ],
    },
  ],
};

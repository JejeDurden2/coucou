// Pages locales (/consultant-ia-<ville>). Quatre villes, URLs plates à la racine.
// Chaque page a sa propre substance locale : intro, contexte, carte des possibles,
// métiers, business case (métriques alignées sur la page secteur du métier phare),
// FAQ et maillage sortant. Les métiers pointent vers /secteurs/<slug>.
// Aucune référence client, aucun quartier inventé, tout chiffre étiqueté "Exemple".

import type { HeroMapItem } from "@/content/hero";
import type { BusinessCase, FaqItem } from "@/content/secteurs";

export type VilleMetier = {
  name: string;
  // Lien vers la page secteur correspondante (/secteurs/<slug>).
  href: string;
  // Reformulé dans le contexte local, pas le générique de la page secteur.
  description: string;
};

export type Ville = {
  // Segment d’URL complet à la racine : consultant-ia-nice.
  slug: string;
  // Nom court : areaServed du JSON-LD.
  name: string;
  // Forme prépositionnelle ("à Nice") : fil d’ariane, libellé du footer,
  // et titre de la carte des possibles (carteTitle + inName).
  inName: string;
  // ≤ 60 caractères, suffixe "| Coucou IA" inclus.
  metaTitle: string;
  // ~150 caractères, "consultant IA + ville" en tête.
  metaDescription: string;
  h1: string;
  // Sous-titre hero : positionnement honnête (basé à Nice, sur place ou visio).
  intro: string;
  // Ancrage local : ce que la ville change, ce que la visio couvre.
  contexte: { title: string; paragraphs: string[] };
  // Déclinaison locale de la carte des possibles du hero. Rendu statique.
  carte: HeroMapItem[];
  metiers: VilleMetier[];
  // Un scénario chiffré, le métier phare local. Mêmes chiffres que la page
  // secteur correspondante, jamais de métrique inédite.
  businessCase: BusinessCase;
  // 5 questions locales, dont une objection. Alimente le JSON-LD FAQPage.
  faq: FaqItem[];
  // Maillage sortant hors secteurs déjà liés : blog, outils, fondateur.
  liens: { href: string; name: string }[];
};

// Copie partagée par les quatre pages : titres de blocs et méthode,
// reformulée pour ne pas dupliquer la home mot à mot.
export const villeCommon = {
  carteTitle: "La carte des possibles",
  metiersTitle: "Les métiers qu’on sert ici",
  liensTitle: "Pour aller plus loin",
  methode: {
    title: "La même méthode, où que vous soyez",
    steps: [
      {
        title: "Le point de départ",
        description:
          "Un échange gratuit de 30 minutes, en visio ou sur place. Vous racontez votre activité, on repère ensemble où l’IA peut rapporter chez vous.",
      },
      {
        title: "Le business case",
        description:
          "On chiffre le gain attendu et le coût avant tout engagement. Vous décidez sur des chiffres, pas sur une intuition.",
      },
      {
        title: "La mise en production",
        description:
          "On construit le système et on le branche sur vos outils. Vos équipes l’utilisent au quotidien, pas de prototype qui dort dans un tiroir.",
      },
      {
        title: "La mesure",
        description:
          "On mesure les résultats après la mise en service, puis on ajuste. Ce qui ne rapporte pas se corrige ou s’arrête.",
      },
    ],
  },
} as const;

export const villes: Ville[] = [
  {
    slug: "consultant-ia-nice",
    name: "Nice",
    inName: "à Nice",
    metaTitle: "Consultant IA à Nice pour les PME | Coucou IA",
    metaDescription:
      "Consultant IA à Nice : audit, agents IA et automatisations pour les PME de la Côte d’Azur. Basé à Nice, sur place ou en visio. Premier échange gratuit.",
    h1: "Consultant IA à Nice pour les PME",
    intro:
      "Coucou IA est installé à Nice. On rencontre les dirigeants de la Côte d’Azur en personne, dans leurs locaux, et la visio couvre le reste de la France. Même méthode partout : on trouve où l’IA rapporte chez vous, on le chiffre, on le construit.",
    contexte: {
      title: "Un consultant IA installé à Nice, pas une antenne de passage",
      paragraphs: [
        "Notre bureau est avenue de Pessicart, à Nice. Quand un dirigeant de la région veut comprendre ce que l’IA change dans son métier, on vient le voir : dans ses locaux, face à ses équipes, devant ses vrais dossiers. Un échange de terrain, pas une présentation générique déroulée depuis Paris.",
        "La Côte d’Azur est l’une des premières destinations touristiques de France, et Nice, inscrite au patrimoine mondial de l’UNESCO pour son histoire de villégiature, en est la capitale. L’économie d’ici vit du tourisme, de l’immobilier, du bâtiment et des services : des métiers de saison et de relation, avec des équipes réduites et des pics de charge marqués. C’est précisément là qu’une IA bien ciblée rapporte : elle absorbe les demandes répétitives et rend du temps aux équipes pour ce qui compte, le client.",
        "Le premier réflexe des dirigeants qu’on rencontre est souvent le même : l’IA, ce serait pour les grands groupes. Notre travail commence là : montrer, exemples en main, ce qu’elle rend possible dans une entreprise de dix ou de cinquante personnes, puis chiffrer ce que ça rapporte avant de construire quoi que ce soit.",
        "Et si votre entreprise est ailleurs, rien ne bloque : le point de départ, les restitutions et le suivi se font aussi bien en visio.",
      ],
    },
    carte: [
      {
        category: "Immobilier",
        line: "Chaque lead portail rappelé dans l’heure",
      },
      {
        category: "Hôtellerie",
        line: "Le devis groupe part avant midi",
      },
      {
        category: "Artisans",
        line: "La visite du matin devient le devis du soir",
      },
      {
        category: "Expertise comptable",
        line: "Les écritures arrivent pré-affectées, le collaborateur valide",
      },
      {
        category: "Saison",
        line: "Des réponses clients même en août à 23 h",
      },
    ],
    metiers: [
      {
        name: "Immobilier",
        href: "/secteurs/immobilier",
        description:
          "Agences, syndics, administrateurs de biens : le marché niçois tourne vite. L’IA qualifie les demandes entrantes, prépare les annonces et le suivi des dossiers.",
      },
      {
        name: "Hôtellerie",
        href: "/secteurs/hotellerie",
        description:
          "Les questions clients arrivent à toute heure, en plusieurs langues. L’IA traite les demandes courantes et allège la réception pendant la saison.",
      },
      {
        name: "Artisans du bâtiment",
        href: "/secteurs/artisans-batiment",
        description:
          "Devis, relances, suivi de chantier : l’administratif se fait le soir, après les journées de pose. L’IA prépare, l’artisan valide.",
      },
      {
        name: "Expertise comptable",
        href: "/secteurs/expertise-comptable",
        description:
          "Pré-affectation des écritures, réponses aux clients en période fiscale : les collaborateurs valident au lieu de saisir.",
      },
    ],
    businessCase: {
      context:
        "Hôtel indépendant de 35 chambres avec salle de séminaire. Les demandes de groupes arrivent par mail et attendent qu’un creux se libère à la réception.",
      metric: "chiffré en 1 h",
      result:
        "Le devis groupe part dans l’heure au lieu de 48 h, avant que l’organisateur n’ait relancé trois autres établissements.",
      label: "Exemple",
    },
    faq: [
      {
        question: "Vous déplacez-vous dans les entreprises à Nice ?",
        answer:
          "Oui, c’est la norme ici : notre bureau est à Nice. Le point de départ peut se tenir dans vos locaux ou en visio, comme vous préférez. Voir vos équipes travailler vaut souvent mieux qu’une heure de description : on repère plus vite ce qui peut être automatisé, et ce qui doit rester humain.",
      },
      {
        question: "Pourquoi un consultant local plutôt qu’une agence parisienne ?",
        answer:
          "Une bonne agence parisienne fera du bon travail, ce n’est pas le sujet. La différence se joue sur le terrain : on vient voir vos équipes travailler avant de proposer quoi que ce soit, et on revient quand il le faut, sans transformer chaque visite en déplacement facturé. On connaît aussi les métiers d’ici : la saison, les pics d’août, les équipes réduites. À compétence égale, la proximité fait des projets plus courts et mieux ancrés dans le réel.",
      },
      {
        question: "Travaillez-vous à distance ?",
        answer:
          "Oui. La conception, le développement et la mesure des résultats ne dépendent pas du lieu. La visio couvre tout le suivi, et les rencontres sur place restent possibles à chaque étape.",
      },
      {
        question: "Quels types d’entreprises accompagnez-vous ?",
        answer:
          "Des PME de 10 à 250 salariés, dirigées par des gens dont l’IA n’est pas le métier. Immobilier, hôtellerie, bâtiment, expertise comptable, services : si des tâches répétitives mangent le temps de vos équipes, il y a matière à regarder.",
      },
      {
        question: "Combien coûte le point de départ ?",
        answer:
          "Rien. C’est un échange gratuit de 30 minutes, sans engagement. Vous en sortez avec une idée claire de ce que l’IA peut changer chez vous, et de par où commencer. Si un projet mérite d’aller plus loin, on le chiffre dans un business case avant que vous n’engagiez quoi que ce soit.",
      },
    ],
    liens: [
      { href: "/fondateur", name: "Jérôme Desmares, le fondateur" },
      { href: "/outils", name: "Les outils gratuits" },
      { href: "/blog", name: "Le blog, l’IA sans jargon" },
    ],
  },
  {
    slug: "consultant-ia-sophia-antipolis",
    name: "Sophia Antipolis",
    inName: "à Sophia Antipolis",
    metaTitle: "Consultant IA à Sophia Antipolis | Coucou IA",
    metaDescription:
      "Consultant IA à Sophia Antipolis : agents IA, RAG et automatisations pour éditeurs, services B2B et industriels de la technopole. Premier échange gratuit.",
    h1: "Consultant IA à Sophia Antipolis pour les entreprises de la technopole",
    intro:
      "Coucou IA est basé à Nice, à une demi-heure de la technopole. On vient sur place quand ça compte, la visio couvre le reste. Et on arrive avec un chiffrage, pas un discours.",
    contexte: {
      title: "Parler IA à des gens qui en font déjà",
      paragraphs: [
        "Sophia Antipolis n’est pas une zone d’activité comme les autres : créée en 1969, c’est la première technopole d’Europe. Elle concentre des éditeurs de logiciels, des sociétés de services et des centres de recherche. Beaucoup vendent de la technologie. Et beaucoup gardent, en interne, des process manuels : avant-vente réécrite à chaque appel d’offres, support saturé, documentation introuvable.",
        "On ne vient pas expliquer l’IA à des ingénieurs. On vient chiffrer où elle rapporte dans vos opérations : avant-vente, support, gestion interne, production documentaire. Un business case d’abord, un système en production ensuite, des résultats mesurés à la fin.",
        "Un mot sur ce qu’on n’est pas : une société qui place des développeurs chez vous, ou un cabinet qui vend des journées d’étude. On vend un résultat en production, avec un chiffrage avant l’engagement et une mesure après la mise en service. Si le business case ne tient pas, on vous le dit et on s’arrête là.",
        "Notre bureau est à Nice, la technopole est à une demi-heure de route. Les rencontres sur place s’organisent simplement, et la visio fait le reste, comme vos équipes en ont l’habitude.",
      ],
    },
    carte: [
      {
        category: "Avant-vente",
        line: "L’appel d’offres démarre aux deux tiers rédigé",
      },
      {
        category: "Support",
        line: "Une bonne part du niveau 1 traitée seule, les cas complexes escaladés",
      },
      {
        category: "Documentation produit",
        line: "À jour à chaque version, sans y passer la semaine",
      },
      {
        category: "Recherche interne",
        line: "L’information retrouvée en secondes",
      },
    ],
    metiers: [
      {
        name: "Services B2B",
        href: "/secteurs/services-b2b",
        description:
          "Conseil, ingénierie, services numériques : propositions commerciales qui ne repartent plus de zéro, recherche dans les livrables passés, qualification des demandes entrantes.",
      },
      {
        name: "Éditeurs de logiciels et scale-ups",
        href: "/secteurs/services-b2b",
        description:
          "Les mêmes leviers, appliqués au logiciel : réponses aux appels d’offres, support de premier niveau, documentation produit tenue à jour.",
      },
      {
        name: "Industrie",
        href: "/secteurs/industrie",
        description:
          "Autour de la technopole, des sites industriels avec de vrais volumes : réponse aux DCE, documentation technique, suivi des non-conformités.",
      },
    ],
    businessCase: {
      context:
        "Éditeur de logiciels d’une quarantaine de salariés. Plusieurs appels d’offres par mois, chaque réponse réécrite à la main par l’avant-vente.",
      metric: "un premier jet en minutes",
      result:
        "Le premier jet de la réponse sort en quelques minutes au lieu de plusieurs heures, assemblé depuis les réponses passées. L’équipe affine au lieu de partir d’une page blanche.",
      label: "Exemple",
    },
    faq: [
      {
        question: "Vous déplacez-vous à Sophia Antipolis ?",
        answer:
          "Oui. La technopole est à une demi-heure de notre bureau niçois. Le point de départ peut se tenir dans vos locaux, la suite s’organise selon vos contraintes.",
      },
      {
        question: "On peut le faire nous-mêmes en interne, non ?",
        answer:
          "Souvent, oui, techniquement. Si vos développeurs ont le temps et l’envie, rien ne vous en empêche, et si c’est le meilleur choix pour vous, on vous le dira dès le point de départ. La vraie question est ailleurs : chaque semaine passée sur l’outillage interne est une semaine en moins sur votre produit. Notre métier est de trouver où l’IA rapporte, de le chiffrer et de livrer vite, pendant que vos équipes restent sur ce qui vous fait vendre.",
      },
      {
        question: "Nos équipes connaissent déjà l’IA. Qu’apportez-vous de plus ?",
        answer:
          "Un chiffrage et une mise en production. Savoir construire un agent et savoir où il rapporte dans une entreprise sont deux métiers différents. On apporte le second, et on livre le premier. Vos développeurs restent concentrés sur votre produit, pas sur l’outillage interne.",
      },
      {
        question: "Quels types d’entreprises accompagnez-vous ?",
        answer:
          "Des PME de 10 à 250 salariés : éditeurs, sociétés de services, industriels. Le point commun : des dirigeants qui veulent des résultats mesurés, pas un pilote de plus. Avoir déjà une équipe technique n’est ni requis ni gênant, ça accélère juste les intégrations.",
      },
      {
        question: "Travaillez-vous à distance ?",
        answer:
          "Oui, la majorité du suivi passe en visio. Les moments qui méritent du face à face (rencontre des équipes, restitution du business case, lancement) se font sur place.",
      },
    ],
    liens: [
      { href: "/blog", name: "Le blog, l’IA sans jargon" },
      { href: "/outils", name: "Les outils gratuits" },
    ],
  },
  {
    slug: "consultant-ia-monaco",
    name: "Monaco",
    inName: "à Monaco",
    metaTitle: "Consultant IA à Monaco | Coucou IA",
    metaDescription:
      "Consultant IA à Monaco : yachting, immobilier, services. Basé à Nice, sur place en Principauté, données sous votre contrôle. Premier échange gratuit.",
    h1: "Consultant IA à Monaco pour les PME et les sociétés de services",
    intro:
      "Coucou IA est basé à Nice, à une demi-heure de la Principauté. On se déplace à Monaco pour les rendez-vous qui comptent, et la visio assure le suivi. La discrétion fait partie de la méthode, pas des options.",
    contexte: {
      title: "L’IA à Monaco : utile, discrète, sous votre contrôle",
      paragraphs: [
        "Monaco vit du yachting, de l’immobilier et des services, au cœur du yachting méditerranéen : le Monaco Yacht Show réunit chaque année la grande plaisance au port Hercule, et le port Vauban d’Antibes est à quelques kilomètres. Des métiers de relation, où chaque client compte et où la confidentialité n’est pas négociable. L’IA y trouve sa place à une condition : rester sous votre contrôle. Vos données ne partent pas dans un outil public, et la décision reste humaine.",
        "Ce qu’on automatise : les demandes entrantes, les dossiers à monter, les documents à produire, souvent en plusieurs langues. Ce qu’on ne touche pas : la relation elle-même. Vos équipes récupèrent des heures sur l’administratif et les passent avec leurs clients.",
        "La Principauté travaille en plusieurs langues et avec des clients sur plusieurs fuseaux horaires. C’est un terrain où l’IA excelle : elle lit et rédige dans la langue du client, à toute heure, et prépare les réponses pendant que vos équipes dorment. Le matin, elles relisent et valident.",
        "On vient en Principauté pour le point de départ si vous le souhaitez, pour la restitution du business case et pour le lancement. Entre ces étapes, la visio suffit.",
      ],
    },
    carte: [
      {
        category: "Charter",
        line: "La proposition part le jour même",
      },
      {
        category: "Immobilier",
        line: "Chaque demande qualifiée, discrètement",
      },
      {
        category: "Multilingue",
        line: "Le client lit la réponse dans sa langue, à toute heure",
      },
      {
        category: "Dossiers",
        line: "L’IA monte le dossier, vous décidez",
      },
    ],
    metiers: [
      {
        name: "Yachting",
        href: "/secteurs/yachting",
        description:
          "Courtage, gestion, charter : demandes clients à toute heure, dossiers multilingues, documents d’escale. L’IA prépare, vos équipes gardent la main.",
      },
      {
        name: "Immobilier",
        href: "/secteurs/immobilier",
        description:
          "Un marché étroit, des clients exigeants : l’IA qualifie les demandes, prépare dossiers et annonces, sans jamais répondre à votre place.",
      },
      {
        name: "Services B2B",
        href: "/secteurs/services-b2b",
        description:
          "Conseil, gestion, administration : recherche dans les dossiers passés, production documentaire, qualification des demandes entrantes.",
      },
    ],
    businessCase: {
      context:
        "Maison de charter et de gestion en Principauté. Les demandes arrivent en plusieurs langues, concentrées sur la haute saison, et chaque proposition se monte à la main entre deux appels.",
      metric: "proposition le jour même",
      result:
        "La demande est qualifiée dans l’heure et la proposition part le jour même, pendant que le client compare encore.",
      label: "Exemple",
    },
    faq: [
      {
        question: "Vous déplacez-vous à Monaco ?",
        answer:
          "Oui. Nice est à une demi-heure de la Principauté. On vient dans vos locaux pour le point de départ, la restitution et le lancement, et plus souvent si le projet le demande.",
      },
      {
        question: "Nos données peuvent-elles rester chez nous ?",
        answer:
          "Oui. L’hébergement se choisit avec vous, y compris sur votre propre infrastructure, et rien ne part vers un modèle public sans votre accord. Soyons francs : certains usages gagnent en qualité avec un grand modèle hébergé chez un fournisseur, dans un cadre contractuel adapté. Quand c’est le cas, on vous le dit, on vous montre ce que ça change, et vous tranchez.",
      },
      {
        question: "Comment gérez-vous la confidentialité ?",
        answer:
          "Elle est conçue dans le système dès le premier jour : vos données restent sous votre contrôle, avec un hébergement adapté, et rien n’est envoyé à un modèle public sans votre accord. Ça vaut aussi pour nous : ce qu’on apprend de votre activité pendant le projet reste entre vous et nous.",
      },
      {
        question: "Quels types d’entreprises accompagnez-vous à Monaco ?",
        answer:
          "Des structures de yachting, d’immobilier et de services, de quelques salariés à plusieurs dizaines. Si vos équipes passent leurs journées sur des dossiers et des demandes répétitives, il y a matière.",
      },
      {
        question: "Travaillez-vous à distance ?",
        answer:
          "Oui. Le développement et le suivi passent en visio, les rencontres se font sur place. Vous choisissez le rythme : un point en face à face à chaque étape, ou tout à distance une fois le système lancé.",
      },
    ],
    liens: [
      { href: "/fondateur", name: "Jérôme Desmares, le fondateur" },
      { href: "/blog", name: "Le blog, l’IA sans jargon" },
    ],
  },
  {
    slug: "consultant-ia-aix-marseille",
    name: "Aix-Marseille",
    inName: "à Aix-Marseille",
    metaTitle: "Consultant IA à Aix-Marseille | Coucou IA",
    metaDescription:
      "Consultant IA à Aix-Marseille : industrie, services B2B, immobilier. Business case chiffré avant engagement, sur place aux étapes clés. Échange gratuit.",
    h1: "Consultant IA à Aix-Marseille pour les PME et les industriels",
    intro:
      "Coucou IA est basé à Nice. Pour la métropole Aix-Marseille, on se déplace aux étapes clés et la visio couvre le reste. La méthode ne change pas : un business case chiffré d’abord, un système en production ensuite.",
    contexte: {
      title: "Un consultant IA pour la métropole Aix-Marseille",
      paragraphs: [
        "D’Aix-en-Provence au port de Marseille, la métropole concentre de l’industrie, de la logistique, des services et de l’immobilier. Marseille est la deuxième ville de France, et son port le premier port de commerce du pays : autour, des entreprises avec de vrais volumes de commandes, de dossiers et de documents techniques. Plus le volume est gros, plus vite une IA bien placée se rembourse.",
        "Soyons clairs sur la géographie : notre bureau est à Nice, à environ deux heures de route. On ne prétend pas passer chaque semaine dans vos locaux. On vient pour ce qui mérite du face à face : la rencontre de vos équipes, la restitution du business case, le lancement. Le reste passe en visio, sans rien perdre.",
        "La région ne manque pas de prestataires informatiques. Notre différence tient en deux temps : un business case chiffré avant que vous n’engagiez un euro, puis des résultats mesurés après la mise en service. Pas de journées vendues au poids, un système qui tourne et des chiffres pour en juger.",
        "Le point de départ, lui, se tient où vous voulez : en visio ou sur place, selon vos contraintes.",
      ],
    },
    carte: [
      {
        category: "Appels d’offres",
        line: "Le dossier en 1 jour au lieu de 5",
      },
      {
        category: "Flux",
        line: "Zéro ressaisie entre vos outils",
      },
      {
        category: "Propositions",
        line: "Elles ne repartent plus de zéro",
      },
      {
        category: "Documents",
        line: "Extraits, contrôlés, envoyés dans l’ERP",
      },
    ],
    metiers: [
      {
        name: "Industrie",
        href: "/secteurs/industrie",
        description:
          "Sites de production, sous-traitance, agroalimentaire : réponse aux DCE, documentation technique, reporting d’atelier sans ressaisie.",
      },
      {
        name: "Services B2B",
        href: "/secteurs/services-b2b",
        description:
          "Conseil, ingénierie, services aux entreprises : propositions commerciales qui ne repartent plus de zéro, livrables passés retrouvés sans fouiller les serveurs.",
      },
      {
        name: "Immobilier",
        href: "/secteurs/immobilier",
        description:
          "Agences, promoteurs, administrateurs de biens : qualification des demandes, montage des dossiers, rédaction des annonces.",
      },
    ],
    businessCase: {
      context:
        "PME industrielle de 60 salariés. Plusieurs DCE à traiter chaque mois, le dossier technique reconstitué à la main à chaque réponse.",
      metric: "1 jour au lieu de 5",
      result:
        "Le dossier de réponse est prêt en une journée au lieu d’une semaine, sans mobiliser un ingénieur à temps plein sur sa constitution.",
      label: "Exemple",
    },
    faq: [
      {
        question: "Vous déplacez-vous à Marseille ou à Aix-en-Provence ?",
        answer:
          "Oui, aux étapes qui comptent : rencontre des équipes, restitution du business case, lancement en production. Notre bureau est à Nice, on planifie les déplacements avec vous.",
      },
      {
        question: "Un projet IA à distance, ça tient vraiment ?",
        answer:
          "Oui, à condition d’être précis sur ce qui passe en visio et ce qui n’y passe pas. La conception, le développement et la mesure se font à distance sans rien perdre : c’est du travail d’écran. Ce qui se perd en visio, c’est la découverte de votre terrain, alors on la fait sur place, comme la restitution et le lancement. Et si vous cherchez quelqu’un dans vos murs chaque semaine, on n’est pas le bon choix : mieux vaut le savoir dès le point de départ.",
      },
      {
        question: "Un consultant basé à Nice peut-il suivre un projet à Marseille ?",
        answer:
          "Oui. L’essentiel du travail (conception, développement, mesure) ne dépend pas du lieu. Ce qui demande du face à face est planifié à l’avance, le reste se fait en visio. Vous le verrez dès le point de départ : la distance ne change ni la méthode, ni le niveau d’exigence.",
      },
      {
        question: "Quels types d’entreprises accompagnez-vous ?",
        answer:
          "Des PME de 10 à 250 salariés de la métropole : industrie, services, immobilier. Le critère n’est pas le secteur, c’est le volume de tâches répétitives qui occupe vos équipes.",
      },
      {
        question: "Combien coûte le point de départ ?",
        answer:
          "Rien. 30 minutes, gratuites, sans engagement. Vous en sortez avec une vue claire de ce que l’IA peut changer chez vous. Si un sujet mérite d’aller plus loin, on le chiffre dans un business case avant toute décision.",
      },
    ],
    liens: [
      { href: "/outils", name: "Les outils gratuits" },
      { href: "/blog", name: "Le blog, l’IA sans jargon" },
      { href: "/fondateur", name: "Jérôme Desmares, le fondateur" },
    ],
  },
];

// Résolution stricte : un slug inconnu casse au build, jamais en silence.
export function getVille(slug: string): Ville {
  const ville = villes.find((entry) => entry.slug === slug);
  if (!ville) {
    throw new Error(`Ville inconnue : ${slug}`);
  }
  return ville;
}

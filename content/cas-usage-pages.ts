// Pages cas d’usage (/cas-usage/[slug]). Spec : docs/programmatic-seo.md.
// Développe les 5 cas de use-cases.ts : les slugs doivent correspondre.
// Chiffres = exemples illustratifs (label "Exemple"), jamais des références validées.
// Slugs verrouillés : reponse-appels-offres, assistant-support-client,
// traitement-documents, recherche-interne, qualification-leads.

import type { BusinessCase, FaqItem } from "@/content/secteurs";

export type CasUsagePage = {
  slug: string;
  // Nom court : cartes du hub, breadcrumb, liens croisés.
  name: string;
  // ≤ 60 caractères.
  metaTitle: string;
  // ~150 caractères, mots-clés en tête.
  metaDescription: string;
  h1: string;
  // Sous-titre hero : la douleur, pas la techno.
  intro: string;
  // Le processus aujourd’hui, étape par étape, outil par outil (3 à 5 étapes).
  before: string[];
  // Le même processus avec le système en production (3 à 5 étapes).
  after: string[];
  // Pourquoi un outil SaaS générique ne suffit pas ici. Sans nommer de marque.
  whyNotSaas: string;
  // Prérequis côté client : données, outils, volumétrie (2 à 4 items).
  prerequisites: string[];
  businessCase: BusinessCase;
  // 4 ou 5 questions. Alimente le JSON-LD FAQPage.
  faq: FaqItem[];
  // Slugs de /secteurs pour le maillage croisé (2 ou 3).
  relatedSecteurs: string[];
};

// Copie du hub /cas-usage.
export const casUsageHub = {
  metaTitle: "Cas d’usage IA : automatisations concrètes en PME | Coucou IA",
  metaDescription:
    "Appels d’offres, support client, traitement de documents, recherche interne, qualification des leads : cinq automatisations IA déployées en production.",
  h1: "Ce que l’IA automatise vraiment dans une PME",
  intro:
    "Pas de démo de labo : des systèmes branchés sur vos données et vos outils, mesurés sur le temps qu’ils rendent à vos équipes.",
};

export const casUsagePages: CasUsagePage[] = [
  {
    slug: "reponse-appels-offres",
    name: "Réponse aux appels d’offres",
    metaTitle: "Répondre aux appels d’offres avec l’IA | Coucou IA",
    metaDescription:
      "Répondre aux appels d’offres avec l’IA : un premier jet généré à partir de vos documents, vos équipes valident. Réservez votre diagnostic gratuit.",
    h1: "Répondre aux appels d’offres avec l’IA",
    intro:
      "Un appel d’offres tombe un vendredi soir, l’échéance dans dix jours, et c’est reparti : retrouver les bonnes références, recopier ce qui a déjà servi vingt fois, espérer n’avoir rien oublié.",
    before: [
      "L’appel d’offres arrive par mail ou sur une plateforme de dématérialisation, et quelqu’un finit par le repérer, parfois tard.",
      "Un chargé d’affaires fouille les dossiers partagés et les mails pour retrouver la dernière réponse à un client comparable.",
      "Il recopie et adapte à la main le cahier des charges, les références, les CV, les certifications, dans un nouveau document.",
      "Les experts métier relisent dans l’urgence, par mail, et plusieurs versions du dossier circulent en parallèle.",
      "Le dossier est assemblé à la dernière minute et déposé juste avant l’échéance, sans marge pour une vraie relecture.",
    ],
    after: [
      "L’IA repère le nouvel appel d’offres, sur la plateforme ou dans la boîte mail, et prévient l’équipe concernée.",
      "Elle génère un premier jet à partir de votre base documentaire : réponses passées, catalogues, CV, certifications.",
      "Le chargé d’affaires relit, ajuste les points propres à ce client précis et valide, au lieu de partir d’une page blanche.",
      "Les experts métier n’interviennent que sur les sections techniques qui le demandent réellement.",
      "Le dossier est prêt avec de l’avance, et il reste du temps pour une dernière relecture au lieu d’une course contre la montre.",
    ],
    whyNotSaas:
      "Un outil générique de réponse aux appels d’offres propose des trames vides. Il ne connaît ni votre catalogue, ni vos offres passées, ni les clauses que vos clients redemandent à chaque fois. Le système que nous construisons se branche sur VOS documents (dossiers partagés, CRM, réponses gagnantes) et applique VOS règles métier. Le premier jet ressemble déjà à ce que vous auriez écrit, pas à des cases vides à remplir.",
    prerequisites: [
      "Un historique d’au moins quelques dizaines de réponses passées, exploitable même s’il est mal rangé.",
      "Un accès aux documents de référence à jour : catalogues, CV, certifications, réponses gagnantes.",
      "Un volume d’appels d’offres régulier (plusieurs par mois) pour que l’automatisation ait un sens.",
      "Un chargé d’affaires disponible pour valider les premiers jets pendant la mise en route.",
    ],
    businessCase: {
      context:
        "Une PME de 40 salariés qui répond à 8 appels d’offres par mois, avec deux chargés d’affaires qui passaient chacun une demi-journée par dossier sur la seule recherche documentaire.",
      metric: "4 h gagnées par dossier",
      result:
        "Le premier jet est prêt en quelques minutes au lieu d’une demi-journée de recherche. Le temps des équipes se concentre sur la relecture et la personnalisation.",
      label: "Exemple",
    },
    faq: [
      {
        question: "Est-ce que l’IA répond toute seule à un appel d’offres ?",
        answer:
          "Non, et ce n’est pas l’objectif. Elle génère un premier jet à partir de vos documents. Un chargé d’affaires relit, corrige les points spécifiques au client et signe la réponse. L’IA fait gagner du temps sur la recherche et la rédaction, pas sur la décision.",
      },
      {
        question:
          "Que se passe-t-il si l’IA se trompe sur une référence ou une certification ?",
        answer:
          "Le système s’appuie uniquement sur vos documents sources, jamais sur des connaissances générales inventées. Chaque premier jet reste soumis à la relecture d’un chargé d’affaires avant envoi, exactement comme aujourd’hui.",
      },
      {
        question: "Nos équipes vont-elles vraiment s’en servir ?",
        answer:
          "Elles gardent la main sur la partie qui compte : la relation client et la personnalisation. Ce qui disparaît, c’est la recherche fastidieuse dans les dossiers partagés. En général, l’adoption vient vite parce que le gain est immédiat.",
      },
      {
        question: "Combien de temps avant d’avoir un système en production ?",
        answer:
          "Cela dépend du volume et de l’état de votre base documentaire, mais l’objectif est un système qui tourne réellement, pas un prototype de démonstration qui reste au labo.",
      },
      {
        question:
          "Nos dossiers d’appels d’offres contiennent des informations sensibles. Sont-ils protégés ?",
        answer:
          "Oui. L’architecture respecte le RGPD et l’AI Act dès la conception, avec un hébergement qui garde vos données sous contrôle. La souveraineté de vos documents est un point de départ, pas une option.",
      },
    ],
    relatedSecteurs: ["industrie", "services-b2b", "assurance-mutuelle"],
  },
  {
    slug: "assistant-support-client",
    name: "Assistant support client",
    metaTitle: "Assistant IA support client | Coucou IA",
    metaDescription:
      "Assistant IA support client : un chatbot d’entreprise qui répond avec vos documents et transfère les cas complexes à vos équipes. Diagnostic gratuit.",
    h1: "Un assistant IA support client qui répond avec vos vraies réponses",
    intro:
      "Les mêmes questions reviennent chaque semaine, les tickets s’accumulent le soir et le week-end, et vos agents passent leur journée à répéter ce qu’ils ont déjà écrit cent fois.",
    before: [
      "Le client envoie sa question par mail, formulaire ou chat, souvent en dehors des horaires d’ouverture.",
      "Le ticket attend dans une file (boîte mail partagée ou outil de support) qu’un agent soit disponible.",
      "L’agent cherche la réponse dans la documentation produit, les mails précédents, ou demande à un collègue.",
      "Il rédige une réponse personnalisée, même pour une question déjà traitée des dizaines de fois cette semaine.",
      "Aux pics d’activité (panne, promotion, lancement), l’équipe est submergée et les délais de réponse s’allongent.",
    ],
    after: [
      "L’assistant répond en premier, à toute heure, à partir de votre documentation produit et de l’historique de vos tickets résolus.",
      "Les questions récurrentes (suivi de commande, procédure, information produit) sont traitées immédiatement.",
      "Dès qu’une demande sort du cadre connu (réclamation, cas technique, situation sensible), l’assistant transfère à un agent avec le contexte déjà réuni.",
      "L’agent traite les cas complexes en priorité, sans repartir de zéro grâce au résumé fourni.",
      "Les pics d’activité n’allongent plus les délais sur les questions simples : seul le volume de cas complexes varie.",
    ],
    whyNotSaas:
      "Un chatbot générique répond avec une base de connaissances qu’il faut alimenter à la main, article par article, sans jamais couvrir vos cas particuliers. Le système que nous construisons lit directement votre documentation existante et l’historique réel de vos tickets résolus, sans double saisie. Il répond avec le ton et les règles de votre entreprise, et sait reconnaître ce qu’il ne sait pas pour transférer plutôt que d’improviser.",
    prerequisites: [
      "Une documentation produit ou un historique de tickets résolus, exploitable même imparfait.",
      "Un outil de support existant (boîte mail, ticketing) auquel se connecter.",
      "Un volume de demandes suffisant pour que l’automatisation des questions récurrentes ait un impact mesurable.",
      "Une équipe support disponible pour valider les premières réponses et ajuster le ton.",
    ],
    businessCase: {
      context:
        "Une entreprise de services de 25 salariés qui reçoit 300 demandes par mois sur trois canaux, avec deux personnes dédiées au support de premier niveau.",
      metric: "-50 % de tickets niveau 1",
      result:
        "La moitié des demandes de premier niveau sont traitées sans intervention humaine. Les deux agents concentrent leur temps sur les réclamations et les cas techniques.",
      label: "Exemple",
    },
    faq: [
      {
        question: "L’assistant peut-il donner une réponse fausse à un client ?",
        answer:
          "Il s’appuie uniquement sur votre documentation et votre historique de tickets, jamais sur des connaissances générales. Quand il ne trouve pas de réponse fiable, il transfère à un agent au lieu d’improviser.",
      },
      {
        question: "Que se passe-t-il si l’assistant ne sait pas répondre ?",
        answer:
          "Il transfère la demande à un agent humain avec le contexte déjà réuni : historique du client, question, ce qui a déjà été tenté. L’agent ne repart pas de zéro.",
      },
      {
        question:
          "Vos équipes vont-elles perdre la main sur la relation client ?",
        answer:
          "Non. L’assistant absorbe les questions répétitives et laisse les cas qui comptent vraiment aux agents : réclamations, situations sensibles, clients à enjeu. Le contact humain se déplace vers ce qui en a besoin.",
      },
      {
        question: "Combien de temps pour mettre l’assistant en production ?",
        answer:
          "Cela dépend du volume de documentation à connecter et du nombre de canaux, mais l’objectif reste un système qui tourne réellement en production, pas une démo qui reste au labo.",
      },
      {
        question: "Nos données clients restent-elles protégées ?",
        answer:
          "Oui. L’architecture respecte le RGPD et l’AI Act dès la conception, avec un hébergement qui garde vos données sous contrôle et aucune fuite vers des modèles publics non voulue.",
      },
    ],
    relatedSecteurs: [
      "services-b2b",
      "assurance-mutuelle",
      "sante-medico-social",
    ],
  },
  {
    slug: "traitement-documents",
    name: "Traitement de documents",
    metaTitle: "Automatiser le traitement de documents avec l’IA | Coucou IA",
    metaDescription:
      "Automatisation du traitement de factures et documents avec l’IA : extraction, contrôle, envoi direct dans votre ERP. Diagnostic gratuit.",
    h1: "Automatiser le traitement de vos factures et documents avec l’IA",
    intro:
      "Un dossier partagé qui déborde de PDF à trier, une ressaisie qui recommence chaque matin, et l’erreur de frappe qui finit toujours par coûter cher.",
    before: [
      "La facture ou le contrat arrive par mail, scan ou dépôt dans un dossier partagé, sans ordre particulier.",
      "Quelqu’un l’ouvre et vérifie à l'œil les informations : montant, fournisseur, échéance, numéro de commande.",
      "Les données sont ressaisies à la main dans le tableur de suivi ou directement dans l’ERP ou le logiciel de comptabilité.",
      "En cas de doute (montant illisible, fournisseur inconnu), le document part par mail pour vérification.",
      "Le document est classé dans un dossier, souvent après plusieurs jours d’attente.",
    ],
    after: [
      "Le document arrive (mail, scan, dossier partagé) et l’IA le lit automatiquement : type, montant, fournisseur, dates, références.",
      "Les données extraites sont vérifiées par rapprochement avec vos règles : fournisseur connu, montant cohérent avec la commande.",
      "Les documents conformes sont envoyés directement dans votre ERP ou logiciel de comptabilité, sans ressaisie.",
      "Les cas ambigus (montant douteux, nouveau fournisseur, format inhabituel) sont mis de côté pour qu’un humain tranche.",
      "Le document est classé et archivé automatiquement, retrouvable en quelques secondes.",
    ],
    whyNotSaas:
      "Un outil générique de lecture de factures reconnaît des formats standards, mais bute sur vos bons de commande maison, vos gabarits fournisseurs spécifiques ou vos règles de rapprochement internes. Le système que nous construisons apprend VOS documents et se branche directement sur VOTRE ERP ou logiciel de comptabilité, pas sur un export à réimporter à la main. Les règles de validation sont les vôtres, pas un paramétrage générique.",
    prerequisites: [
      "Un volume de documents régulier (au moins plusieurs dizaines par semaine) qui justifie l’automatisation.",
      "Un accès à l’ERP ou au logiciel de comptabilité pour y envoyer les données extraites.",
      "Des documents globalement lisibles (scan ou PDF correct), même s’ils ne sont pas standardisés.",
      "Une personne côté client pour définir les règles de validation, c’est-à-dire quand un cas doit remonter à un humain.",
    ],
    businessCase: {
      context:
        "Un cabinet de 15 personnes qui traite 600 factures fournisseurs par mois, avec une personne à mi-temps sur la seule saisie.",
      metric: "-80 % de saisie manuelle",
      result:
        "80 % du temps de saisie manuelle est récupéré. La personne dédiée passe son temps sur les cas particuliers et le contrôle plutôt que sur la ressaisie.",
      label: "Exemple",
    },
    faq: [
      {
        question: "L’IA peut-elle se tromper sur un montant ou un fournisseur ?",
        answer:
          "L’extraction est vérifiée par rapprochement avec vos règles (fournisseur connu, montant cohérent). Un cas ambigu n’est jamais validé seul : il est mis de côté pour qu’un humain tranche.",
      },
      {
        question: "Comment corriger une erreur si elle passe malgré tout ?",
        answer:
          "Chaque document traité garde une trace de son origine et des données extraites, ce qui permet de corriger et de retrouver l’erreur facilement. Ce n’est pas une boîte noire.",
      },
      {
        question: "Est-ce que ça remplace notre équipe comptable ?",
        answer:
          "Non. Le temps libéré sur la saisie se reporte sur le contrôle, les cas particuliers et les tâches à plus forte valeur. L’équipe garde la main sur la validation.",
      },
      {
        question: "Combien de temps pour que le système tourne en production ?",
        answer:
          "Cela dépend de la variété de vos documents et de la connexion à votre ERP, mais l’objectif est un système en usage réel, pas un prototype qui reste au stade de test.",
      },
      {
        question:
          "Nos factures et contrats contiennent des données sensibles. Comment sont-elles protégées ?",
        answer:
          "L’architecture respecte le RGPD et l’AI Act dès la conception, avec un hébergement qui garde vos données sous contrôle. La sécurité n’est pas une option ajoutée après coup.",
      },
    ],
    relatedSecteurs: ["expertise-comptable", "industrie", "services-b2b"],
  },
  {
    slug: "recherche-interne",
    name: "Recherche interne intelligente",
    metaTitle: "Recherche documentaire interne avec l’IA | Coucou IA",
    metaDescription:
      "Recherche documentaire interne avec l’IA : retrouvez l’information en entreprise en quelques secondes, sur tous vos outils. Diagnostic gratuit.",
    h1: "Une recherche documentaire interne qui retrouve enfin l’information",
    intro:
      "L’information existe quelque part dans l’entreprise, mais personne ne sait où : Drive, mails, ERP, SharePoint, ou la mémoire d’un collègue en congés.",
    before: [
      "Un collaborateur cherche une information (contrat, procédure, décision passée) sans savoir où elle se trouve.",
      "Il tape des mots-clés approximatifs dans la recherche native de chaque outil, un par un, sans certitude de tout couvrir.",
      "Faute de résultat clair, il envoie un message à un collègue susceptible de savoir ou de se souvenir.",
      "Il attend une réponse, parfois plusieurs heures, parfois jamais s’il n’a pas trouvé la bonne personne.",
      "Une fois retrouvée, l’information est recopiée dans un nouveau document pour ne plus la perdre, et finit par se reperdre quand même.",
    ],
    after: [
      "Le collaborateur pose sa question en langage courant, dans un seul point d’entrée, sans savoir à l’avance où se trouve la réponse.",
      "L’IA cherche simultanément dans vos sources connectées (Drive, mails, ERP, SharePoint) et retourne les documents ou passages pertinents.",
      "La réponse cite ses sources : le collaborateur voit d’où vient l’information et peut vérifier le document d’origine.",
      "Pour les sujets sensibles ou les décisions engageantes, l’accès reste limité aux personnes autorisées, comme avant.",
      "Les messages envoyés à un collègue « au cas où il saurait » disparaissent pour tout ce qui est déjà écrit dans l’entreprise.",
    ],
    whyNotSaas:
      "Un outil de recherche générique indexe ce qu’on lui donne, mais ne comprend ni vos sigles internes, ni la hiérarchie de vos dossiers, ni les droits d’accès propres à votre organisation. Le système que nous construisons se branche sur VOS outils exacts, avec VOS permissions respectées, et répond dans le vocabulaire de votre entreprise. Ce n’est pas un moteur de recherche de plus à ouvrir, c’est une seule porte d’entrée sur ce que vous avez déjà.",
    prerequisites: [
      "Des documents déjà numérisés et rangés dans au moins un outil accessible (Drive, SharePoint, ERP, messagerie).",
      "Des droits d’accès existants et clairs, pour que la recherche respecte qui a le droit de voir quoi.",
      "Un volume d’information suffisant pour que la recherche manuelle soit vraiment un problème.",
      "Une personne côté client pour définir les sources prioritaires à connecter en premier.",
    ],
    businessCase: {
      context:
        "Une entreprise industrielle de 120 salariés avec des procédures et des retours d’expérience éparpillés entre un Drive, une messagerie et un ERP vieillissant.",
      metric: "l’info en secondes",
      result:
        "L’information est retrouvée en quelques secondes, contre une bonne demi-heure de recherche et de messages avant.",
      label: "Exemple",
    },
    faq: [
      {
        question:
          "L’IA peut-elle inventer une réponse qui n’existe pas dans nos documents ?",
        answer:
          "Non. Elle répond uniquement à partir de vos documents connectés et cite ses sources. Si l’information n’existe pas chez vous, elle le dit au lieu d’inventer une réponse.",
      },
      {
        question: "Est-ce que tout le monde peut tout voir avec cet outil ?",
        answer:
          "Non. La recherche respecte vos droits d’accès existants. Un collaborateur qui n’avait pas accès à un dossier de contrats avant n’y accède pas davantage via la recherche.",
      },
      {
        question: "Nos équipes vont-elles devoir changer leurs habitudes ?",
        answer:
          "Très peu. Il y a un seul point d’entrée à connaître au lieu de dix recherches natives différentes. C’est plus simple que ce qui existe aujourd’hui, pas plus compliqué.",
      },
      {
        question: "Combien de temps pour connecter nos outils ?",
        answer:
          "Cela dépend du nombre de sources à relier, mais l’objectif est un système utilisé au quotidien, pas un prototype qui reste au stade de démonstration.",
      },
      {
        question: "Où sont hébergées nos données pendant la recherche ?",
        answer:
          "Dans une architecture conforme au RGPD et à l’AI Act, avec un hébergement qui garde vos données sous contrôle et aucune fuite vers des modèles publics non voulue.",
      },
    ],
    relatedSecteurs: ["cabinets-juridiques", "industrie", "services-b2b"],
  },
  {
    slug: "qualification-leads",
    name: "Qualification des leads",
    metaTitle: "Qualifier vos leads automatiquement avec l’IA | Coucou IA",
    metaDescription:
      "Qualification automatique des leads : triez vos demandes entrantes et routez-les au bon commercial, sans perdre de temps. Diagnostic gratuit.",
    h1: "Qualification automatique des leads et tri des demandes entrantes",
    intro:
      "Les demandes arrivent de partout, le formulaire du site, un mail, un appel, LinkedIn, et un commercial passe sa matinée à deviner lesquelles valent le coup.",
    before: [
      "Une demande arrive par le formulaire du site, un mail, un appel ou un message LinkedIn, sur des canaux différents.",
      "Un commercial la lit et essaie de deviner si elle est sérieuse, urgente, ou hors cible.",
      "Il cherche des informations complémentaires sur l’entreprise (site, LinkedIn, CRM) pour évaluer le potentiel.",
      "Il note la demande dans le CRM, souvent en retard, parfois pas du tout si la journée a été chargée.",
      "La demande est affectée au bon commercial ou au bon service après plusieurs jours, une fois le prospect déjà agacé.",
    ],
    after: [
      "La demande arrive, quel que soit le canal, et l’IA l’analyse immédiatement : secteur, taille d’entreprise, urgence, budget évoqué.",
      "Elle enrichit automatiquement la fiche avec les informations disponibles pour donner du contexte au commercial.",
      "Les demandes qualifiées sont routées directement vers le bon commercial, avec la fiche déjà remplie dans le CRM.",
      "Les demandes hors cible ou peu qualifiées sont écartées ou orientées vers un traitement différent, sans mobiliser un commercial.",
      "Le commercial garde la main sur la décision finale de prise de contact : il reçoit un dossier prêt, pas un ordre à exécuter.",
    ],
    whyNotSaas:
      "Un outil générique de scoring applique une grille standard qui ignore vos critères réels : votre client idéal, votre cycle de vente, les signaux qui chez vous distinguent un bon prospect d’un simple curieux. Le système que nous construisons apprend vos règles de qualification et se branche sur VOTRE CRM, pas sur un score générique à réinterpréter à chaque fois. Vos commerciaux reçoivent des dossiers triés selon vos propres critères.",
    prerequisites: [
      "Un CRM ou un outil de suivi des demandes déjà en place, même basique.",
      "Des critères de qualification déjà identifiés en interne, même informels (taille d’entreprise cible, budget, urgence).",
      "Un volume de demandes entrantes suffisant pour que le tri manuel soit vraiment un goulot d’étranglement.",
      "Une équipe commerciale disponible pour valider les premiers routages et ajuster les règles.",
    ],
    businessCase: {
      context:
        "Une entreprise de services B2B de 30 salariés qui reçoit 150 demandes entrantes par mois sur quatre canaux, avec un commercial qui passait une heure par jour à les trier.",
      metric: "0 tri manuel",
      result:
        "Chaque demande est qualifiée et routée en continu, sans tri manuel quotidien. Les commerciaux démarrent leur journée avec des dossiers déjà classés par priorité.",
      label: "Exemple",
    },
    faq: [
      {
        question: "L’IA peut-elle mal qualifier un bon prospect ?",
        answer:
          "Les règles sont définies avec votre équipe commerciale et ajustables. Pendant la mise en route, les cas limites restent visibles pour un contrôle humain, le temps que les seuils soient bien calés sur votre réalité.",
      },
      {
        question:
          "Vos commerciaux vont-ils perdre le contact humain avec les prospects ?",
        answer:
          "Non. L’IA trie et priorise, elle ne contacte personne à leur place. Le commercial garde la décision de prise de contact et le premier échange.",
      },
      {
        question: "Que se passe-t-il si un lead est mal classé ?",
        answer:
          "Le classement reste modifiable et chaque correction affine les règles pour la suite. Ce n’est pas un verdict figé, c’est un tri qui s’améliore avec l’usage.",
      },
      {
        question: "Combien de temps avant que le tri soit automatique en production ?",
        answer:
          "Cela dépend de la complexité de vos critères et de la connexion au CRM, mais l’objectif est un système utilisé au quotidien par vos commerciaux, pas une démonstration isolée.",
      },
      {
        question: "Les données de nos prospects sont-elles en sécurité ?",
        answer:
          "Oui. L’architecture respecte le RGPD et l’AI Act dès la conception, avec un hébergement qui garde vos données sous contrôle.",
      },
    ],
    relatedSecteurs: ["services-b2b", "assurance-mutuelle", "industrie"],
  },
];

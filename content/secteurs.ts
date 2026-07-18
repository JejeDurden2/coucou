// Pages secteurs (/secteurs/[slug]). Spec : docs/programmatic-seo.md.
// Chiffres = exemples illustratifs (label "Exemple"), jamais des références validées.
// Slugs verrouillés : expertise-comptable, cabinets-juridiques, industrie,
// services-b2b, assurance-mutuelle, sante-medico-social.

export type SecteurUseCase = {
  title: string;
  // Reformulé dans le vocabulaire métier du secteur, pas le générique de la home.
  description: string;
};

// Partagés avec les pages cas d'usage (cas-usage-pages.ts) et lib/seo.ts.
export type FaqItem = {
  question: string;
  answer: string;
};

export type BusinessCase = {
  // Situation de départ concrète (taille d'équipe, volumétrie, tâche).
  context: string;
  // Chiffre court pour le metric-block (ex. "-70 % de saisie"), jamais une phrase.
  metric: string;
  // Phrase d'appui sous le chiffre.
  result: string;
  // Toujours "Exemple" : aucune référence client n'est validée.
  label: string;
};

export type SecteurPage = {
  slug: string;
  // Nom court du secteur : cartes du hub, breadcrumb, liens croisés.
  name: string;
  // ≤ 60 caractères.
  metaTitle: string;
  // ~150 caractères, mots-clés en tête.
  metaDescription: string;
  h1: string;
  // Sous-titre hero : la douleur du persona, pas la techno.
  intro: string;
  // Le problème dans les mots du secteur (3 items).
  painPoints: string[];
  // 3 ou 4 cas d'usage sectoriels.
  useCases: SecteurUseCase[];
  // Contrainte réglementaire propre au secteur (secret professionnel, HDS, ACPR...).
  compliance: { title: string; body: string };
  businessCase: BusinessCase;
  // 4 ou 5 questions. Alimente le JSON-LD FAQPage.
  faq: FaqItem[];
  // Slugs de /cas-usage pour le maillage croisé (2 ou 3).
  relatedCasUsage: string[];
};

// Copie du hub /secteurs.
export const secteursHub = {
  metaTitle: "IA par secteur : cas d'usage pour PME et ETI | Coucou IA",
  metaDescription:
    "L'IA appliquée à votre secteur : expertise comptable, industrie, assurance, santé, juridique, services B2B. Cas d'usage concrets et ROI mesurable.",
  h1: "L'IA qui rapporte, secteur par secteur",
  intro:
    "Chaque métier a ses tâches chronophages et ses contraintes. Voici où l'IA crée de la valeur dans le vôtre, concrètement.",
};

export const secteurs: SecteurPage[] = [
  {
    slug: "expertise-comptable",
    name: "Expertise comptable",
    metaTitle: "IA pour cabinet comptable : cas d'usage et ROI | Coucou IA",
    metaDescription:
      "IA pour cabinet comptable : pré-affectation des écritures, liasses fiscales, réponses clients. ROI chiffré avant engagement. Diagnostic gratuit.",
    h1: "IA pour cabinet comptable : moins de saisie, plus de conseil",
    intro:
      "Entre la saisie qui s'accumule et la période fiscale qui arrive toujours trop vite, vos collaborateurs n'ont plus le temps de faire ce pour quoi les clients vous paient vraiment : conseiller.",
    painPoints: [
      "Vos collaborateurs ressaisissent encore les pièces comptables une par une, alors que le nombre de dossiers ne cesse d'augmenter.",
      "La période fiscale concentre bilans, liasses et déclarations sur quelques semaines, et l'équipe encaisse le pic chaque année, sans renfort durable.",
      "Les mêmes questions reviennent en boucle côté clients (échéances, pièces manquantes, TVA), et elles grignotent le temps que vous devriez consacrer au conseil.",
    ],
    useCases: [
      {
        title: "Pré-affectation des écritures",
        description:
          "L'IA lit les pièces reçues (factures, relevés) et propose l'imputation comptable. Le collaborateur valide au lieu de saisir depuis zéro.",
      },
      {
        title: "Préparation des liasses fiscales",
        description:
          "Les éléments récurrents d'une liasse sont rassemblés et pré-remplis à partir des données de l'exercice, avant la relecture de l'expert-comptable.",
      },
      {
        title: "Réponses aux questions clients en période fiscale",
        description:
          "Un assistant répond aux questions fréquentes (échéances, pièces à fournir) à partir de vos process internes, et transmet les cas particuliers au bon collaborateur.",
      },
      {
        title: "Lettrage et rapprochement bancaire",
        description:
          "Les écritures et les relevés bancaires sont rapprochés automatiquement. Seuls les écarts remontent à un collaborateur.",
      },
    ],
    compliance: {
      title: "Secret professionnel et déontologie de l'Ordre",
      body: "Les systèmes que nous concevons respectent, dès la conception, le secret professionnel et les règles déontologiques de l'Ordre des experts-comptables. Vos données clients restent sous votre contrôle : hébergement adapté, aucune pièce comptable envoyée à un modèle public sans que vous l'ayez choisi. Le tout dans le cadre du RGPD et de l'AI Act.",
    },
    businessCase: {
      context:
        "Cabinet de 12 collaborateurs, plusieurs milliers de pièces comptables à traiter chaque mois, pic marqué pendant la période fiscale.",
      metric: "-70 % de saisie",
      result:
        "Jusqu'à 70 % de temps de saisie en moins sur les pièces courantes, plusieurs jours de collaborateur récupérés chaque mois pendant la période fiscale.",
      label: "Exemple",
    },
    faq: [
      {
        question: "Un cabinet comptable peut-il vraiment confier ses pièces à l'IA ?",
        answer:
          "Le secret professionnel n'est pas négociable pour nous non plus. Les systèmes sont conçus pour que vos données restent sous votre contrôle, avec un hébergement adapté et sans envoi vers des modèles publics sans votre accord. Chaque écriture proposée par l'IA reste validée par un collaborateur.",
      },
      {
        question:
          "On a déjà testé un outil de reconnaissance de factures, ça n'a pas tenu sur nos volumes.",
        answer:
          "Un outil générique s'arrête souvent dès qu'il rencontre un format de pièce inhabituel. Ici, le système est construit sur VOS pièces et VOS process, et mesuré sur ses résultats, pas sur une démo qui reste au stade de test.",
      },
      {
        question: "Est-ce compatible avec notre logiciel de production comptable ?",
        answer:
          "Le système s'intègre à vos outils existants, il ne les remplace pas. Le diagnostic identifie précisément où l'IA se branche dans votre chaîne de production actuelle.",
      },
      {
        question: "Quel retour sur investissement avant qu'on s'engage ?",
        answer:
          "Vous recevez un business case chiffré avant tout engagement : volumétrie de votre cabinet, gain estimé, coût. Vous décidez en connaissance de cause.",
      },
      {
        question: "Nos données clients restent-elles confidentielles ?",
        answer:
          "Oui, c'est le point de départ, pas une option. Secret professionnel, RGPD et AI Act encadrent la conception de chaque système dès le premier jour.",
      },
    ],
    relatedCasUsage: ["traitement-documents", "assistant-support-client", "recherche-interne"],
  },
  {
    slug: "cabinets-juridiques",
    name: "Cabinets juridiques",
    metaTitle: "IA pour cabinet d'avocats : cas d'usage et ROI | Coucou IA",
    metaDescription:
      "IA pour cabinet d'avocats : recherche documentaire, premiers jets de conclusions, suivi des délais. ROI chiffré avant engagement. Diagnostic gratuit.",
    h1: "IA pour cabinet d'avocats : moins de recherche, plus de dossiers traités",
    intro:
      "Entre la recherche dans des dossiers qui s'empilent et la rédaction de premiers jets qui recommence à chaque affaire, vos collaborateurs perdent du temps sur des tâches que la mémoire du cabinet devrait déjà couvrir.",
    painPoints: [
      "Vos collaborateurs passent des heures à retrouver la bonne pièce, le bon précédent ou la bonne clause dans des dossiers qui s'empilent.",
      "La rédaction des premiers jets (conclusions, contrats types, courriers) recommence à chaque dossier, alors que la structure varie peu d'une affaire à l'autre.",
      "Le suivi des délais et des pièces manquantes repose sur la mémoire des collaborateurs, avec le risque qu'un oubli coûte cher au dossier.",
    ],
    useCases: [
      {
        title: "Recherche dans le fonds documentaire du cabinet",
        description:
          "Retrouvez jurisprudence interne, précédents et pièces à partir d'une question en langage courant, sans rouvrir les dossiers un par un.",
      },
      {
        title: "Premier jet de conclusions ou de contrats types",
        description:
          "L'IA rédige une version initiale à partir de vos modèles et du dossier en cours. L'avocat révise, complète et signe.",
      },
      {
        title: "Synthèse de dossiers volumineux",
        description:
          "Un dossier de plusieurs centaines de pages (pièces, échanges, jurisprudence) est résumé en quelques minutes, pour préparer un rendez-vous client ou une audience.",
      },
      {
        title: "Suivi des échéances et pièces manquantes",
        description:
          "Un agent relance automatiquement pour les pièces en attente et signale les délais qui approchent, sans dépendre de la mémoire de l'équipe.",
      },
    ],
    compliance: {
      title: "Secret professionnel de l'avocat et RIN",
      body: "Les systèmes que nous concevons respectent, dès la conception, le secret professionnel de l'avocat et les exigences du Règlement Intérieur National sur la confidentialité et l'usage d'outils numériques. Vos dossiers restent sous votre contrôle, avec un hébergement adapté. Le tout dans le cadre du RGPD et de l'AI Act.",
    },
    businessCase: {
      context:
        "Cabinet de 8 avocats, plusieurs centaines de dossiers actifs, un premier jet de conclusions à produire à chaque nouvelle affaire.",
      metric: "recherche divisée par 2",
      result:
        "Premier jet de conclusions produit en quelques minutes au lieu d'une demi-journée, temps de recherche documentaire divisé par deux sur les dossiers volumineux.",
      label: "Exemple",
    },
    faq: [
      {
        question:
          "Le secret professionnel est non négociable pour nous, comment est-il garanti ?",
        answer:
          "C'est le point de départ de chaque système que nous concevons, pas une option ajoutée après coup. Vos dossiers restent sous votre contrôle, avec un hébergement adapté et dans le respect du RIN.",
      },
      {
        question: "Un avocat garde-t-il la main sur ce que produit l'IA ?",
        answer:
          "Toujours. L'IA prépare un premier jet ou une synthèse, l'avocat révise, corrige et signe. La décision et la responsabilité restent entièrement de son côté.",
      },
      {
        question:
          "On a testé ChatGPT pour des recherches juridiques, les réponses n'étaient pas fiables.",
        answer:
          "ChatGPT seul répond à partir de connaissances générales, pas de vos dossiers. Notre système travaille sur votre fonds documentaire réel, avec des réponses sourcées dans vos propres pièces.",
      },
      {
        question: "On a peur de retomber sur un outil qui reste au stade de test.",
        answer:
          "C'est justement pour ça qu'on existe. On ne livre pas une démo, on livre un système en production, utilisé au quotidien et mesuré sur ses résultats.",
      },
      {
        question: "Quel est le retour sur investissement pour un cabinet de notre taille ?",
        answer:
          "Vous recevez un business case chiffré avant tout engagement : volume de dossiers, gain de temps estimé, coût. La décision se prend sur des chiffres, pas sur une promesse.",
      },
    ],
    relatedCasUsage: ["recherche-interne", "traitement-documents", "qualification-leads"],
  },
  {
    slug: "industrie",
    name: "Industrie",
    metaTitle: "IA pour l'industrie PME : cas d'usage et ROI | Coucou IA",
    metaDescription:
      "IA pour l'industrie PME : réponse aux DCE, documentation technique, reporting de production. ROI chiffré avant engagement. Diagnostic gratuit.",
    h1: "IA pour l'industrie PME : de l'atelier au dossier d'appel d'offres",
    intro:
      "Entre les DCE à boucler en quelques jours et les données d'atelier éparpillées entre les machines et les tableurs, vos équipes passent plus de temps à chercher l'information qu'à produire.",
    painPoints: [
      "Les données de production (capteurs, MES, feuilles d'atelier) restent éparpillées, personne n'a de vue d'ensemble en temps réel.",
      "Répondre à un DCE ou à un appel d'offres industriel demande de rassembler des dizaines de documents techniques et normatifs à chaque fois, sous délai serré.",
      "Le contrôle qualité et la maintenance reposent encore sur des rondes papier et la mémoire des équipes, avec le risque de rater un signal faible avant qu'il ne devienne un arrêt de ligne.",
    ],
    useCases: [
      {
        title: "Réponse aux DCE et appels d'offres industriels",
        description:
          "L'IA rassemble pièces techniques, fiches produits et références passées pour produire un premier dossier de réponse. Vos équipes valident et complètent avant l'envoi.",
      },
      {
        title: "Recherche dans la documentation technique",
        description:
          "Retrouvez une procédure, une fiche machine ou une norme dans la documentation de l'atelier, en langage courant, plutôt qu'en fouillant les classeurs ou le serveur partagé.",
      },
      {
        title: "Suivi des non-conformités",
        description:
          "L'IA lit les rapports de contrôle qualité et les comptes rendus d'incident, les classe et signale les signaux qui se répètent avant qu'ils ne deviennent un problème récurrent.",
      },
      {
        title: "Automatisation du reporting de production",
        description:
          "Les données d'atelier (temps d'arrêt, rebuts, cadences) sont consolidées automatiquement dans un tableau de bord, sans ressaisie manuelle.",
      },
    ],
    compliance: {
      title: "Propriété industrielle et données de production",
      body: "Les systèmes que nous concevons protègent, dès la conception, vos données de production et votre propriété industrielle. Rien ne sort de votre périmètre sans votre accord : hébergement adapté, aucun plan ni procédé envoyé à un modèle public par défaut. Le tout dans le cadre du RGPD et de l'AI Act.",
    },
    businessCase: {
      context:
        "PME industrielle de 60 salariés, plusieurs DCE à traiter chaque mois, dossier technique constitué manuellement à chaque fois.",
      metric: "1 jour au lieu de 5",
      result:
        "Premier dossier de réponse à un DCE prêt en une journée au lieu d'une semaine, sans mobiliser un ingénieur à temps plein sur la constitution du dossier.",
      label: "Exemple",
    },
    faq: [
      {
        question: "Nos données de production sont sensibles, peuvent-elles sortir de l'usine ?",
        answer:
          "Non, pas sans votre accord. Les systèmes sont conçus pour garder vos données de production et votre propriété industrielle sous votre contrôle, avec un hébergement adapté.",
      },
      {
        question: "On a déjà testé un outil IA sur une ligne, ça n'a pas dépassé le stade du pilote.",
        answer:
          "C'est le problème qu'on résout. On ne livre pas un prototype de démonstration, on livre un système en production, utilisé au quotidien et mesuré sur ses résultats.",
      },
      {
        question: "Est-ce compatible avec nos systèmes existants (ERP, MES) ?",
        answer:
          "Le système s'intègre à vos outils existants, il ne les remplace pas. Le diagnostic identifie précisément où l'IA se branche dans votre chaîne actuelle.",
      },
      {
        question: "Quel est le retour sur investissement avant qu'on investisse ?",
        answer:
          "Vous recevez un business case chiffré avant tout engagement : volumétrie, gain estimé, coût. Vous décidez sur des chiffres, pas sur une promesse.",
      },
      {
        question: "Nos équipes d'atelier ne sont pas des experts IA, est-ce un problème ?",
        answer:
          "Non. On pilote le projet de bout en bout et on documente ce qu'on livre. Vos équipes utilisent le système sans avoir à monter une équipe data en interne.",
      },
    ],
    relatedCasUsage: ["reponse-appels-offres", "traitement-documents", "recherche-interne"],
  },
  {
    slug: "services-b2b",
    name: "Services B2B",
    metaTitle: "IA pour services B2B : cas d'usage et ROI | Coucou IA",
    metaDescription:
      "IA pour services B2B : propositions commerciales, recherche de missions passées, qualification des leads. ROI chiffré avant engagement. Diagnostic gratuit.",
    h1: "IA pour services B2B : moins de tâches répétitives, plus de missions",
    intro:
      "Entre les propositions commerciales à refaire à chaque client et les questions de suivi qui reviennent sans arrêt, vos consultants passent plus de temps sur l'administratif que sur la mission elle-même.",
    painPoints: [
      "Chaque nouvelle mission redémarre de zéro : proposition commerciale, cadrage, comptes rendus, alors que la structure change peu d'un client à l'autre.",
      "Vos consultants perdent du temps à retrouver une information dans les livrables et échanges de missions passées, plutôt qu'à la produire pour le client actuel.",
      "Les demandes récurrentes (statut de mission, questions administratives) mobilisent des collaborateurs seniors sur des tâches qui ne demandent pas leur expertise.",
    ],
    useCases: [
      {
        title: "Réponse aux appels d'offres et propositions commerciales",
        description:
          "Premier jet de proposition produit à partir de vos références et de vos trames. Vos équipes ajustent avant l'envoi, elles ne repartent plus de zéro.",
      },
      {
        title: "Recherche dans les livrables et missions passées",
        description:
          "Retrouvez un livrable, un chiffrage ou un argumentaire déjà produit, sans rouvrir dix dossiers clients pour le retrouver.",
      },
      {
        title: "Qualification des demandes entrantes",
        description:
          "Chaque nouvelle demande (mail, formulaire) est qualifiée et routée automatiquement vers le bon consultant, sans tri manuel.",
      },
      {
        title: "Assistant pour les questions récurrentes de suivi",
        description:
          "Les questions administratives ou de suivi de mission sont traitées à partir de votre documentation interne. Le reste remonte à l'équipe.",
      },
    ],
    compliance: {
      title: "Confidentialité client et réversibilité",
      body: "Les systèmes que nous concevons cloisonnent, dès la conception, les données de chaque client : pas de mélange entre missions. Vous restez maître de vos données et de leur réversibilité en cas de changement de prestataire. Le tout dans le cadre du RGPD et de l'AI Act.",
    },
    businessCase: {
      context:
        "Cabinet de conseil de 25 consultants, plusieurs appels d'offres à répondre chaque mois, propositions rédigées à la main à chaque fois.",
      metric: "un premier jet en minutes",
      result:
        "Premier jet de proposition commerciale produit en quelques minutes au lieu de plusieurs heures, un livrable passé retrouvé en secondes plutôt qu'en fouillant les dossiers clients.",
      label: "Exemple",
    },
    faq: [
      {
        question: "Nos données clients ne doivent jamais se mélanger entre missions, est-ce garanti ?",
        answer:
          "Oui, c'est un principe de conception, pas une option. Chaque client reste cloisonné, sans mélange entre missions.",
      },
      {
        question: "On a déjà testé ChatGPT pour nos propositions, le résultat était générique.",
        answer:
          "ChatGPT seul répond à partir de connaissances générales. Notre système est branché sur VOS références et VOS trames réelles, le résultat ressemble à ce que vous produisez déjà, en plus rapide.",
      },
      {
        question: "Combien de temps avant de voir un résultat concret ?",
        answer:
          "Vous recevez un business case chiffré avant tout engagement, avec un délai de mise en production estimé. On priorise ce qui rapporte le plus vite.",
      },
      {
        question: "On n'a pas d'équipe technique en interne pour piloter ça.",
        answer:
          "Ce n'est pas votre rôle, c'est le nôtre. On pilote de bout en bout et on documente ce qu'on livre.",
      },
      {
        question: "Si on arrête la mission avec vous, on récupère quoi ?",
        answer:
          "Vos données et ce qui a été construit restent à vous : la réversibilité est prévue dès la conception, vous ne dépendez pas de nous pour continuer à les utiliser.",
      },
    ],
    relatedCasUsage: ["reponse-appels-offres", "recherche-interne", "qualification-leads"],
  },
  {
    slug: "assurance-mutuelle",
    name: "Assurance et mutuelle",
    metaTitle: "IA pour assurance et mutuelle : usages et ROI | Coucou IA",
    metaDescription:
      "IA pour assurance et mutuelle : pré-instruction des sinistres, réponses aux adhérents. ROI chiffré avant engagement. Diagnostic gratuit.",
    h1: "IA pour l'assurance et la mutuelle : des sinistres traités plus vite",
    intro:
      "Entre les dossiers sinistres qui s'accumulent et les adhérents qui posent toujours les mêmes questions sur leurs garanties, vos gestionnaires passent plus de temps à chercher l'information qu'à traiter le dossier.",
    painPoints: [
      "Le traitement des sinistres s'accumule : chaque dossier demande de collecter les pièces, vérifier les garanties et rédiger une réponse, dossier par dossier.",
      "Les adhérents posent les mêmes questions sur leurs garanties et remboursements, et elles saturent les lignes du service relation adhérents.",
      "Les documents contractuels (conditions générales, avenants) sont dispersés : retrouver la bonne clause pour un cas précis prend du temps à chaque dossier.",
    ],
    useCases: [
      {
        title: "Pré-instruction des dossiers sinistres",
        description:
          "L'IA lit les pièces reçues, vérifie leur complétude et prépare une synthèse du dossier. Le gestionnaire valide et décide, il ne part plus d'une pile de documents.",
      },
      {
        title: "Assistant pour les questions adhérents sur les garanties",
        description:
          "Les questions récurrentes sur les remboursements et garanties sont traitées à partir de vos contrats. Les cas particuliers remontent à un conseiller.",
      },
      {
        title: "Recherche dans les conditions générales et contrats",
        description:
          "Retrouvez la clause applicable à un cas précis en langage courant, sans relire tout le contrat à chaque fois.",
      },
      {
        title: "Détection des dossiers à traiter en priorité",
        description:
          "Les dossiers incomplets ou à risque de délai dépassé sont repérés automatiquement, avant qu'ils ne deviennent une réclamation.",
      },
    ],
    compliance: {
      title: "ACPR et Solvabilité II",
      body: "Les systèmes que nous concevons sont conçus pour respecter, dès la conception, les exigences de gouvernance de l'ACPR et de la directive Solvabilité II. La décision finale sur un dossier reste toujours entre les mains de votre gestionnaire : l'IA prépare, elle ne décide pas. Le tout dans le cadre du RGPD et de l'AI Act.",
    },
    businessCase: {
      context:
        "Mutuelle régionale, plusieurs dizaines de milliers d'adhérents, équipe de gestionnaires sinistres submergée en période de pointe.",
      metric: "de 1 h à quelques minutes",
      result:
        "Synthèse de dossier sinistre prête en quelques minutes au lieu d'une heure de dépouillement, jusqu'à la moitié des questions adhérents de premier niveau traitées sans intervention.",
      label: "Exemple",
    },
    faq: [
      {
        question: "Une IA peut-elle intervenir sur des dossiers sinistres sans risque réglementaire ?",
        answer:
          "Le système est conçu pour respecter les exigences de l'ACPR et de Solvabilité II. Il prépare le dossier, il ne le décide pas : la décision reste entièrement entre les mains de votre gestionnaire.",
      },
      {
        question: "Nos données adhérents sont sensibles, comment sont-elles protégées ?",
        answer:
          "Elles restent sous votre contrôle, avec un hébergement adapté et dans le respect du RGPD. La souveraineté des données est un point de départ, pas une option.",
      },
      {
        question: "On a déjà testé un chatbot, les adhérents n'étaient pas satisfaits.",
        answer:
          "Un chatbot générique répond à côté parce qu'il ne connaît pas vos contrats. Notre système est branché sur vos garanties et vos process réels, et les cas complexes remontent toujours à un conseiller.",
      },
      {
        question: "Quel est le retour sur investissement avant d'engager le projet ?",
        answer:
          "Vous recevez un business case chiffré avant tout engagement : volumétrie de dossiers, gain estimé, coût. Vous décidez sur des chiffres.",
      },
      {
        question: "Ça s'intègre à notre système de gestion existant ?",
        answer:
          "Oui, le système s'intègre à vos outils existants, il ne les remplace pas. Le diagnostic identifie où l'IA se branche dans votre process actuel.",
      },
    ],
    relatedCasUsage: ["traitement-documents", "assistant-support-client", "recherche-interne"],
  },
  {
    slug: "sante-medico-social",
    name: "Santé et médico-social",
    metaTitle: "IA pour santé et médico-social : usages et ROI | Coucou IA",
    metaDescription:
      "IA pour la santé et le médico-social : transmissions, dossiers patients, questions familles. ROI chiffré avant engagement. Diagnostic gratuit.",
    h1: "IA pour la santé et le médico-social : moins de paperasse, plus de soin",
    intro:
      "Entre les transmissions à rédiger, les dossiers patients à retrouver et les questions des familles qui reviennent sans cesse, vos équipes soignantes passent du temps sur l'administratif qui devrait revenir au soin.",
    painPoints: [
      "Les dossiers patients ou résidents s'accumulent : comptes rendus, transmissions, admissions, chaque étape redemande une saisie manuelle.",
      "Les informations réparties entre soignants et entre équipes rendent difficile de retrouver rapidement l'historique d'un patient ou d'un résident.",
      "Les familles et partenaires posent des questions récurrentes sur l'admission, le suivi ou les démarches administratives, ce qui mobilise des soignants sur des tâches non soignantes.",
    ],
    useCases: [
      {
        title: "Rédaction assistée des comptes rendus et transmissions",
        description:
          "L'IA prépare un premier jet de compte rendu ou de transmission à partir des notes de l'équipe. Le soignant valide et signe, il ne rédige plus de zéro.",
      },
      {
        title: "Recherche dans le dossier patient ou résident",
        description:
          "Retrouvez un antécédent, un traitement ou une transmission dans l'historique, en langage courant, sans rouvrir tout le dossier.",
      },
      {
        title: "Assistant pour les questions des familles et partenaires",
        description:
          "Les questions récurrentes sur l'admission, le suivi ou les démarches sont traitées à partir de vos process. Tout ce qui demande un avis médical remonte à l'équipe.",
      },
      {
        title: "Préparation des dossiers d'admission",
        description:
          "Les pièces d'un dossier d'admission sont rassemblées et vérifiées automatiquement avant transmission à l'équipe soignante.",
      },
    ],
    compliance: {
      title: "Données de santé et hébergement HDS",
      body: "Les systèmes que nous concevons sont pensés, dès la conception, pour un hébergement conforme aux exigences applicables aux données de santé (HDS). L'IA prépare et assiste, elle ne pose jamais de diagnostic ni ne prend de décision médicale : cela reste entièrement entre les mains des soignants. Le tout dans le cadre du RGPD et de l'AI Act.",
    },
    businessCase: {
      context:
        "Structure médico-sociale de plusieurs dizaines de résidents, transmissions et comptes rendus rédigés à la main chaque jour.",
      metric: "un compte rendu en minutes",
      result:
        "Premier jet de compte rendu ou de transmission rédigé en quelques minutes, temps de recherche dans le dossier patient divisé par deux.",
      label: "Exemple",
    },
    faq: [
      {
        question: "Une IA peut-elle intervenir sur des données de santé sans risque ?",
        answer:
          "Le système est pensé dès la conception pour un hébergement conforme aux exigences des données de santé, et dans le respect du RGPD et de l'AI Act. Les décisions médicales restent entièrement entre les mains des soignants.",
      },
      {
        question: "Nos données patients ne peuvent pas sortir de l'établissement, est-ce compatible ?",
        answer:
          "Oui. Les systèmes sont conçus pour garder vos données sous votre contrôle, avec un hébergement adapté à cette exigence.",
      },
      {
        question: "On a peur qu'un outil générique remplace le jugement clinique.",
        answer:
          "Ce n'est pas son rôle. L'IA prépare un premier jet ou une synthèse, chaque sortie est validée par un soignant. La décision clinique reste humaine, du début à la fin.",
      },
      {
        question: "Combien de temps avant un résultat concret pour nos équipes ?",
        answer:
          "Vous recevez un business case chiffré avant tout engagement, avec un périmètre et un délai de mise en production estimés.",
      },
      {
        question: "On a déjà testé un outil qui n'a jamais dépassé le stade du test.",
        answer:
          "C'est justement pour ça qu'on existe. On ne livre pas un prototype de démonstration, on livre un système en production, utilisé au quotidien et mesuré sur ses résultats.",
      },
    ],
    relatedCasUsage: ["traitement-documents", "recherche-interne", "assistant-support-client"],
  },
];

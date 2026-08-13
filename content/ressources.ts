// « La carte des possibles » (/ressources/[slug]) : une page par secteur de
// tête de pont, publique et indexée. La carte EST la page : aucun gating email
// (le formulaire en fin de page est un opt-in, pas une barrière).
// Chiffres = ordres de grandeur étiquetés « illustration », jamais des références clients.

import { contactEmail } from "@/content/site";

export type CarteUseCase = {
  title: string;
  // Le problème en langage métier, avec les chiffres et les outils du secteur.
  problem: string;
  // Ce que l'IA sait faire aujourd'hui sur ce problème, concrètement.
  solution: string;
  // Les systèmes réels sur lesquels le cas se branche (rendu après le libellé
  // ressourcesShared.branchementLabel) : outils métier nommés, canaux, données.
  branchement: string;
  // Chiffre court pour l'affichage métrique (ex. "24 h", "< 5 min").
  // Ordre de grandeur, jamais un résultat client : la règle est posée une fois
  // par page dans le bloc de lecture (ressourcesShared.chiffres*).
  metric: string;
  // Ce que le chiffre mesure, une ligne.
  metricLabel: string;
  // Mini-grille d'auto-évaluation : volumétrie, données disponibles, douleur.
  questions: [string, string, string];
  // Position sur la matrice de synthèse.
  impact: 1 | 2 | 3;
  faisabilite: 1 | 2 | 3;
};

export type RessourcePage = {
  // Ex. "carte-immobilier".
  slug: string;
  // Slug de la page secteur correspondante (maillage croisé).
  secteurSlug: string;
  // Nom court pour les liens et le breadcrumb.
  name: string;
  // Une ligne pour les cartes du hub /ressources.
  pitch: string;
  // ≤ 60 caractères.
  metaTitle: string;
  // ~150 caractères.
  metaDescription: string;
  h1: string;
  // Le constat d'ouverture, sous le H1.
  lede: string;
  // Les deux axes de lecture, dans le vocabulaire du secteur.
  axes: { impact: string; faisabilite: string };
  // 5 cas d'usage, ordonnés du plus rentable au plus simple.
  useCases: CarteUseCase[];
  // « Par où commencer » : le chemin recommandé, qui référence les cas par numéro.
  verdict: string;
  compliance: { title: string; body: string };
  // Corps du closing (le titre vient de ressourcesShared.closingTitle).
  closing: string;
  // Liste nurture Brevo du secteur : l'opt-in envoie la carte par email,
  // les conseils d'application suivent (.agents/nurture.md).
  brevoListId: number;
};

// Copie transverse des gabarits ressources (même rôle que spokes.ts pour les spokes).
export const ressourcesShared = {
  heroMetaClassement: "classés impact × faisabilité",
  heroMetaAccess: "en accès libre",
  // Lecture de la carte.
  axesTitle: "Comment lire cette carte",
  axisImpact: "Impact",
  axisFaisabilite: "Faisabilité",
  enProductionTitle: "En production",
  enProductionBody:
    "Un système qui tourne pour de vrai chez vous, utilisé par l'équipe chaque semaine.",
  chiffresTitle: "Les chiffres",
  chiffresBody:
    "Des ordres de grandeur réalistes pour situer le gain. Ce ne sont pas des résultats mesurés chez un client : votre business case chiffré les remplace au point de départ.",
  // Cas d'usage.
  branchementLabel: "Se branche sur",
  questionsTitle: "Est-ce chez vous ?",
  // Signal court sous un chiffre isolé de son contexte (grille interactive).
  illustrationLabel: "Ordre de grandeur",
  // Matrice de synthèse.
  matrixTitle: "La carte de synthèse",
  quadrantTopRight: "Commencez ici",
  quadrantTopLeft: "À préparer",
  quadrantBottomRight: "Gains rapides",
  quadrantBottomLeft: "Peut attendre",
  // Verdict.
  verdictTitle: "Par où commencer",
  // Opt-in email (en fin de carte, jamais une barrière).
  emailTitle: "La carte dans votre boîte mail",
  emailBody:
    "Recevez cette carte par email pour la garder sous la main, puis trois conseils d'application, un par semaine. Rien d'autre ensuite.",
  formEmailLabel: "Votre email professionnel",
  formEmailPlaceholder: "prenom@entreprise.fr",
  formSubmitLabel: "Recevoir la carte",
  formPrivacyNote: "Pas de spam. Un email, la carte, trois conseils, c'est tout.",
  formErrorInvalid: "Cette adresse email ne semble pas valide.",
  formErrorServer: `Une erreur est survenue. Réessayez, ou écrivez-nous : ${contactEmail}.`,
  successTitle: "C'est tout bon.",
  successBody: "La carte arrive dans votre boîte mail.",
  // Closing.
  closingTitle: "Cette carte est générique. La vôtre ne l'est pas.",
  // Bloc content upgrade en bas des pages secteurs.
  upgradeTitle: "Emportez la carte",
  upgradeBody:
    "Les cas d'usage de votre métier, classés par impact et faisabilité, avec une grille pour évaluer chacun chez vous. En accès libre.",
  upgradeCta: "Découvrir la carte des possibles",
  // Repli des secteurs sans carte : le kit de démarrage, valable pour tous.
  upgradeKitTitle: "Commencez par le kit de démarrage",
  upgradeKitBody:
    "Une dizaine de questions pour cadrer votre premier outil IA : les étapes dans l'ordre, les coûts réels et les pièges à éviter.",
  upgradeKitCta: "Ouvrir le kit de démarrage",
} as const;

// Copie du hub /ressources.
export const ressourcesHub = {
  metaTitle: "Les cartes des possibles : l’IA par métier | Coucou IA",
  metaDescription:
    "Les cas d’usage IA de votre métier, classés par impact et faisabilité, avec une grille pour évaluer chacun chez vous. Une carte par secteur, en accès libre.",
  h1: "Les cartes des possibles",
  intro:
    "Une carte par métier : les cas d’usage IA qui comptent chez vous, classés par impact et par faisabilité, en accès libre. Pour savoir quoi lancer en premier.",
};

// Ordre = ordre de mise en avant (hub /ressources, sortie douce du CTA,
// grille interactive) : les niches Côte d'Azur d'abord, les secteurs
// historiques (expertise comptable, industrie) ensuite.
export const ressources: RessourcePage[] = [
  {
    slug: "carte-immobilier",
    secteurSlug: "immobilier",
    name: "Immobilier",
    pitch:
      "Leads portails rappelés en cinq minutes, estimations relancées, annonces contrôlées : la carte d’une agence.",
    metaTitle: "IA en agence immobilière : 5 cas d’usage classés | Coucou IA",
    metaDescription:
      "Leads SeLoger rappelés en 5 minutes, relances d’estimation, annonces contrôlées : 5 cas d’usage IA pour agence immobilière, classés par impact et faisabilité.",
    h1: "IA pour agence immobilière : la carte des possibles",
    lede: "Coucou. Un lead SeLoger rappelé le lendemain est un lead perdu : il a recontacté l’agence d’en face. Cette carte pose à plat les cinq cas d’usage IA d’une agence immobilière, du plus rentable au plus simple à mettre en production, avec pour chacun l’ordre de grandeur du gain et trois questions pour savoir si c’est chez vous.",
    axes: {
      impact:
        "Ce que le cas rapporte à l’agence : des mandats signés parce que la relance est partie, des leads transformés parce que le rappel a pris cinq minutes, des heures de négociateur rendues à la vente.",
      faisabilite:
        "La facilité de mise en production chez vous : elle dépend surtout de vos données (un CRM tenu à jour ou des post-it) et de la maturité de la brique technique derrière le cas.",
    },
    useCases: [
      {
        title: "Qualifier et rappeler les leads portails en cinq minutes",
        problem:
          "Le lead SeLoger, Leboncoin ou Bien’ici arrive en mail semi-structuré dans une boîte que personne ne surveille en continu. Il est motivé au moment où il clique ; le lendemain, il a déjà recontacté deux confrères. Chaque heure de silence fait fondre la probabilité du rendez-vous.",
        solution:
          "L’IA lit chaque mail portail à l’arrivée, crée ou complète la fiche dans votre logiciel, et engage la conversation dans les minutes qui suivent : projet, budget, financement en cours, délai. Le négociateur reçoit une fiche qualifiée et rappelle en priorité les contacts chauds, avec tout le contexte, au lieu de dépiler une boîte mail.",
        branchement:
          "les mails SeLoger, Leboncoin et Bien’ici ; votre logiciel métier (Apimo, Hektor, Netty ou autre)",
        metric: "< 5 min",
        metricLabel: "entre l’arrivée du lead portail et la première réponse qualifiée",
        questions: [
          "Recevez-vous plus de 30 leads portails par mois ?",
          "Vos leads arrivent-ils par mail plutôt que directement dans votre logiciel ?",
          "Une partie des leads du mois dernier n’a-t-elle jamais été rappelée ?",
        ],
        impact: 3,
        faisabilite: 3,
      },
      {
        title: "Relancer chaque propriétaire estimé, jusqu’au mandat",
        problem:
          "Entre l’estimation et la mise en vente, il se passe des mois. La relance vit dans la tête du négociateur, donc elle saute à la première semaine chargée. Le propriétaire, lui, signe avec l’agence qui a redonné signe de vie au bon moment.",
        solution:
          "Après chaque estimation, l’IA déroule la séquence que vous avez validée : compte rendu à J+2, biens vendus dans le quartier à M+1, point marché à M+3, chaque message préparé à partir du dossier et des ventes réelles du secteur. Le négociateur relit, ajuste, envoie. Rien ne part sans lui, mais rien n’est oublié.",
        branchement: "votre CRM et votre agenda ; les ventes DVF du quartier pour les points marché",
        metric: "0 oubli",
        metricLabel: "chaque propriétaire estimé a sa séquence de relance, jusqu’à la décision",
        questions: [
          "Faites-vous plusieurs estimations par semaine ?",
          "Vos estimations laissent-elles une trace exploitable (CRM, agenda, compte rendu) ?",
          "Un mandat est-il déjà parti chez un confrère faute de relance au bon moment ?",
        ],
        impact: 3,
        faisabilite: 2,
      },
      {
        title: "Rédiger et contrôler les annonces avant diffusion",
        problem:
          "Une annonce se rédige, puis se vérifie : DPE et fourchette de dépenses d’énergie, honoraires et leur répartition, nombre de lots et charges en copropriété. Puis tout se ressaisit pour la diffusion. Une heure par bien, et une amende possible à la moindre mention oubliée.",
        solution:
          "À partir de la fiche du bien et des photos, l’IA rédige l’annonce dans le ton de l’agence et passe la liste des mentions obligatoires. Le négociateur relit, la diffusion part vers les portails via votre passerelle habituelle. Dix minutes, zéro mention manquante.",
        branchement:
          "la fiche du bien dans votre logiciel ; votre passerelle de diffusion (Ubiflow ou autre)",
        metric: "10 min",
        metricLabel: "de la fiche du bien à l’annonce rédigée et contrôlée, prête à diffuser",
        questions: [
          "Publiez-vous plusieurs annonces par semaine ?",
          "Les caractéristiques de vos biens sont-elles saisies dans votre logiciel ?",
          "La conformité des mentions repose-t-elle sur la vigilance de chacun ?",
        ],
        impact: 2,
        faisabilite: 3,
      },
      {
        title: "Dicter les comptes rendus de visite, tenir le CRM",
        problem:
          "Après trois visites, les impressions des acquéreurs restent dans la voiture. Le CRM se remplit « plus tard », c’est-à-dire jamais, et le vendeur attend un retour qui n’arrive pas. À la relance suivante, personne ne sait ce qui a bloqué : le prix, la cuisine ou l’exposition.",
        solution:
          "Le négociateur dicte trente secondes en sortant de l’immeuble. L’IA structure : bien, acquéreur, ressenti, objections, suite à donner. Elle met la fiche à jour et prépare le retour au vendeur. Le vendredi, chaque vendeur a reçu son point de la semaine.",
        branchement: "une note vocale sur le téléphone du négociateur ; votre CRM",
        metric: "le soir même",
        metricLabel: "CRM à jour et retour au vendeur envoyé, sans clavier",
        questions: [
          "Vos négociateurs enchaînent-ils plusieurs visites par jour ?",
          "Un CRM ou logiciel métier est-il en place et censé être tenu ?",
          "Des vendeurs se plaignent-ils de manquer de nouvelles après les visites ?",
        ],
        impact: 2,
        faisabilite: 2,
      },
      {
        title: "Préparer le dossier d’estimation avec les ventes réelles",
        problem:
          "Un rendez-vous d’estimation se gagne sur la crédibilité du prix. Rassembler les ventes comparables, l’historique du bien et la tension du micro-marché prend une demi-journée quand on la trouve ; le propriétaire, lui, arrive avec trois estimations en ligne contradictoires.",
        solution:
          "L’IA monte le dossier avant chaque rendez-vous : ventes réelles comparables (surface, époque, étage), délais de vente constatés dans le quartier, positionnement du prix. Le négociateur arrive avec des faits.",
        branchement:
          "les données DVF publiques, votre historique de ventes et les annonces actives du secteur",
        metric: "20 min",
        metricLabel: "de préparation par estimation, au lieu d’une demi-journée de recherches",
        questions: [
          "Vos rendez-vous d’estimation se préparent-ils à la main, quand il y a le temps ?",
          "Votre historique de ventes est-il conservé quelque part ?",
          "Des mandats se jouent-ils sur la solidité du prix annoncé ?",
        ],
        impact: 1,
        faisabilite: 3,
      },
    ],
    verdict:
      "Le cas 1 d’abord : c’est le croisement le plus favorable de la carte, et il se voit dès la première semaine sur le tableau des rappels. Si votre volume de leads est modeste mais que vous estimez beaucoup, inversez : le cas 2 protège vos mandats, là où l’agence gagne vraiment sa vie. Les cas 3 et 5 sont des gains rapides à empiler ensuite ; le cas 4 vient en dernier, parce qu’il demande un petit changement d’habitude de l’équipe en plus de la technique.",
    compliance: {
      title: "Loi Hoguet, TRACFIN et données clients",
      body: "Chaque système est conçu dès le départ pour s’inscrire dans le cadre de la loi Hoguet et de vos obligations de vigilance TRACFIN : l’IA prépare, le professionnel titulaire de la carte décide et signe. Les données de vos acquéreurs et vendeurs restent sous votre contrôle : hébergement adapté, aucune donnée envoyée à un modèle public sans votre accord. Le tout dans le cadre du RGPD et de l’AI Act.",
    },
    closing:
      "Cette carte vaut pour une agence type. La vôtre a son secteur, son logiciel, ses négociateurs. Ce premier échange gratuit, c’est 30 min pour poser votre carte à vous : je vous dis franchement où l’IA rapporte dans votre agence, et où elle ne sert à rien. Sans jargon, sans engagement.",
    brevoListId: 8, // Liste Brevo "Nurture carte immobilier", à créer dans Brevo
  },
  {
    slug: "carte-location-saisonniere",
    secteurSlug: "location-saisonniere",
    name: "Location saisonnière",
    pitch:
      "Messages voyageurs, ménages, avis, litiges, déclarations : la carte d’une conciergerie.",
    metaTitle: "IA location saisonnière : 5 cas d’usage classés | Coucou IA",
    metaDescription:
      "Messages voyageurs en 5 minutes, ménages confirmés, litiges caution, taxe de séjour : 5 cas d’usage IA pour conciergerie, classés par impact et faisabilité.",
    h1: "IA pour conciergerie et location saisonnière : la carte des possibles",
    lede: "Coucou. À 23 h un samedi de juillet, un voyageur demande le code du portail en italien pendant qu’un autre réclame sa caution. Cette carte pose à plat les cinq cas d’usage IA d’une conciergerie, du plus rentable au plus simple à mettre en production, avec pour chacun l’ordre de grandeur du gain et trois questions pour savoir si c’est chez vous.",
    axes: {
      impact:
        "Ce que le cas rapporte : un taux de réponse qui protège votre classement et vos réservations, des rotations sans raté, des soirées rendues à l’équipe.",
      faisabilite:
        "La facilité de mise en production : elle dépend surtout de votre outillage actuel (un channel manager tenu, ou trois calendriers et des SMS) et de la maturité de la brique technique.",
    },
    useCases: [
      {
        title: "Répondre aux voyageurs en quelques minutes, dans leur langue",
        problem:
          "Airbnb classe les annonces aussi sur la réactivité : le statut Superhôte exige un taux de réponse d’au moins 90 % sous 24 h, et une demande sans réponse rapide part chez le voisin. Les messages tombent à toute heure, en quatre langues, sur trois plateformes, et c’est toujours votre téléphone qui vibre.",
        solution:
          "L’IA répond immédiatement aux questions dont la réponse existe (code d’accès, parking, check-out, wifi), dans la langue du voyageur, à partir du livret du logement. Litige, caution, réclamation, geste commercial : elle prépare, vous validez avant envoi. Vous gardez le ton, elle tient la permanence.",
        branchement:
          "votre channel manager (Smoobu, Beds24, Hospitable ou autre) et les messageries Airbnb et Booking",
        metric: "< 5 min",
        metricLabel: "de première réponse, 24 h/24, dans la langue du voyageur",
        questions: [
          "Gérez-vous plus de 10 logements, ou un flux de messages quotidien ?",
          "Les infos de chaque logement sont-elles écrites (livret, annonce, réponses types) ?",
          "Les messages du soir et du week-end pèsent-ils sur vous ou sur l’équipe ?",
        ],
        impact: 3,
        faisabilite: 3,
      },
      {
        title: "Fiabiliser les rotations ménage entre deux séjours",
        problem:
          "Tout se joue dans la fenêtre entre un check-out à 10 h et un check-in à 16 h : ménage, linge, contrôle. La coordination tient par SMS, et l’annulation de dernière minute ou l’intervenante malade se découvre quand le voyageur est déjà devant la porte.",
        solution:
          "Chaque réservation, modification ou annulation recalcule le planning et prévient les intervenants sur leur téléphone, avec le créneau et la checklist du logement. Une intervention non confirmée la veille remonte en alerte. Le jour même, vous savez ce qui est prêt, logement par logement.",
        branchement: "le calendrier de votre channel manager ; WhatsApp ou SMS côté intervenants",
        metric: "J-1",
        metricLabel: "tout ménage non confirmé la veille remonte en alerte, avant le check-in",
        questions: [
          "Enchaînez-vous plusieurs rotations le même jour en saison ?",
          "Vos réservations vivent-elles dans un channel manager ?",
          "Un voyageur est-il déjà arrivé dans un logement pas prêt ?",
        ],
        impact: 3,
        faisabilite: 2,
      },
      {
        title: "Solliciter les avis et y répondre, sans exception",
        problem:
          "Le classement se construit sur le volume et la fraîcheur des avis, et sur vos réponses. Solliciter chaque voyageur au bon moment après le départ, puis répondre à chaque avis dans sa langue, est exactement le genre de discipline qui casse en août, au moment où elle rapporte le plus.",
        solution:
          "Après chaque départ, le message de sollicitation part au moment que vous avez choisi. Chaque avis publié reçoit un projet de réponse dans sa langue, fidèle à votre ton, à valider en un geste. La mécanique tourne toute l’année, haute saison comprise.",
        branchement: "les messageries des plateformes, déclenché par chaque check-out",
        metric: "100 %",
        metricLabel: "des séjours sollicités et des avis répondus, même en août",
        questions: [
          "Vos logements génèrent-ils plusieurs avis par mois ?",
          "L’historique des séjours est-il accessible dans vos plateformes ?",
          "Des avis restent-ils sans réponse quand la saison bat son plein ?",
        ],
        impact: 2,
        faisabilite: 3,
      },
      {
        title: "Monter les dossiers de litige et de caution",
        problem:
          "Une retenue sur caution se joue sur le dossier : Airbnb demande la réclamation dans les 14 jours suivant le départ, photos et échanges à l’appui. Tout existe, mais éparpillé entre les téléphones, les messageries et les états des lieux, et la soirée qu’il faudrait pour l’assembler n’existe pas.",
        solution:
          "L’IA assemble la chronologie du séjour : état des lieux d’entrée et de sortie horodatés, messages échangés, dégâts constatés, montants. Vous décidez de la suite et signez le message ; le dossier, lui, est déjà monté et dans les délais.",
        branchement: "vos photos d’état des lieux horodatées et l’historique des messages du séjour",
        metric: "20 min",
        metricLabel: "pour un dossier de réclamation complet, au lieu d’une soirée perdue",
        questions: [
          "Traitez-vous plusieurs litiges ou retenues par saison ?",
          "Photos d’état des lieux et échanges sont-ils conservés numériquement ?",
          "Avez-vous déjà laissé filer une retenue faute de temps pour monter le dossier ?",
        ],
        impact: 2,
        faisabilite: 2,
      },
      {
        title: "Consolider taxe de séjour et récapitulatif DAC7",
        problem:
          "La taxe de séjour se déclare commune par commune, avec des taux qui varient selon le classement du meublé ; les plateformes n'en collectent qu'une partie. Ajoutez le récapitulatif annuel DAC7 et les revenus par plateforme : une journée de tableur, propriétaire par propriétaire.",
        solution:
          "L’IA consolide nuitées, revenus et taxes déjà collectées depuis vos plateformes et votre channel manager, par logement et par commune. Vous vérifiez et déclarez ; le rapport propriétaire tombe dans la foulée.",
        branchement: "les exports de vos plateformes et de votre channel manager",
        metric: "2 h",
        metricLabel: "pour boucler taxe de séjour et récap DAC7, toutes plateformes confondues",
        questions: [
          "Louez-vous sur plusieurs plateformes et plusieurs communes ?",
          "Vos revenus et nuitées sont-ils exportables depuis vos outils ?",
          "Les déclarations vous coûtent-elles une journée ou plus à chaque échéance ?",
        ],
        impact: 1,
        faisabilite: 3,
      },
    ],
    verdict:
      "Le cas 1 d’abord, sans hésiter : c’est lui qui protège le classement, donc les réservations, et votre channel manager fournit déjà tout ce qu’il faut. Le cas 2 suit dès que le volume de rotations dépasse ce qu’un cerveau tient de tête. Le cas 3 est le gain rapide à activer dans la foulée ; les cas 4 et 5 se déclenchent à la première saison pleine, quand litiges et déclarations commencent à coûter de vraies soirées.",
    compliance: {
      title: "Taxe de séjour, DAC7 et données voyageurs",
      body: "Louer en saisonnier crée des obligations : taxe de séjour à collecter et déclarer, revenus transmis à l’administration au titre de DAC7, données voyageurs à protéger. Chaque système est conçu pour vous aider à tenir ces obligations sans y passer vos soirées : vos données restent sous votre contrôle, dans le cadre du RGPD et de l’AI Act.",
    },
    closing:
      "Cette carte vaut pour une conciergerie type. La vôtre a ses logements, ses plateformes, ses intervenants. Ce premier échange gratuit, c’est 30 min pour poser votre carte à vous : je vous dis franchement où l’IA rapporte dans votre activité, et où elle ne sert à rien. Sans jargon, sans engagement.",
    brevoListId: 9, // Liste Brevo "Nurture carte location saisonnière", à créer dans Brevo
  },
  {
    slug: "carte-hotellerie",
    secteurSlug: "hotellerie",
    name: "Hôtellerie",
    pitch:
      "Réservations directes, devis groupes, avis, questions multilingues : la carte d’un hôtel indépendant.",
    metaTitle: "IA hôtel indépendant : 5 cas d’usage classés | Coucou IA",
    metaDescription:
      "Réservations directes, devis groupes dans l’heure, avis multilingues : 5 cas d’usage IA pour hôtel indépendant, classés par impact et par faisabilité.",
    h1: "IA pour hôtel indépendant : la carte des possibles",
    lede: "Coucou. Chaque réservation qui part sur une plateforme vous coûte 15 à 25 % de commission, souvent parce qu’un mail a attendu jusqu’au soir. Cette carte pose à plat les cinq cas d’usage IA d’un hôtel indépendant, du plus rentable au plus simple à mettre en production, avec pour chacun l’ordre de grandeur du gain et trois questions pour savoir si c’est chez vous.",
    axes: {
      impact:
        "Ce que le cas rapporte : des commissions économisées parce que le direct répond vite, des devis groupes qui partent avant ceux des concurrents, du temps de réception rendu aux clients présents.",
      faisabilite:
        "La facilité de mise en production : elle dépend surtout de vos données (grille tarifaire posée, PMS accessible) et de la maturité de la brique technique.",
    },
    useCases: [
      {
        title: "Répondre aux demandes directes avant les plateformes",
        problem:
          "Le client qui écrit par mail ou par le formulaire du site vous tend une réservation sans commission. Si la réponse attend la fin du rush du check-out, il a réservé le même séjour sur Booking, et l’hôtel paie 15 à 25 % pour un client qui était déjà venu frapper à sa porte.",
        solution:
          "Chaque demande directe reçoit en quelques minutes une réponse avec disponibilités, tarif direct et lien de réservation, dans la langue du client. Les demandes particulières remontent à la réception avec le contexte. Le direct redevient le canal le plus rapide, donc le canal choisi.",
        branchement:
          "votre boîte mail, le formulaire du site et votre PMS (Mews, Thais, Misterbooking ou autre)",
        metric: "15-25 %",
        metricLabel: "de commission économisée sur chaque réservation ramenée en direct",
        questions: [
          "Recevez-vous chaque semaine des demandes par mail ou formulaire ?",
          "Vos disponibilités et tarifs sont-ils lisibles depuis votre PMS ?",
          "Des clients réservent-ils en plateforme après vous avoir écrit sans réponse rapide ?",
        ],
        impact: 3,
        faisabilite: 3,
      },
      {
        title: "Chiffrer les groupes et séminaires dans l’heure",
        problem:
          "Un organisateur de séminaire écrit à quatre établissements et signe avec le premier devis sérieux. Chez vous, le chiffrage attend un creux : chambres, salle, restauration, options, une heure de calcul que la réception n’a pas entre deux arrivées. Le devis part à 48 h, souvent trop tard.",
        solution:
          "L’IA assemble le devis depuis votre grille : disponibilités des chambres et de la salle, forfaits restauration, conditions groupes. La réception vérifie, personnalise deux lignes et envoie. L’organisateur a votre proposition pendant que les autres font encore leurs comptes.",
        branchement: "votre grille tarifaire groupes, le planning des salles et le PMS",
        metric: "1 h",
        metricLabel: "entre la demande séminaire et le devis envoyé, au lieu de 48 h",
        questions: [
          "Recevez-vous plusieurs demandes groupes ou séminaires par mois ?",
          "Votre grille tarifaire groupes est-elle posée quelque part ?",
          "Avez-vous perdu des dossiers au bénéfice d’un devis plus rapide ?",
        ],
        impact: 3,
        faisabilite: 2,
      },
      {
        title: "Répondre à chaque avis, dans sa langue",
        problem:
          "L’avis Google ou Booking sans réponse se lit comme un aveu, et le futur client lit d’abord les avis négatifs. En saison, répondre en quatre langues avec le ton juste passe après tout le reste, et le retard s’accumule précisément quand les avis affluent.",
        solution:
          "Chaque nouvel avis reçoit un projet de réponse dans sa langue, calé sur vos réponses passées : remerciement sincère, réponse au point soulevé, signature de la maison. Vous validez en un geste, l’ardoise reste à zéro toute l’année.",
        branchement: "Google, Booking et TripAdvisor, avec vos réponses passées comme modèle de ton",
        metric: "48 h",
        metricLabel: "de délai maximal de réponse à un avis, toutes langues confondues",
        questions: [
          "Recevez-vous plusieurs avis par semaine, toutes plateformes confondues ?",
          "Votre ton de réponse existe-t-il déjà (réponses passées à imiter) ?",
          "Des avis restent-ils sans réponse quand l’hôtel est plein ?",
        ],
        impact: 2,
        faisabilite: 3,
      },
      {
        title: "Traiter les questions récurrentes en quatre langues",
        problem:
          "Parking, horaires du petit déjeuner, animaux, plage la plus proche : la clientèle internationale pose trente fois par jour des questions dont la réponse n’a pas changé depuis des années. Chaque interruption coupe la réception au détriment du client qui est physiquement là.",
        solution:
          "Un assistant répond immédiatement, dans la langue du client, à partir des informations réelles de l’établissement, avant et pendant le séjour. Ce qui sort du cadre remonte à la réception, avec la conversation déjà engagée.",
        branchement: "les informations de l’établissement : livret d’accueil, site, consignes internes",
        metric: "8/10",
        metricLabel: "questions récurrentes traitées sans mobiliser la réception, ordre de grandeur",
        questions: [
          "La réception répond-elle chaque jour aux mêmes questions ?",
          "Les informations pratiques sont-elles écrites et à jour quelque part ?",
          "Ces interruptions dégradent-elles l’accueil des clients présents ?",
        ],
        impact: 2,
        faisabilite: 2,
      },
      {
        title: "Relancer les devis groupes restés sans réponse",
        problem:
          "Le devis envoyé entre dans un silence : l’organisateur compare, repousse, oublie. Personne à la réception n’a un pipeline de relance en tête, et l’affaire meurt sans qu’on sache si c’était le prix, la date ou juste l’oubli.",
        solution:
          "Chaque devis envoyé est suivi : relance courtoise à J+4, seconde à J+10 si silence, avec un angle différent (la salle, l’accès, une option). Dès que l’organisateur répond, la réception reprend la main. Des affaires meurent encore, mais plus jamais en silence.",
        branchement: "le suivi de vos devis envoyés, dans votre outil actuel ou un simple tableur partagé",
        metric: "J+4",
        metricLabel: "première relance de chaque devis groupe resté sans réponse",
        questions: [
          "Envoyez-vous plusieurs devis groupes par mois ?",
          "Vos devis envoyés laissent-ils une trace consultable ?",
          "Savez-vous combien d’affaires sont mortes en silence l’an dernier ?",
        ],
        impact: 1,
        faisabilite: 3,
      },
    ],
    verdict:
      "Le cas 1 d’abord : chaque semaine sans lui se paie en commissions, et votre PMS a déjà tout ce qu’il faut. Si votre salle de séminaire est un vrai centre de profit, le cas 2 passe devant, avec le cas 5 dans la foulée : chiffrer vite puis relancer, c’est le même muscle. Les cas 3 et 4 lissent la charge de la réception ; activez-les avant la haute saison plutôt qu’en plein milieu.",
    compliance: {
      title: "Données clients et RGPD",
      body: "Un hôtel manipule des données personnelles précieuses : identités, coordonnées, habitudes de séjour. Chaque système est conçu pour garder ces données sous votre contrôle, avec un hébergement adapté, dans le cadre du RGPD et de l’AI Act. L’IA prépare les réponses, votre équipe garde la main sur la relation client.",
    },
    closing:
      "Cette carte vaut pour un hôtel indépendant type. Le vôtre a ses chambres, ses saisons, sa clientèle. Ce premier échange gratuit, c’est 30 min pour poser votre carte à vous : je vous dis franchement où l’IA rapporte dans votre établissement, et où elle ne sert à rien. Sans jargon, sans engagement.",
    brevoListId: 10, // Liste Brevo "Nurture carte hôtellerie", à créer dans Brevo
  },
  {
    slug: "carte-artisans-batiment",
    secteurSlug: "artisans-batiment",
    name: "Artisans du bâtiment",
    pitch:
      "Le devis en 24 h, les relances qui partent seules, le SAV trié : la carte d’une entreprise du bâtiment.",
    metaTitle: "IA artisan du bâtiment : 5 cas d’usage classés | Coucou IA",
    metaDescription:
      "Le devis en 24 h après la visite, relances qui partent seules, SAV trié, photos classées : 5 cas d’usage IA pour artisans, classés par impact et faisabilité.",
    h1: "IA pour artisans du bâtiment : la carte des possibles",
    lede: "Coucou. Le devis qui se rédige le jeudi soir pour une visite de lundi est un devis que le client a parfois déjà signé ailleurs. Cette carte pose à plat les cinq cas d’usage IA d’une entreprise du bâtiment, du plus rentable au plus simple à mettre en production, avec pour chacun l’ordre de grandeur du gain et trois questions pour savoir si c’est chez vous.",
    axes: {
      impact:
        "Ce que le cas rapporte : des devis signés parce qu’ils sont partis les premiers, de la trésorerie parce que les relances partent, des soirées rendues.",
      faisabilite:
        "La facilité de mise en production : elle dépend surtout de vos habitudes actuelles (un outil de devis en place, ou des devis Word) et de la maturité de la brique technique.",
    },
    useCases: [
      {
        title: "Transformer la visite en devis en 24 h",
        problem:
          "La visite est faite, les mesures sont dans un carnet, et le devis attend le soir où il restera de l’énergie. Une semaine passe ; le particulier, lui, a reçu deux autres devis. Dans le bâtiment, le premier devis sérieux cadre la discussion, et c’est rarement le vôtre.",
        solution:
          "En sortant de la visite, vous dictez : postes, surfaces, matériaux, points d’attention, photos à l’appui. L’IA structure le tout en devis dans votre outil, avec vos prix, la bonne TVA (10 % en rénovation, 5,5 % en rénovation énergétique) et les mentions attendues. Vous relisez, ajustez, envoyez le lendemain.",
        branchement:
          "vos notes vocales et photos de visite ; votre outil de devis (Obat, Batappli, EBP ou autre)",
        metric: "24 h",
        metricLabel: "de la visite au devis envoyé, au lieu d’une semaine",
        questions: [
          "Faites-vous plusieurs visites avec devis à la clé chaque semaine ?",
          "Utilisez-vous un outil de devis avec votre bibliothèque de prix ?",
          "Des chantiers se signent-ils ailleurs pendant que votre devis attend le soir ?",
        ],
        impact: 3,
        faisabilite: 2,
      },
      {
        title: "Relancer devis et factures sans y penser",
        problem:
          "Un devis sans réponse ne se relance pas : pas le temps, pas envie de paraître insistant. Une facture échue non plus. L’argent dort à deux endroits, le carnet de commandes et la trésorerie, pendant que vous êtes sur un toit.",
        solution:
          "Chaque devis est relancé au rythme que vous avez choisi, chaque facture échue aussi, avec des messages qui vous ressemblent. Vous êtes au chantier ; les relances partent quand même, et vous voyez qui a ouvert, qui a répondu.",
        branchement: "votre outil de devis et facturation, avec vos formulations à vous",
        metric: "J+7",
        metricLabel: "première relance de chaque devis, factures échues relancées de même",
        questions: [
          "Avez-vous en permanence plusieurs devis et factures en attente ?",
          "Devis et factures sortent-ils d’un outil qui trace les envois ?",
          "Les retards de paiement pèsent-ils sur votre trésorerie ?",
        ],
        impact: 3,
        faisabilite: 3,
      },
      {
        title: "Trier les demandes : l’urgence d’abord",
        problem:
          "Sur le répondeur et dans les mails se mélangent la fuite qui inonde, le portail à repeindre et le curieux qui compare. Le tri se fait le soir, et la vraie urgence, celle qui devient un gros chantier ou un client à vie, a rappelé quelqu’un d’autre à 14 h.",
        solution:
          "Chaque demande est qualifiée à l’arrivée : nature des travaux, urgence, adresse, photos demandées d’office. L’urgence vous est poussée immédiatement ; le reste attend proprement dans une file priorisée, avec une réponse d’attente déjà partie.",
        branchement: "le répondeur, les mails et le formulaire du site",
        metric: "2 min",
        metricLabel: "pour qualifier une demande : métier, urgence, adresse, photos",
        questions: [
          "Recevez-vous un flux mélangé de demandes (SAV, dépannage, chantiers) ?",
          "Ces demandes passent-elles par des canaux branchables (mail, formulaire, répondeur) ?",
          "Une vraie urgence a-t-elle déjà rappelé un concurrent avant vous ?",
        ],
        impact: 2,
        faisabilite: 3,
      },
      {
        title: "Encaisser les imprévus de planning, prévenir les clients",
        problem:
          "Un chantier qui déborde décale la tournée du lendemain. Il faut rappeler quatre clients, personne n’a le temps, donc personne ne prévient : le client attend, s’agace, et le note quelque part pour la prochaine fois.",
        solution:
          "Le planning de l’équipe absorbe l’imprévu : les interventions se recalent selon urgence et géographie, et les clients concernés reçoivent un message avec le nouveau créneau. Une heure d’appels de coordination disparaît de la journée.",
        branchement: "l’agenda de l’équipe ; SMS côté clients",
        metric: "-1 h",
        metricLabel: "d’appels de coordination par jour quand la tournée bouge",
        questions: [
          "Votre équipe enchaîne-t-elle plusieurs interventions par jour ?",
          "Le planning vit-il dans un agenda partagé ?",
          "Les imprévus se règlent-ils encore à coups d’appels en chaîne ?",
        ],
        impact: 2,
        faisabilite: 2,
      },
      {
        title: "Classer les photos de chantier, les retrouver en quelques secondes",
        problem:
          "L’état des lieux avant travaux, la réserve levée, la malfaçon du sous-traitant : tout est en photo quelque part, dans trois téléphones. Le jour où l’assurance décennale ou un client de mauvaise foi demande des preuves, la recherche commence, et parfois elle échoue.",
        solution:
          "Les photos prises sur place se classent seules par chantier, datées et localisées, avant, pendant, après. Le dossier du chantier se constitue tout seul, prêt pour la réception de travaux, le mémoire technique ou le litige.",
        branchement: "les téléphones de l’équipe, avec classement automatique par chantier",
        metric: "5 s",
        metricLabel: "pour retrouver la photo d’avant-travaux d’un chantier d’il y a deux ans",
        questions: [
          "Votre équipe photographie-t-elle les chantiers ?",
          "Ces photos restent-elles dans les téléphones de chacun ?",
          "Avez-vous déjà cherché une photo en vain face à un litige ou une réception ?",
        ],
        impact: 1,
        faisabilite: 3,
      },
    ],
    verdict:
      "Le cas 2 d’abord si la trésorerie serre : il ne demande presque rien techniquement et rapporte dès la première quinzaine. Sinon le cas 1, le plus gros levier sur le chiffre d’affaires, à condition d’avoir déjà un outil de devis avec vos prix. Le cas 3 vient ensuite, surtout si le SAV nourrit vos chantiers ; les cas 4 et 5 sont le confort qui fait l’entreprise sérieuse, à activer quand les trois premiers tournent.",
    compliance: {
      title: "Mentions des devis, décennale et sous-traitance",
      body: "Un devis du bâtiment engage : mentions obligatoires, assurance décennale à faire figurer, règles de sous-traitance. Chaque système est conçu pour que vos devis sortent complets, à partir de vos documents à jour. L’IA prépare, vous signez : la responsabilité de l’artisan reste la vôtre, dans le cadre du RGPD et de l’AI Act.",
    },
    closing:
      "Cette carte vaut pour une entreprise du bâtiment type. La vôtre a ses corps de métier, ses chantiers, ses habitudes. Ce premier échange gratuit, c’est 30 min pour poser votre carte à vous : je vous dis franchement où l’IA rapporte dans votre entreprise, et où elle ne sert à rien. Sans jargon, sans engagement.",
    brevoListId: 11, // Liste Brevo "Nurture carte artisans bâtiment", à créer dans Brevo
  },
  {
    slug: "carte-yachting",
    secteurSlug: "yachting",
    name: "Yachting",
    pitch:
      "Propositions charter le jour même, dossiers MYBA suivis, APA à jour : la carte d’une maison de charter.",
    metaTitle: "IA dans le yachting : 5 cas d’usage classés | Coucou IA",
    metaDescription:
      "Propositions charter le jour même, dossiers MYBA suivis, APA au fil de l’eau, devis refit consolidés : 5 cas d’usage IA yachting, classés par faisabilité.",
    h1: "IA pour le yachting : la carte des possibles",
    lede: "Coucou. Une demande charter en anglais à 22 h se gagne le lendemain matin, avec la première vraie proposition dans la boîte du client. Cette carte pose à plat les cinq cas d’usage IA d’une maison de charter et de gestion, du plus rentable au plus simple à mettre en production, avec pour chacun l’ordre de grandeur du gain et trois questions pour savoir si c’est chez vous.",
    axes: {
      impact:
        "Ce que le cas rapporte : des affaires prises parce que la proposition est partie la première, des dossiers sans trou, du temps de broker rendu à la relation client.",
      faisabilite:
        "La facilité de mise en production : elle dépend surtout de l’état de vos données (fleet list tenue, contrats numérisés) et de la maturité de la brique technique.",
    },
    useCases: [
      {
        title: "Qualifier la demande charter, proposer le jour même",
        problem:
          "La demande arrive en anglais, en italien, à toute heure, parfois via un broker, parfois en direct. Monter une proposition sérieuse (yachts disponibles sur les dates, zone, budget, profil des invités) prend des heures, et la première maison qui la sort emporte souvent l’affaire.",
        solution:
          "L’IA qualifie la demande à l’arrivée et prépare la proposition : yachts pertinents de votre flotte, disponibilités, conditions, dans la langue du client et au format de la maison. Le broker arbitre, ajuste et envoie avant la fin de journée.",
        branchement: "votre fleet list, les disponibilités et l’historique de vos propositions",
        metric: "jour même",
        metricLabel: "la proposition part avant 18 h, au lieu de 48 h plus tard",
        questions: [
          "Recevez-vous un flux régulier de demandes charter en saison ?",
          "Flotte et disponibilités sont-elles tenues à jour quelque part ?",
          "Des affaires sont-elles parties chez une maison qui a répondu plus vite ?",
        ],
        impact: 3,
        faisabilite: 2,
      },
      {
        title: "Suivre chaque dossier : contrat, acompte, pièces",
        problem:
          "Un dossier charter, c’est un contrat type MYBA à faire signer, un acompte à encaisser, l’APA à provisionner, les passeports et preference sheets des invités à collecter. Chaque pièce dépend de la mémoire de quelqu’un, et l’oubli se découvre à l’embarquement.",
        solution:
          "Chaque dossier est suivi pièce par pièce, avec relances au bon moment et dans la bonne langue : signature en attente, acompte non reçu, passeport manquant. L’équipe ouvre un tableau et voit ce qui bloque, dossier par dossier.",
        branchement: "vos contrats type MYBA, votre suivi de dossiers et votre boîte mail",
        metric: "0 trou",
        metricLabel: "dans le dossier au jour de l’embarquement : pièces, signatures, paiements",
        questions: [
          "Menez-vous plusieurs dossiers charter de front en saison ?",
          "Contrats et pièces sont-ils déjà numérisés ?",
          "Un embarquement a-t-il déjà été compliqué par une pièce manquante ?",
        ],
        impact: 2,
        faisabilite: 3,
      },
      {
        title: "Consolider les devis refit en un chiffrage lisible",
        problem:
          "Un refit fait travailler cinq corps de métier, cinq formats de devis et cinq calendriers. Consolider le tout en un chiffrage défendable devant l’armateur prend des jours, et chaque itération (une option ajoutée, un lot retiré) rouvre le chantier de tableur.",
        solution:
          "L’IA lit les devis de chaque prestataire, quel que soit le format, les aligne poste par poste et produit un chiffrage consolidé, écarts et trous signalés. Vous arbitrez ; l’armateur reçoit un document clair, et chaque itération se recalcule en quelques minutes.",
        branchement: "les devis PDF de vos prestataires, quel que soit leur gabarit",
        metric: "1 doc",
        metricLabel: "tous les lots consolidés, écarts signalés, au lieu d’une pile de PDF",
        questions: [
          "Pilotez-vous plusieurs refits ou arrêts techniques par an ?",
          "Les devis prestataires arrivent-ils sous forme exploitable (PDF, tableurs) ?",
          "La consolidation retarde-t-elle vos réponses aux armateurs ?",
        ],
        impact: 3,
        faisabilite: 1,
      },
      {
        title: "Tenir le décompte d’APA au fil de l’eau",
        problem:
          "Pendant le charter, le capitaine avance sur l’APA : carburant, provisioning, ports. Les justificatifs s’entassent, et le décompte final se reconstruit la dernière nuit, pour un client qui attend des comptes précis au débarquement.",
        solution:
          "Les justificatifs photographiés à bord sont lus, catégorisés et imputés au fil de l’eau. Le décompte est juste en permanence, le client peut le consulter, et le rapport final s’édite en quelques minutes au lieu d’une nuit.",
        branchement: "les justificatifs photographiés à bord et le compte APA du charter",
        metric: "0 nuit blanche",
        metricLabel: "en fin de charter : le décompte d’APA est déjà à jour",
        questions: [
          "Gérez-vous l’APA de plusieurs charters par saison ?",
          "Les justificatifs sont-ils photographiés ou numérisés à bord ?",
          "La fin de charter rime-t-elle avec une nuit de comptes ?",
        ],
        impact: 2,
        faisabilite: 2,
      },
      {
        title: "Briefer l’équipage avant chaque embarquement",
        problem:
          "Allergies, préférences, itinéraire souhaité, contacts à terre : tout existe dans les preference sheets et les mails, mais éparpillé. L’équipage découvre parfois à bord ce que le bureau savait depuis trois semaines.",
        solution:
          "Avant chaque embarquement, l’IA compile un brief complet depuis les fiches et les échanges : invités, régimes, préférences, itinéraire, contacts. Le capitaine et le chef reçoivent le même document, à jour, la veille du départ.",
        branchement: "les preference sheets, les échanges mails et les fiches clients",
        metric: "15 min",
        metricLabel: "pour un brief équipage complet, envoyé la veille du départ",
        questions: [
          "Préparez-vous plusieurs embarquements par saison ?",
          "Les préférences invités laissent-elles une trace (fiches, mails) ?",
          "L’équipage a-t-il déjà découvert une allergie ou une préférence trop tard ?",
        ],
        impact: 1,
        faisabilite: 3,
      },
    ],
    verdict:
      "Le cas 1 d’abord : c’est là que se prennent les affaires, et votre fleet list suffit pour démarrer. Le cas 2 le complète naturellement : proposer vite ne sert à rien si le dossier se perd ensuite. Le cas 3 a le plus gros impact par dossier mais demande le plus de préparation : lancez-le hors saison. Les cas 4 et 5 soignent l’expérience à bord, la partie que vos clients racontent.",
    compliance: {
      title: "TVA, vigilance et confidentialité",
      body: "La location de yachts obéit à des règles de TVA précises, et les transactions du secteur imposent une vigilance stricte contre le blanchiment. Chaque système prépare les dossiers et garde la trace, mais laisse ces questions là où elles doivent rester : entre vos mains et celles de vos conseils. Vos données clients restent sous votre contrôle : hébergement adapté, rien n’est envoyé à un modèle public sans votre accord. Le tout dans le cadre du RGPD et de l’AI Act.",
    },
    closing:
      "Cette carte vaut pour une maison de charter type. La vôtre a sa flotte, ses clients, ses saisons. Ce premier échange gratuit, c’est 30 min pour poser votre carte à vous : je vous dis franchement où l’IA rapporte dans votre maison, et où elle ne sert à rien. Sans jargon, sans engagement.",
    brevoListId: 12, // Liste Brevo "Nurture carte yachting", à créer dans Brevo
  },
  {
    slug: "carte-expertise-comptable",
    secteurSlug: "expertise-comptable",
    name: "Expertise comptable",
    pitch:
      "Saisie, liasses, lettrage, relances de pièces : la carte d’un cabinet d’expertise comptable.",
    metaTitle: "IA cabinet comptable : 5 cas d’usage classés | Coucou IA",
    metaDescription:
      "Pré-affectation des écritures, liasses, lettrage, relances de pièces : 5 cas d’usage IA en cabinet comptable, classés par impact et par faisabilité.",
    h1: "IA pour cabinet d’expertise comptable : la carte des possibles",
    lede: "Coucou. Vous savez déjà que l’IA va compter pour la profession comptable. Ce que personne ne vous dit, c’est par où commencer dans votre cabinet, sans jargon et sans y passer vos soirées. Cette carte pose à plat les cinq cas d’usage de votre métier, du plus rentable au plus simple à mettre en production, avec pour chacun l’ordre de grandeur du gain et trois questions pour savoir si c’est chez vous.",
    axes: {
      impact:
        "Ce que le cas rapporte au cabinet : du temps de collaborateur, de la capacité en période fiscale, du souffle pour le conseil.",
      faisabilite:
        "La facilité de mise en production : elle dépend surtout des données déjà dans vos outils de production et de la maturité de la brique technique.",
    },
    useCases: [
      {
        title: "Pré-affecter les écritures, relire au lieu de saisir",
        problem:
          "Vos collaborateurs ressaisissent les pièces une par une : factures, notes de frais, relevés. Le nombre de dossiers grimpe, l’équipe ne grandit pas au même rythme, et la saisie devient le premier poste de temps perdu du cabinet.",
        solution:
          "L’IA lit chaque pièce reçue et propose l’imputation : compte, TVA, libellé. Le collaborateur relit et valide au lieu de saisir depuis zéro. Il garde la main sur chaque écriture, il gagne le temps de la frappe.",
        branchement: "vos outils de production (ACD, Cegid, Pennylane ou autre) et la GED du cabinet",
        metric: "-70 %",
        metricLabel: "de temps de saisie sur les pièces courantes, relecture comprise",
        questions: [
          "Vos collaborateurs saisissent-ils plus de quelques centaines de pièces par mois ?",
          "Recevez-vous vos pièces sous forme numérique (PDF, photos, imports bancaires) ?",
          "La saisie déborde-t-elle sur le temps que vous voudriez passer au conseil ?",
        ],
        impact: 3,
        faisabilite: 3,
      },
      {
        title: "Pré-remplir les liasses, encaisser le pic fiscal",
        problem:
          "Chaque printemps, bilans, liasses et déclarations se concentrent sur quelques semaines. L’équipe encaisse le pic sans renfort durable, et les mêmes tableaux se re-remplissent dossier après dossier.",
        solution:
          "L’IA rassemble les éléments récurrents d’une liasse à partir des données de l’exercice et pré-remplit ce qui revient chaque année. L’expert-comptable relit et arbitre les points qui demandent son jugement, il ne repart plus d’une page blanche.",
        branchement: "votre logiciel de production et les données de l’exercice",
        metric: "3 j",
        metricLabel: "de collaborateur récupérés sur le mois le plus chargé",
        questions: [
          "Traitez-vous plusieurs dizaines de liasses sur la période fiscale ?",
          "Vos données d’exercice sont-elles déjà dans votre logiciel de production ?",
          "La période fiscale vous oblige-t-elle à refuser des dossiers ou à faire des heures ?",
        ],
        impact: 3,
        faisabilite: 2,
      },
      {
        title: "Absorber les questions clients de période fiscale",
        problem:
          "En pleine période, les mêmes questions reviennent en boucle : quelles pièces fournir, quelle échéance, où en est mon dossier. Chaque appel coupe un collaborateur dans une tâche à plus forte valeur.",
        solution:
          "Un assistant répond aux questions fréquentes à partir de vos process internes et transmet les cas particuliers au bon collaborateur. Vos clients ont une réponse tout de suite, votre équipe garde sa concentration.",
        branchement: "vos procédures et réponses types ; mail et téléphone côté clients",
        metric: "8/10",
        metricLabel: "questions de premier niveau traitées sans mobiliser l’équipe",
        questions: [
          "Recevez-vous chaque semaine un flux de questions clients répétitives ?",
          "Vos réponses types et procédures sont-elles écrites quelque part ?",
          "Ces sollicitations cassent-elles le rythme de l’équipe en période chargée ?",
        ],
        impact: 2,
        faisabilite: 2,
      },
      {
        title: "Automatiser lettrage et rapprochement bancaire",
        problem:
          "Le lettrage et le rapprochement mobilisent des heures de pointage, ligne à ligne, sur des écritures qui correspondent presque toujours. Un travail répétitif, sans valeur ajoutée, mais qu’il faut bien faire.",
        solution:
          "L’IA rapproche automatiquement écritures et relevés, et ne fait remonter que les écarts. Le collaborateur traite les vrais cas litigieux au lieu de valider des centaines de lignes qui tombent juste.",
        branchement: "vos imports bancaires et votre outil de production",
        metric: "écarts seuls",
        metricLabel: "le pointage se fait seul, l’équipe ne traite que les vrais litiges",
        questions: [
          "Vos collaborateurs pointent-ils un volume important d’écritures chaque mois ?",
          "Vos relevés bancaires arrivent-ils dans un format exploitable (import, fichier) ?",
          "Ce pointage répétitif pèse-t-il sur le moral et le temps de l’équipe ?",
        ],
        impact: 2,
        faisabilite: 3,
      },
      {
        title: "Relancer les pièces manquantes, dossier par dossier",
        problem:
          "Une partie des dossiers avance au ralenti parce qu’il manque toujours une pièce : un justificatif, un relevé, une facture. Relancer les clients un par un est fastidieux, alors ça traîne, et le retard se paie aux échéances.",
        solution:
          "L’IA repère les pièces manquantes dossier par dossier et déclenche des relances personnalisées au bon moment. Vos collaborateurs ne courent plus après les documents, ils reçoivent les pièces et avancent.",
        branchement: "l’état des pièces manquantes par dossier ; relances par mail",
        metric: "J-15",
        metricLabel: "dossiers complets avant l’échéance, relances parties toutes seules",
        questions: [
          "Gérez-vous assez de dossiers pour que les relances deviennent chronophages ?",
          "Savez-vous, dossier par dossier, quelles pièces vous attendez encore ?",
          "Les pièces en retard sont-elles une source de stress avant les échéances ?",
        ],
        impact: 1,
        faisabilite: 3,
      },
    ],
    verdict:
      "Le cas 1 d’abord : c’est le plus gros gisement du cabinet et la brique la plus mûre du marché. Le cas 4 est le gain rapide à activer dans la foulée, sur les mêmes données bancaires. Les cas 2 et 3 se préparent hors période fiscale pour être en production au printemps ; le cas 5 complète l’ensemble une fois le suivi des dossiers en place.",
    compliance: {
      title: "Secret professionnel et déontologie",
      body: "Chaque système est conçu dès le départ pour respecter le secret professionnel et les règles de l’Ordre des experts-comptables. Vos pièces clients restent sous votre contrôle : hébergement adapté, aucune donnée envoyée à un modèle public sans votre accord. Le tout dans le cadre du RGPD et de l’AI Act.",
    },
    closing:
      "Cette carte vaut pour un cabinet type. Le vôtre a ses dossiers, ses logiciels, ses habitudes. Ce premier échange gratuit, c’est 30 min pour poser votre carte à vous : je vous dis franchement où l’IA rapporte dans votre cabinet, et où elle ne sert à rien. Sans jargon, sans engagement.",
    brevoListId: 3, // Liste Brevo "Nurture carte expertise comptable"
  },
  {
    slug: "carte-industrie",
    secteurSlug: "industrie",
    name: "Industrie",
    pitch:
      "DCE, documentation technique, non-conformités, chiffrage : la carte d’une PME industrielle.",
    metaTitle: "IA en PME industrielle : 5 cas d’usage classés | Coucou IA",
    metaDescription:
      "Réponse aux DCE en une journée, doc technique interrogeable, non-conformités suivies : 5 cas d’usage IA en PME industrielle, classés par faisabilité.",
    h1: "IA pour PME industrielle : la carte des possibles",
    lede: "Coucou. Vous savez déjà que l’IA va compter pour l’industrie. Ce que personne ne vous dit, c’est par où commencer dans votre atelier et votre bureau d’études, sans jargon et sans usine à gaz. Cette carte pose à plat les cinq cas d’usage de votre activité, du plus rentable au plus simple à mettre en production, avec pour chacun l’ordre de grandeur du gain et trois questions pour savoir si c’est chez vous.",
    axes: {
      impact:
        "Ce que le cas rapporte : des appels d’offres traités en plus, des heures d’ingénieur rendues à l’étude, moins de risques sur la qualité.",
      faisabilite:
        "La facilité de mise en production : elle dépend surtout de l’état de vos données (ERP, GED, serveur partagé) et de la maturité de la brique technique.",
    },
    useCases: [
      {
        title: "Monter les réponses aux DCE et appels d’offres",
        problem:
          "Répondre à un DCE, c’est rassembler des dizaines de pièces techniques à la main, sous délai serré, à chaque appel d’offres. Un ingénieur y passe plusieurs jours à retrouver les bonnes fiches produits, les références passées et les documents normatifs.",
        solution:
          "L’IA rassemble tout ça à partir de vos propres documents et produit un premier dossier de réponse. Vos équipes valident et complètent au lieu de partir d’une feuille blanche, et vous répondez à plus d’appels d’offres sans mobiliser un ingénieur sur la paperasse.",
        branchement:
          "vos réponses passées, fiches produits et documents normatifs (serveur, ERP, GED)",
        metric: "1 j",
        metricLabel: "pour un premier dossier de réponse complet, au lieu d’une semaine",
        questions: [
          "Répondez-vous à plusieurs DCE ou appels d’offres par mois ?",
          "Vos pièces techniques et réponses passées sont-elles stockées quelque part ?",
          "Avez-vous déjà renoncé à un appel d’offres faute de temps pour monter le dossier ?",
        ],
        impact: 3,
        faisabilite: 2,
      },
      {
        title: "Interroger la documentation technique en langage courant",
        problem:
          "Une procédure, une fiche machine, une norme : l’information existe, mais elle est noyée dans les classeurs et le serveur partagé. Vos équipes perdent du temps à fouiller, ou refont ce qui existait déjà faute de l’avoir retrouvé.",
        solution:
          "L’IA retrouve la bonne information dans votre documentation à partir d’une question en langage courant, comme si vous demandiez à un collègue qui connaît tout par cœur. La réponse arrive en quelques secondes, avec sa source.",
        branchement: "votre documentation numérisée, même mal rangée",
        metric: "5 s",
        metricLabel: "pour retrouver la bonne procédure, réponse sourcée à l’appui",
        questions: [
          "Vos équipes consultent-elles la documentation plusieurs fois par jour ?",
          "Votre documentation est-elle déjà numérisée, même mal rangée ?",
          "Perdez-vous du temps parce qu’un document est introuvable au bon moment ?",
        ],
        impact: 2,
        faisabilite: 3,
      },
      {
        title: "Suivre les non-conformités avant l’arrêt de ligne",
        problem:
          "Les rapports de contrôle qualité et les comptes rendus d’incident s’accumulent, chacun dans son coin. Difficile de voir qu’un même défaut revient, jusqu’à ce qu’il devienne un problème récurrent ou un arrêt de ligne.",
        solution:
          "L’IA lit les rapports au fil de l’eau, les classe et signale les signaux qui se répètent avant qu’ils ne coûtent cher. Votre responsable qualité voit les tendances au lieu de dépouiller des dizaines de comptes rendus.",
        branchement: "vos rapports qualité et comptes rendus d’incident, même en texte libre",
        metric: "au fil de l’eau",
        metricLabel: "les rapports lus et classés, les défauts récurrents signalés tôt",
        questions: [
          "Produisez-vous un volume régulier de rapports qualité ou d’incidents ?",
          "Ces rapports sont-ils saisis quelque part, même en texte libre ?",
          "Un défaut répétitif vous a-t-il déjà coûté cher parce qu’il a été vu trop tard ?",
        ],
        impact: 2,
        faisabilite: 2,
      },
      {
        title: "Consolider le reporting de production sans ressaisie",
        problem:
          "Le suivi de production passe encore par des ressaisies : temps d’arrêt, rebuts, cadences, recopiés d’un tableur à l’autre. Le temps de consolider les chiffres, ils sont déjà en retard sur la réalité de l’atelier.",
        solution:
          "L’IA consolide automatiquement les données d’atelier dans un tableau de bord à jour, sans ressaisie. Vous suivez vos indicateurs en temps réel au lieu d’attendre le rapport de fin de semaine.",
        branchement: "vos données d’atelier (MES, capteurs, feuilles de relevé)",
        metric: "temps réel",
        metricLabel: "les indicateurs d’atelier consolidés sans ressaisie",
        questions: [
          "Vos indicateurs de production sont-ils recopiés à la main dans des tableurs ?",
          "Vos données d’atelier existent-elles déjà quelque part (MES, capteurs, feuilles) ?",
          "Vos chiffres de production arrivent-ils souvent trop tard pour réagir ?",
        ],
        impact: 1,
        faisabilite: 3,
      },
      {
        title: "Chiffrer les devis à partir des références passées",
        problem:
          "Chiffrer un devis, c’est souvent repartir de zéro alors qu’une affaire semblable a déjà été traitée. Retrouver la référence, ajuster quantités et prix prend du temps, et le devis part parfois trop tard ou au doigt mouillé.",
        solution:
          "L’IA retrouve les affaires comparables dans vos devis passés et propose un premier chiffrage à partir de vos propres références. Votre deviseur ajuste et arbitre au lieu de tout reconstruire, et le devis part plus vite et plus cohérent.",
        branchement: "votre historique de devis et votre ERP",
        metric: "10 min",
        metricLabel: "pour un premier chiffrage depuis vos références, au lieu de plusieurs heures",
        questions: [
          "Produisez-vous assez de devis pour que le chiffrage soit un goulot ?",
          "Vos devis passés sont-ils conservés et exploitables (historique, ERP) ?",
          "Avez-vous déjà perdu une affaire parce que le devis est parti trop tard ?",
        ],
        impact: 3,
        faisabilite: 1,
      },
    ],
    verdict:
      "Le cas 2 d’abord si votre documentation est déjà numérisée : c’est le plus simple à mettre en production et il se voit dès la première semaine. Le cas 1 est le plus gros levier commercial : lancez-le dès qu’un appel d’offres a été refusé faute de temps. Les cas 3 et 4 s’appuient sur des données que vous produisez déjà ; le cas 5 attend un historique de devis propre.",
    compliance: {
      title: "Propriété industrielle et données de production",
      body: "Chaque système est conçu dès le départ pour protéger vos données de production et votre propriété industrielle. Rien ne sort de votre périmètre sans votre accord : hébergement adapté, aucun plan ni procédé envoyé à un modèle public par défaut. Le tout dans le cadre du RGPD et de l’AI Act.",
    },
    closing:
      "Cette carte vaut pour une PME industrielle type. La vôtre a ses machines, ses références, ses appels d’offres. Ce premier échange gratuit, c’est 30 min pour poser votre carte à vous : je vous dis franchement où l’IA rapporte dans votre activité, et où elle ne sert à rien. Sans jargon, sans engagement.",
    brevoListId: 4, // Liste Brevo "Nurture carte industrie"
  },
];

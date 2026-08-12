// Lead magnets « La carte des possibles » (/ressources/[slug]).
// Spec : .agents/lead-magnets.md. Un objet par secteur de tête de pont.
// Chiffres = ordres de grandeur étiquetés « illustration », jamais des références clients.

import { contactEmail } from "@/content/site";

export type CarteUseCase = {
  title: string;
  // Le problème en langage métier, sans techno.
  problem: string;
  // Ce que l'IA sait faire aujourd'hui sur ce problème.
  solution: string;
  // Ordre de grandeur chiffré, court (ex. "2 à 3 j récupérés par mois").
  // Toujours affiché avec ressourcesShared.illustrationLabel.
  order: string;
  // Mini-grille d'auto-évaluation : volumétrie, données disponibles, douleur.
  questions: [string, string, string];
  // Position sur la matrice de synthèse.
  impact: 1 | 2 | 3;
  faisabilite: 1 | 2 | 3;
};

export type RessourcePage = {
  // Ex. "carte-expertise-comptable".
  slug: string;
  // Slug de la page secteur correspondante (content upgrade).
  secteurSlug: string;
  // Nom court pour les liens et le breadcrumb.
  name: string;
  // ≤ 60 caractères.
  metaTitle: string;
  // ~150 caractères.
  metaDescription: string;
  // Landing de capture.
  h1: string;
  intro: string;
  bullets: [string, string, string];
  // Liste nurture Brevo du secteur : l'automation livre la carte par email,
  // les relances suivent (contenu des emails : .agents/nurture.md). ID à
  // remplacer une fois la liste créée dans Brevo (checklist-semaine-1.md).
  brevoListId: number;
  // La carte elle-même (/ressources/[slug]/carte, noindex).
  carte: {
    title: string;
    // Le constat d'ouverture.
    lede: string;
    // Comment lire la carte (les deux axes, ce qu'on entend par « en production »).
    method: string;
    // 4 à 6 cas d'usage.
    useCases: CarteUseCase[];
    compliance: { title: string; body: string };
    // « Cette carte est générique. La vôtre ne l'est pas. »
    closing: { title: string; body: string };
  };
};

// Copie transverse des gabarits ressources (même rôle que spokes.ts pour les spokes).
export const ressourcesShared = {
  formEmailLabel: "Votre email professionnel",
  formEmailPlaceholder: "prenom@entreprise.fr",
  formSubmitLabel: "Recevoir la carte",
  formPrivacyNote: "Pas de spam. Un email, la carte, c'est tout.",
  formErrorInvalid: "Cette adresse email ne semble pas valide.",
  formErrorServer: `Une erreur est survenue. Réessayez, ou écrivez-nous : ${contactEmail}.`,
  successTitle: "C'est tout bon.",
  successBody:
    "Votre carte vous attend juste là :",
  successCarteLabel: "Consulter la carte",
  illustrationLabel: "Illustration, pas une référence client",
  questionsTitle: "Est-ce chez vous ?",
  matrixTitle: "La carte de synthèse",
  axisImpact: "Impact",
  axisFaisabilite: "Faisabilité",
  // Bloc content upgrade en bas des pages secteurs.
  upgradeTitle: "Emportez la carte",
  upgradeBody:
    "Les cas d'usage de votre métier, classés par impact et faisabilité, avec une grille pour évaluer chacun chez vous.",
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
    "Les cas d’usage IA de votre métier, classés par impact et faisabilité. Une carte par secteur, envoyée par email, avec une grille pour évaluer chacun chez vous.",
  h1: "Les cartes des possibles",
  intro:
    "Une carte par secteur : les cas d’usage IA de votre métier, classés par impact et par faisabilité, pour savoir quoi lancer en premier.",
};

// Ordre = ordre de mise en avant (hub /ressources, sortie douce du CTA,
// grille interactive) : les niches Côte d'Azur d'abord, les secteurs
// historiques (expertise comptable, industrie) ensuite.
export const ressources: RessourcePage[] = [
  {
    slug: "carte-immobilier",
    secteurSlug: "immobilier",
    name: "Immobilier",
    metaTitle: "IA en agence immobilière : par où commencer | Coucou IA",
    metaDescription:
      "Les cas d’usage IA d’une agence immobilière, classés par impact et faisabilité, avec une grille pour évaluer chacun chez vous. La carte des possibles.",
    h1: "IA en agence immobilière : par où commencer chez vous",
    intro:
      "Vous savez que l’IA va compter dans l’immobilier. Voici les cas d’usage concrets de votre agence, classés par impact et par faisabilité, pour voir lesquels valent le coup chez vous.",
    bullets: [
      "Cinq cas d’usage de l’agence, du plus rentable au plus simple à lancer.",
      "Pour chacun, l’ordre de grandeur du gain et trois questions pour savoir si c’est chez vous.",
      "La carte de synthèse : quoi lancer en premier, quoi garder pour plus tard.",
    ],
    brevoListId: 8, // Liste Brevo "Nurture carte immobilier", à créer dans Brevo
    carte: {
      title: "La carte des possibles : agence immobilière",
      lede: "Coucou. Vous savez déjà que l’IA va compter pour l’immobilier. Ce que personne ne vous dit, c’est par où commencer dans votre agence, sans jargon et sans changer de logiciel. Cette carte répond à cette question : les cas d’usage de votre métier, du plus rentable au plus simple, posés à plat.",
      method:
        "La carte croise deux axes. L’impact, c’est ce que le cas vous fait gagner : des leads rappelés à temps, des mandats qui ne partent plus chez le confrère, du temps de négociateur. La faisabilité, c’est la facilité de le mettre en production, selon les données déjà disponibles et la maturité de la technologie. En production veut dire un système qui tourne vraiment dans l’agence, utilisé par vos négociateurs, pas une démo qui reste au stade de test.",
      useCases: [
        {
          title: "Qualification et rappel des leads portails",
          problem:
            "Les leads SeLoger et Leboncoin arrivent par mail, non qualifiés, et refroidissent en attendant qu’un négociateur ait le temps de rappeler. Le premier confrère qui rappelle prend souvent l’affaire.",
          solution:
            "L’IA qualifie chaque lead dès réception : projet, budget, financement, délai. Le négociateur rappelle en priorité ceux qui sont prêts, avec le contexte déjà en main au lieu d’un mail brut.",
          order: "chaque lead qualifié et rappelé dans l’heure au lieu du lendemain",
          questions: [
            "Recevez-vous plusieurs dizaines de leads portails par mois ?",
            "Ces leads arrivent-ils par mail ou dans votre logiciel de transaction ?",
            "Perdez-vous des affaires parce que le rappel arrive trop tard ?",
          ],
          impact: 3,
          faisabilite: 3,
        },
        {
          title: "Relance des propriétaires après estimation",
          problem:
            "Les propriétaires rencontrés en estimation ne sont pas relancés au bon moment. Le projet mûrit sans vous, et le mandat part chez le confrère qui a rappelé le premier.",
          solution:
            "L’IA suit chaque estimation et déclenche des relances personnalisées au bon rythme, avec l’historique du bien et de la rencontre. Le négociateur valide le message, la relation reste la sienne.",
          order: "plus aucun propriétaire estimé oublié dans le CRM",
          questions: [
            "Réalisez-vous plusieurs estimations par semaine ?",
            "Vos estimations sont-elles tracées quelque part (CRM, tableur, agenda) ?",
            "Un mandat vous a-t-il déjà échappé faute de relance au bon moment ?",
          ],
          impact: 3,
          faisabilite: 2,
        },
        {
          title: "Rédaction et contrôle des annonces",
          problem:
            "Chaque annonce se rédige à la main, se contrôle sur les mentions attendues (DPE, honoraires, copropriété) et se ressaisit portail par portail. Un travail répétitif qui retarde la mise en ligne.",
          solution:
            "L’IA rédige l’annonce à partir des caractéristiques du bien et des photos, contrôle les mentions attendues, puis la prépare pour votre outil de diffusion habituel. Le négociateur relit et publie.",
          order: "une annonce complète en quelques minutes au lieu d’une heure",
          questions: [
            "Publiez-vous plusieurs annonces par semaine ?",
            "Les caractéristiques de vos biens sont-elles déjà saisies dans votre logiciel ?",
            "Vos mises en ligne prennent-elles du retard faute de temps de rédaction ?",
          ],
          impact: 2,
          faisabilite: 3,
        },
        {
          title: "Comptes rendus de visite dictés",
          problem:
            "Les comptes rendus de visite restent oraux, le CRM est incomplet, et le propriétaire attend des nouvelles qui n’arrivent pas. À la fin, personne ne sait ce que les acquéreurs ont vraiment pensé du bien.",
          solution:
            "Le négociateur dicte son retour en sortant de la visite. L’IA structure le compte rendu, met le CRM à jour et prépare le message au propriétaire, à valider avant envoi.",
          order: "un CRM à jour et un retour propriétaire le soir même",
          questions: [
            "Vos négociateurs font-ils plusieurs visites par semaine ?",
            "Un CRM ou un logiciel de transaction est-il déjà en place ?",
            "Des propriétaires se plaignent-ils de ne pas avoir de nouvelles après les visites ?",
          ],
          impact: 2,
          faisabilite: 2,
        },
        {
          title: "Préparation des rendez-vous d’estimation",
          problem:
            "Avant une estimation, il faut rassembler ventes comparables, historique du bien et contexte du quartier. Faute de temps, le négociateur arrive parfois les mains vides face à un propriétaire qui a déjà consulté trois sites d’estimation.",
          solution:
            "L’IA prépare le dossier avant chaque rendez-vous : comparables, historique, tendance du secteur. Le négociateur arrive préparé et défend son prix avec des éléments concrets.",
          order: "un dossier d’estimation prêt en quelques minutes",
          questions: [
            "Vos négociateurs préparent-ils leurs estimations à la main ?",
            "Avez-vous accès à un historique de ventes exploitable (le vôtre ou les bases publiques) ?",
            "Des mandats se jouent-ils sur la crédibilité du prix annoncé en rendez-vous ?",
          ],
          impact: 1,
          faisabilite: 3,
        },
      ],
      compliance: {
        title: "Loi Hoguet, TRACFIN et données clients",
        body: "Chaque système est conçu dès le départ pour s’inscrire dans le cadre de la loi Hoguet et de vos obligations de vigilance TRACFIN : l’IA prépare, le professionnel titulaire de la carte décide et signe. Les données de vos acquéreurs et vendeurs restent sous votre contrôle : hébergement adapté, aucune donnée envoyée à un modèle public sans votre accord. Le tout dans le cadre du RGPD et de l’AI Act.",
      },
      closing: {
        title: "Cette carte est générique. La vôtre ne l’est pas.",
        body: "Cette carte vaut pour une agence type. La vôtre a son secteur, son logiciel, ses négociateurs. Ce premier échange gratuit, c’est 30 min pour poser votre carte à vous : je vous dis franchement où l’IA rapporte dans votre agence, et où elle ne sert à rien. Sans jargon, sans engagement.",
      },
    },
  },
  {
    slug: "carte-location-saisonniere",
    secteurSlug: "location-saisonniere",
    name: "Location saisonnière",
    metaTitle: "IA en location saisonnière : par où commencer | Coucou IA",
    metaDescription:
      "Les cas d’usage IA d’une conciergerie ou d’un loueur saisonnier, classés par impact et faisabilité, avec une grille d’auto-évaluation. La carte des possibles.",
    h1: "IA en location saisonnière : par où commencer chez vous",
    intro:
      "Vous savez que l’IA va compter dans la location saisonnière. Voici les cas d’usage concrets de votre activité, classés par impact et par faisabilité, pour voir lesquels valent le coup chez vous.",
    bullets: [
      "Cinq cas d’usage de la conciergerie, du plus rentable au plus simple à lancer.",
      "Pour chacun, l’ordre de grandeur du gain et trois questions pour savoir si c’est chez vous.",
      "La carte de synthèse : quoi lancer en premier, quoi garder pour plus tard.",
    ],
    brevoListId: 9, // Liste Brevo "Nurture carte location saisonnière", à créer dans Brevo
    carte: {
      title: "La carte des possibles : conciergerie et location saisonnière",
      lede: "Coucou. Vous savez déjà que l’IA va compter pour la location saisonnière. Ce que personne ne vous dit, c’est par où commencer entre les messages voyageurs, les ménages et les calendriers, sans jargon et sans y passer vos nuits. Cette carte répond à cette question : les cas d’usage de votre activité, du plus rentable au plus simple, posés à plat.",
      method:
        "La carte croise deux axes. L’impact, c’est ce que le cas vous fait gagner : un temps de réponse qui protège votre classement, des ménages qui ne sautent plus, des soirées rendues. La faisabilité, c’est la facilité de le mettre en production, selon les données déjà disponibles et la maturité de la technologie. En production veut dire un système qui tourne vraiment dans votre conciergerie, utilisé tous les jours, pas une démo qui reste au stade de test.",
      useCases: [
        {
          title: "Réponses aux voyageurs à toute heure, dans leur langue",
          problem:
            "Les messages voyageurs tombent à toute heure, en plusieurs langues, sur plusieurs plateformes à la fois. Chaque heure sans réponse abîme votre classement, et les soirées y passent.",
          solution:
            "Les questions courantes (accès, équipements, horaires) reçoivent une réponse immédiate dans la langue du voyageur. Les cas sensibles (litige, caution, réclamation) passent par votre validation avant envoi.",
          order: "une première réponse en minutes au lieu de plusieurs heures",
          questions: [
            "Recevez-vous chaque jour un flux régulier de messages voyageurs ?",
            "Les informations de vos logements sont-elles écrites quelque part (livret, annonces, réponses types) ?",
            "Les messages du soir et du week-end pèsent-ils sur votre vie ou celle de l’équipe ?",
          ],
          impact: 3,
          faisabilite: 3,
        },
        {
          title: "Coordination des ménages et interventions",
          problem:
            "Entre deux séjours, tout se joue en quelques heures : ménage, linge, contrôle. La coordination se fait par SMS et appels, et un ménage non confirmé se découvre au pire moment.",
          solution:
            "À chaque réservation ou modification, le planning ménage se met à jour et les intervenants sont prévenus. Un ménage non confirmé remonte avant le check-in, pas après.",
          order: "zéro arrivée sans ménage confirmé",
          questions: [
            "Gérez-vous plusieurs rotations par semaine en saison ?",
            "Vos réservations vivent-elles dans un channel manager ou un calendrier centralisé ?",
            "Un voyageur est-il déjà arrivé devant un logement pas prêt ?",
          ],
          impact: 3,
          faisabilite: 2,
        },
        {
          title: "Sollicitation et réponse aux avis",
          problem:
            "Les avis font le classement, mais solliciter chaque voyageur au bon moment et répondre à chaque avis publié demande une régularité impossible en haute saison.",
          solution:
            "Après chaque séjour, le voyageur est sollicité au bon moment. Chaque avis publié reçoit un projet de réponse dans sa langue, à valider avant publication.",
          order: "aucun avis sans réponse, même en haute saison",
          questions: [
            "Vos logements reçoivent-ils plusieurs avis par mois ?",
            "L’historique des séjours est-il accessible dans vos plateformes ?",
            "Des avis restent-ils sans réponse quand la saison bat son plein ?",
          ],
          impact: 2,
          faisabilite: 3,
        },
        {
          title: "Préparation des litiges et cautions",
          problem:
            "Un litige caution, c’est retrouver des messages, des photos et des dates éparpillés entre plateformes et téléphones, sous le délai imposé par la plateforme. Une soirée de perdue, au moment où vous en avez le moins.",
          solution:
            "L’IA rassemble la chronologie du séjour : échanges, photos d’état des lieux, pièces. Vous décidez et rédigez le message final, le dossier est déjà monté.",
          order: "un dossier de litige prêt en minutes au lieu d’une soirée",
          questions: [
            "Gérez-vous assez de séjours pour que les litiges reviennent régulièrement ?",
            "Photos d’état des lieux et échanges voyageurs sont-ils conservés quelque part ?",
            "Avez-vous déjà renoncé à une retenue faute de temps pour monter le dossier ?",
          ],
          impact: 2,
          faisabilite: 2,
        },
        {
          title: "Préparation des déclarations",
          problem:
            "Taxe de séjour, revenus par plateforme, obligations DAC7 : l’administratif s’empile après des journées déjà pleines, et les chiffres se rassemblent à la main, plateforme par plateforme.",
          solution:
            "Les chiffres sont rassemblés depuis vos plateformes et votre channel manager, prêts pour la déclaration. Vous vérifiez et déclarez, sans ressaisie.",
          order: "les chiffres rassemblés, prêts à déclarer",
          questions: [
            "Louez-vous sur plusieurs plateformes à la fois ?",
            "Vos revenus et nuitées sont-ils exportables depuis vos outils ?",
            "Les déclarations vous coûtent-elles chaque fois une soirée ou plus ?",
          ],
          impact: 1,
          faisabilite: 3,
        },
      ],
      compliance: {
        title: "Taxe de séjour, DAC7 et données voyageurs",
        body: "Louer en saisonnier crée des obligations : taxe de séjour à collecter et déclarer, revenus transmis à l’administration au titre de DAC7, données voyageurs à protéger. Chaque système est conçu pour vous aider à tenir ces obligations sans y passer vos soirées : vos données restent sous votre contrôle, dans le cadre du RGPD et de l’AI Act.",
      },
      closing: {
        title: "Cette carte est générique. La vôtre ne l’est pas.",
        body: "Cette carte vaut pour une conciergerie type. La vôtre a ses logements, ses plateformes, ses intervenants. Ce premier échange gratuit, c’est 30 min pour poser votre carte à vous : je vous dis franchement où l’IA rapporte dans votre activité, et où elle ne sert à rien. Sans jargon, sans engagement.",
      },
    },
  },
  {
    slug: "carte-hotellerie",
    secteurSlug: "hotellerie",
    name: "Hôtellerie",
    metaTitle: "IA pour hôtel indépendant : par où commencer | Coucou IA",
    metaDescription:
      "Les cas d’usage IA d’un hôtel indépendant, classés par impact et faisabilité, avec une grille pour évaluer chacun chez vous. La carte des possibles.",
    h1: "IA en hôtel indépendant : par où commencer chez vous",
    intro:
      "Vous savez que l’IA va compter dans l’hôtellerie. Voici les cas d’usage concrets de votre établissement, classés par impact et par faisabilité, pour voir lesquels valent le coup chez vous.",
    bullets: [
      "Cinq cas d’usage de la réception aux séminaires, du plus rentable au plus simple à lancer.",
      "Pour chacun, l’ordre de grandeur du gain et trois questions pour savoir si c’est chez vous.",
      "La carte de synthèse : quoi lancer en premier, quoi garder pour plus tard.",
    ],
    brevoListId: 10, // Liste Brevo "Nurture carte hôtellerie", à créer dans Brevo
    carte: {
      title: "La carte des possibles : hôtel indépendant",
      lede: "Coucou. Vous savez déjà que l’IA va compter pour l’hôtellerie. Ce que personne ne vous dit, c’est par où commencer dans votre établissement, sans jargon et sans alourdir la réception. Cette carte répond à cette question : les cas d’usage de votre métier, du plus rentable au plus simple, posés à plat.",
      method:
        "La carte croise deux axes. L’impact, c’est ce que le cas vous fait gagner : des réservations directes plutôt que des commissions, des devis qui partent le jour même, du temps de réception. La faisabilité, c’est la facilité de le mettre en production, selon les données déjà disponibles et la maturité de la technologie. En production veut dire un système qui tourne vraiment dans l’hôtel, utilisé par la réception, pas une démo qui reste au stade de test.",
      useCases: [
        {
          title: "Réponse aux demandes de réservation directe",
          problem:
            "Les demandes par mail et formulaire attendent que la réception ait un creux. Le client, lui, n’attend pas : il réserve sur une plateforme, et la commission tombe.",
          solution:
            "Chaque demande reçoit une réponse rapide avec disponibilités et tarif direct. Le client réserve chez vous, la réception valide les cas particuliers.",
          order: "une réponse avec tarif direct en minutes, la commission économisée",
          questions: [
            "Recevez-vous chaque semaine des demandes directes par mail ou formulaire ?",
            "Vos disponibilités et tarifs sont-ils accessibles dans votre PMS ?",
            "Des clients finissent-ils sur les plateformes faute de réponse rapide ?",
          ],
          impact: 3,
          faisabilite: 3,
        },
        {
          title: "Devis groupes et séminaires",
          problem:
            "Un devis groupe ou séminaire demande une heure de calcul et de rédaction entre deux arrivées. L’organisateur, qui a sollicité plusieurs établissements, signe souvent ailleurs avant votre réponse.",
          solution:
            "L’IA monte le devis à partir de votre grille et des disponibilités : chambres, salles, restauration. La réception vérifie et envoie, l’organisateur reçoit sa réponse le jour même.",
          order: "un devis groupe dans l’heure au lieu de 48 h",
          questions: [
            "Recevez-vous plusieurs demandes groupes ou séminaires par mois ?",
            "Votre grille tarifaire groupes est-elle posée quelque part ?",
            "Des affaires vous échappent-elles parce que le devis part trop tard ?",
          ],
          impact: 3,
          faisabilite: 2,
        },
        {
          title: "Réponses aux avis clients",
          problem:
            "Les avis s’accumulent sur les plateformes sans réponse, dans plusieurs langues. Or un avis sans réponse se voit, et pèse sur les réservations suivantes.",
          solution:
            "Chaque avis reçoit un projet de réponse dans la langue de l’avis, fidèle au ton de la maison, à valider avant publication. Aucun avis ne reste sans réponse, même en pleine saison.",
          order: "aucun avis sans réponse, dans la langue de l’avis",
          questions: [
            "Recevez-vous plusieurs avis par semaine, toutes plateformes confondues ?",
            "Votre ton de réponse est-il déjà posé (exemples de réponses passées) ?",
            "Des avis restent-ils sans réponse quand l’établissement est plein ?",
          ],
          impact: 2,
          faisabilite: 3,
        },
        {
          title: "Questions clients multilingues",
          problem:
            "Parking, horaires, petit déjeuner, environs : la clientèle internationale pose les mêmes questions dans quatre langues, avant et pendant le séjour, et chaque réponse coupe la réception dans son travail.",
          solution:
            "Les questions récurrentes reçoivent une réponse immédiate dans la langue du client, à partir des vraies informations de l’établissement. Le reste remonte à la réception.",
          order: "les questions récurrentes traitées sans mobiliser la réception",
          questions: [
            "La réception répond-elle chaque jour aux mêmes questions ?",
            "Les informations pratiques de l’établissement sont-elles écrites quelque part ?",
            "Ces interruptions pèsent-elles sur l’accueil des clients présents ?",
          ],
          impact: 2,
          faisabilite: 2,
        },
        {
          title: "Relance des devis restés sans réponse",
          problem:
            "Les devis groupes envoyés tombent dans un tableur, et personne n’a le temps de relancer. L’organisateur compare, hésite, puis oublie, et l’affaire meurt en silence.",
          solution:
            "Chaque devis envoyé est suivi et relancé au bon rythme, avec un message adapté à la demande. La réception reprend la main dès que l’organisateur répond.",
          order: "chaque devis relancé au bon moment, sans y penser",
          questions: [
            "Envoyez-vous plusieurs devis groupes par mois ?",
            "Vos devis envoyés sont-ils tracés quelque part ?",
            "Des affaires meurent-elles en silence faute de relance ?",
          ],
          impact: 1,
          faisabilite: 3,
        },
      ],
      compliance: {
        title: "Données clients et RGPD",
        body: "Un hôtel manipule des données personnelles précieuses : identités, coordonnées, habitudes de séjour. Chaque système est conçu pour garder ces données sous votre contrôle, avec un hébergement adapté, dans le cadre du RGPD et de l’AI Act. L’IA prépare les réponses, votre équipe garde la main sur la relation client.",
      },
      closing: {
        title: "Cette carte est générique. La vôtre ne l’est pas.",
        body: "Cette carte vaut pour un hôtel indépendant type. Le vôtre a ses chambres, ses saisons, sa clientèle. Ce premier échange gratuit, c’est 30 min pour poser votre carte à vous : je vous dis franchement où l’IA rapporte dans votre établissement, et où elle ne sert à rien. Sans jargon, sans engagement.",
      },
    },
  },
  {
    slug: "carte-artisans-batiment",
    secteurSlug: "artisans-batiment",
    name: "Artisans du bâtiment",
    metaTitle: "IA pour artisan du bâtiment : par où commencer | Coucou IA",
    metaDescription:
      "Les cas d’usage IA d’une entreprise du bâtiment, classés par impact et faisabilité, avec une grille pour évaluer chacun chez vous. La carte des possibles.",
    h1: "IA pour artisans du bâtiment : par où commencer chez vous",
    intro:
      "Vous savez que l’IA va compter dans le bâtiment. Voici les cas d’usage concrets de votre entreprise, classés par impact et par faisabilité, pour voir lesquels valent le coup chez vous.",
    bullets: [
      "Cinq cas d’usage du chantier au bureau, du plus rentable au plus simple à lancer.",
      "Pour chacun, l’ordre de grandeur du gain et trois questions pour savoir si c’est chez vous.",
      "La carte de synthèse : quoi lancer en premier, quoi garder pour plus tard.",
    ],
    brevoListId: 11, // Liste Brevo "Nurture carte artisans bâtiment", à créer dans Brevo
    carte: {
      title: "La carte des possibles : artisans du bâtiment",
      lede: "Coucou. Vous savez déjà que l’IA va compter pour le bâtiment. Ce que personne ne vous dit, c’est par où commencer entre les chantiers, les devis du soir et les factures à relancer, sans jargon et sans projet informatique interminable. Cette carte répond à cette question : les cas d’usage de votre métier, du plus rentable au plus simple, posés à plat.",
      method:
        "La carte croise deux axes. L’impact, c’est ce que le cas vous fait gagner : des devis signés parce qu’ils partent vite, des factures réglées, des soirées rendues. La faisabilité, c’est la facilité de le mettre en production, selon les données déjà disponibles et la maturité de la technologie. En production veut dire un système qui tourne vraiment dans l’entreprise, utilisé par l’équipe, pas une démo qui reste au stade de test.",
      useCases: [
        {
          title: "De la visite au devis en 24 h",
          problem:
            "La visite est faite, le client attend, et le devis se rédige le soir, des jours plus tard, quand il reste de l’énergie. Entre-temps, un concurrent a répondu, et parfois le client a signé.",
          solution:
            "Vos notes vocales et photos prises sur place sont structurées en devis dans votre outil habituel : postes, quantités, mentions attendues. Vous relisez, ajustez, envoyez. Le lendemain, pas la semaine suivante.",
          order: "le devis part en 24 h au lieu d’une semaine",
          questions: [
            "Faites-vous plusieurs visites avec devis à la clé chaque semaine ?",
            "Utilisez-vous déjà un outil de devis (Obat, Batappli, EBP ou autre) ?",
            "Des clients signent-ils ailleurs pendant que votre devis attend le soir ?",
          ],
          impact: 3,
          faisabilite: 2,
        },
        {
          title: "Relances devis et factures",
          problem:
            "Devis envoyés jamais relancés, factures réglées en retard : l’argent dort parce que personne n’a le temps de courir après, et la trésorerie le sent à la fin du mois.",
          solution:
            "Chaque devis envoyé est relancé au bon rythme, chaque facture échue aussi, avec un message qui vous ressemble. Vous restez au chantier, les relances partent quand même.",
          order: "chaque devis et chaque facture relancés au bon rythme",
          questions: [
            "Avez-vous en permanence plusieurs devis et factures en attente ?",
            "Devis et factures sortent-ils d’un outil qui garde la trace des envois ?",
            "Les retards de paiement pèsent-ils sur votre trésorerie ?",
          ],
          impact: 3,
          faisabilite: 3,
        },
        {
          title: "Qualification des demandes entrantes",
          problem:
            "Appels, messages et mails mélangent l’urgence SAV, le petit dépannage et le gros chantier. Le tri se fait au téléphone, entre deux interventions, et les vraies urgences attendent comme les autres.",
          solution:
            "Chaque demande est qualifiée dès réception : nature, urgence, adresse, photos si besoin. Les urgences remontent tout de suite, le reste se planifie posément.",
          order: "les urgences repérées tout de suite, les demandes triées",
          questions: [
            "Recevez-vous chaque semaine un flux mélangé de demandes (SAV, dépannage, chantier) ?",
            "Ces demandes arrivent-elles par des canaux que l’on peut brancher (mail, formulaire, messagerie) ?",
            "Une vraie urgence a-t-elle déjà attendu parce qu’elle était noyée dans le reste ?",
          ],
          impact: 2,
          faisabilite: 3,
        },
        {
          title: "Planification des interventions et du SAV",
          problem:
            "Chantiers, SAV et imprévus se planifient au téléphone. Un imprévu décale la tournée, personne ne prévient les clients, et la journée se termine avec des mécontents.",
          solution:
            "Les interventions sont priorisées et calées dans le planning de l’équipe. Un imprévu décale la tournée : les clients concernés sont prévenus automatiquement.",
          order: "un planning qui absorbe les imprévus, les clients prévenus",
          questions: [
            "Votre équipe enchaîne-t-elle plusieurs interventions par jour ?",
            "Votre planning vit-il déjà dans un agenda ou un outil partagé ?",
            "Les imprévus se règlent-ils encore à coups d’appels en chaîne ?",
          ],
          impact: 2,
          faisabilite: 2,
        },
        {
          title: "Photos et suivi de chantier",
          problem:
            "Les photos de chantier dorment dans les téléphones de l’équipe. Le jour où il faut prouver l’état avant travaux ou monter un dossier de litige, personne ne retrouve rien.",
          solution:
            "Les photos prises sur place sont classées par chantier et datées, prêtes pour le dossier client, la réception de travaux ou un litige.",
          order: "chaque photo classée par chantier, retrouvée en quelques secondes",
          questions: [
            "Votre équipe prend-elle des photos sur les chantiers ?",
            "Ces photos restent-elles aujourd’hui dans les téléphones de chacun ?",
            "Avez-vous déjà cherché en vain une photo au moment d’un litige ou d’une réception ?",
          ],
          impact: 1,
          faisabilite: 3,
        },
      ],
      compliance: {
        title: "Mentions des devis, décennale et sous-traitance",
        body: "Un devis du bâtiment engage : mentions obligatoires, assurance décennale à faire figurer, règles de sous-traitance. Chaque système est conçu pour que vos devis sortent complets, à partir de vos documents à jour. L’IA prépare, vous signez : la responsabilité de l’artisan reste la vôtre, dans le cadre du RGPD et de l’AI Act.",
      },
      closing: {
        title: "Cette carte est générique. La vôtre ne l’est pas.",
        body: "Cette carte vaut pour une entreprise du bâtiment type. La vôtre a ses corps de métier, ses chantiers, ses habitudes. Ce premier échange gratuit, c’est 30 min pour poser votre carte à vous : je vous dis franchement où l’IA rapporte dans votre entreprise, et où elle ne sert à rien. Sans jargon, sans engagement.",
      },
    },
  },
  {
    slug: "carte-yachting",
    secteurSlug: "yachting",
    name: "Yachting",
    metaTitle: "IA dans le yachting : par où commencer | Coucou IA",
    metaDescription:
      "Les cas d’usage IA d’une maison de charter ou de gestion de yachts, classés par impact et faisabilité, avec une grille d’auto-évaluation. La carte des possibles.",
    h1: "IA dans le yachting : par où commencer chez vous",
    intro:
      "Vous savez que l’IA va compter dans le yachting. Voici les cas d’usage concrets de votre maison, classés par impact et par faisabilité, pour voir lesquels valent le coup chez vous.",
    bullets: [
      "Cinq cas d’usage du charter au refit, du plus rentable au plus simple à lancer.",
      "Pour chacun, l’ordre de grandeur du gain et trois questions pour savoir si c’est chez vous.",
      "La carte de synthèse : quoi lancer en premier, quoi garder pour plus tard.",
    ],
    brevoListId: 12, // Liste Brevo "Nurture carte yachting", à créer dans Brevo
    carte: {
      title: "La carte des possibles : yachting",
      lede: "Coucou. Vous savez déjà que l’IA va compter pour le yachting. Ce que personne ne vous dit, c’est par où commencer entre les demandes multilingues, les contrats et les devis refit, sans jargon et sans toucher à la discrétion due à vos clients. Cette carte répond à cette question : les cas d’usage de votre métier, du plus rentable au plus simple, posés à plat.",
      method:
        "La carte croise deux axes. L’impact, c’est ce que le cas vous fait gagner : des propositions qui partent le jour même, des dossiers suivis sans trou, du temps de broker. La faisabilité, c’est la facilité de le mettre en production, selon les données déjà disponibles et la maturité de la technologie. En production veut dire un système qui tourne vraiment dans la maison, utilisé par vos équipes, pas une démo qui reste au stade de test.",
      useCases: [
        {
          title: "Qualification des demandes charter et propositions",
          problem:
            "Les demandes charter arrivent en plusieurs langues, à toute heure, et la première maison qui répond avec une vraie proposition prend souvent l’affaire. Monter chaque proposition à la main prend des heures.",
          solution:
            "Chaque demande est qualifiée dès réception : dates, zone, budget, invités. L’IA prépare une proposition avec les yachts pertinents, le broker ajuste et envoie le jour même.",
          order: "une proposition le jour même au lieu de 48 h",
          questions: [
            "Recevez-vous un flux régulier de demandes charter en saison ?",
            "Votre flotte et vos disponibilités sont-elles tenues à jour quelque part ?",
            "Des affaires partent-elles chez une maison qui a répondu plus vite ?",
          ],
          impact: 3,
          faisabilite: 2,
        },
        {
          title: "Suivi des dossiers et relances",
          problem:
            "Contrats type MYBA en attente de signature, acomptes, pièces manquantes : chaque dossier se suit à la main, et un oubli se paie en affaire perdue ou en départ retardé.",
          solution:
            "Chaque dossier est suivi et relancé au bon moment : signature, acompte, pièces. L’équipe voit d’un coup d’œil ce qui bloque, sans dépendre de la mémoire de chacun.",
          order: "aucun dossier qui dort faute de relance",
          questions: [
            "Avez-vous en permanence plusieurs dossiers en cours de signature ?",
            "Contrats et pièces sont-ils stockés numériquement ?",
            "Un dossier a-t-il déjà traîné parce que personne n’a relancé à temps ?",
          ],
          impact: 2,
          faisabilite: 3,
        },
        {
          title: "Consolidation des devis refit",
          problem:
            "Un devis refit fait attendre plusieurs corps de métier, chacun avec son format et ses délais. Consolider le tout en un chiffrage lisible pour l’armateur prend des jours.",
          solution:
            "Les devis des différents corps de métier sont rassemblés, comparés et consolidés en un chiffrage lisible, avec les écarts signalés. Vous arbitrez, l’armateur reçoit un document clair.",
          order: "un chiffrage refit consolidé et lisible pour l’armateur",
          questions: [
            "Gérez-vous plusieurs refits ou périodes de chantier par an ?",
            "Les devis prestataires arrivent-ils sous forme exploitable (PDF, tableurs) ?",
            "La consolidation retarde-t-elle vos réponses aux armateurs ?",
          ],
          impact: 3,
          faisabilite: 1,
        },
        {
          title: "Suivi de l’APA et des dépenses",
          problem:
            "Pendant le charter, les dépenses s’accumulent en justificatifs épars. Le décompte d’APA se reconstruit en fin de charter, dans l’urgence, avec un client qui attend des comptes précis.",
          solution:
            "L’IA lit les justificatifs au fil de l’eau et tient le décompte à jour. Le rapport final se prépare en quelques minutes, pas en une nuit de fin de charter.",
          order: "un décompte d’APA à jour pendant le charter",
          questions: [
            "Gérez-vous l’APA de plusieurs charters par saison ?",
            "Les justificatifs de dépenses sont-ils photographiés ou numérisés à bord ?",
            "La fin de charter rime-t-elle avec une nuit de comptes ?",
          ],
          impact: 2,
          faisabilite: 2,
        },
        {
          title: "Briefs avant embarquement",
          problem:
            "Préférences des invités, régimes alimentaires, itinéraire, contacts à terre : les informations arrivent par mails éparpillés, et l’équipage embarque parfois avec un brief incomplet.",
          solution:
            "L’équipage reçoit un brief complet et à jour avant chaque embarquement, rassemblé depuis les échanges et les fiches clients. Rien ne se perd entre le bureau et le bord.",
          order: "un brief équipage complet, prêt en quelques minutes",
          questions: [
            "Préparez-vous plusieurs embarquements par saison ?",
            "Les préférences clients sont-elles tracées quelque part (fiches, mails) ?",
            "L’équipage a-t-il déjà découvert une allergie ou une préférence trop tard ?",
          ],
          impact: 1,
          faisabilite: 3,
        },
      ],
      compliance: {
        title: "TVA, vigilance et confidentialité",
        body: "La location de yachts obéit à des règles de TVA précises, et les transactions du secteur imposent une vigilance stricte contre le blanchiment. Chaque système prépare les dossiers et garde la trace, mais laisse ces questions là où elles doivent rester : entre vos mains et celles de vos conseils. Vos données clients restent sous votre contrôle : hébergement adapté, rien n’est envoyé à un modèle public sans votre accord. Le tout dans le cadre du RGPD et de l’AI Act.",
      },
      closing: {
        title: "Cette carte est générique. La vôtre ne l’est pas.",
        body: "Cette carte vaut pour une maison de charter type. La vôtre a sa flotte, ses clients, ses saisons. Ce premier échange gratuit, c’est 30 min pour poser votre carte à vous : je vous dis franchement où l’IA rapporte dans votre maison, et où elle ne sert à rien. Sans jargon, sans engagement.",
      },
    },
  },
  {
    slug: "carte-expertise-comptable",
    secteurSlug: "expertise-comptable",
    name: "Expertise comptable",
    metaTitle: "IA cabinet comptable : par où commencer | Coucou IA",
    metaDescription:
      "Les cas d’usage IA d’un cabinet comptable, classés par impact et faisabilité, avec une grille pour évaluer chacun chez vous. La carte des possibles.",
    h1: "IA en cabinet comptable : par où commencer chez vous",
    intro:
      "Vous savez que l’IA va compter dans la profession. Voici les cas d’usage concrets de votre métier, classés par impact et par faisabilité, pour voir lesquels valent le coup chez vous.",
    bullets: [
      "Cinq cas d’usage du cabinet, du plus rentable au plus simple à lancer.",
      "Pour chacun, l’ordre de grandeur du gain et trois questions pour savoir si c’est chez vous.",
      "La carte de synthèse : quoi lancer en premier, quoi garder pour plus tard.",
    ],
    brevoListId: 3, // Liste Brevo "Nurture carte expertise comptable"
    carte: {
      title: "La carte des possibles : cabinet d’expertise comptable",
      lede: "Coucou. Vous savez déjà que l’IA va compter pour la profession comptable. Ce que personne ne vous dit, c’est par où commencer dans votre cabinet, sans jargon et sans y passer vos soirées. Cette carte répond à cette question : les cas d’usage de votre métier, du plus rentable au plus simple, posés à plat.",
      method:
        "La carte croise deux axes. L’impact, c’est ce que le cas vous fait gagner : du temps, de la capacité, du souffle en période chargée. La faisabilité, c’est la facilité de le mettre en production, selon les données déjà disponibles et la maturité de la technologie. En production veut dire un système qui tourne vraiment dans le cabinet, utilisé par vos collaborateurs, pas une démo qui reste au stade de test.",
      useCases: [
        {
          title: "Pré-affectation des écritures",
          problem:
            "Vos collaborateurs ressaisissent les pièces une par une : factures, notes de frais, relevés. Le nombre de dossiers grimpe, l’équipe ne grandit pas au même rythme, et la saisie devient le premier poste de temps perdu.",
          solution:
            "L’IA lit chaque pièce reçue et propose l’imputation comptable : compte, TVA, libellé. Le collaborateur relit et valide au lieu de saisir depuis zéro. Il garde la main, il gagne le temps de la frappe.",
          order: "jusqu’à 70 % de temps de saisie en moins sur les pièces courantes",
          questions: [
            "Vos collaborateurs saisissent-ils plus de quelques centaines de pièces par mois ?",
            "Recevez-vous vos pièces sous forme numérique (PDF, photos, imports bancaires) ?",
            "La saisie déborde-t-elle régulièrement sur le temps que vous voudriez passer au conseil ?",
          ],
          impact: 3,
          faisabilite: 3,
        },
        {
          title: "Préparation des liasses fiscales",
          problem:
            "Chaque printemps, bilans, liasses et déclarations se concentrent sur quelques semaines. L’équipe encaisse le pic sans renfort durable, et les mêmes tableaux se re-remplissent dossier après dossier.",
          solution:
            "L’IA rassemble les éléments récurrents d’une liasse à partir des données de l’exercice et pré-remplit ce qui revient chaque année. L’expert-comptable relit et arbitre les points qui demandent son jugement, il ne repart plus d’une page blanche.",
          order: "plusieurs jours de collaborateur récupérés sur le mois le plus chargé",
          questions: [
            "Traitez-vous plusieurs dizaines de liasses sur la période fiscale ?",
            "Vos données d’exercice sont-elles déjà dans votre logiciel de production ?",
            "La période fiscale vous oblige-t-elle chaque année à refuser des dossiers ou à faire des heures ?",
          ],
          impact: 3,
          faisabilite: 2,
        },
        {
          title: "Réponses aux questions clients en période fiscale",
          problem:
            "En pleine période, les mêmes questions clients reviennent en boucle : quelles pièces fournir, quelle échéance, où en est mon dossier. Chaque appel coupe un collaborateur dans une tâche à plus forte valeur.",
          solution:
            "Un assistant répond aux questions fréquentes à partir de vos process internes et transmet les cas particuliers au bon collaborateur. Vos clients ont une réponse tout de suite, votre équipe garde sa concentration.",
          order: "une bonne partie des questions de premier niveau traitées sans mobiliser l’équipe",
          questions: [
            "Recevez-vous chaque semaine un flux régulier de questions clients répétitives ?",
            "Vos réponses types et vos procédures sont-elles déjà écrites quelque part ?",
            "Ces sollicitations cassent-elles le rythme de vos collaborateurs en période chargée ?",
          ],
          impact: 2,
          faisabilite: 2,
        },
        {
          title: "Lettrage et rapprochement bancaire",
          problem:
            "Le lettrage et le rapprochement bancaire mobilisent des heures de pointage, ligne à ligne, sur des écritures qui correspondent presque toujours. Un travail répétitif, sans valeur ajoutée, mais qu’il faut bien faire.",
          solution:
            "L’IA rapproche automatiquement écritures et relevés bancaires, et ne fait remonter que les écarts. Le collaborateur traite les vrais cas litigieux au lieu de valider des centaines de lignes qui tombent juste.",
          order: "l’essentiel du pointage automatisé, seuls les écarts à traiter",
          questions: [
            "Vos collaborateurs pointent-ils un volume important d’écritures chaque mois ?",
            "Vos relevés bancaires arrivent-ils dans un format exploitable (import, fichier) ?",
            "Ce pointage répétitif pèse-t-il sur le moral et le temps de l’équipe ?",
          ],
          impact: 2,
          faisabilite: 3,
        },
        {
          title: "Relance des pièces manquantes",
          problem:
            "Une partie des dossiers avance au ralenti parce qu’il manque toujours une pièce : un justificatif, un relevé, une facture. Relancer les clients un par un est fastidieux, alors ça traîne, et le retard se paie au moment des échéances.",
          solution:
            "L’IA repère les pièces manquantes dossier par dossier et déclenche des relances personnalisées au bon moment. Vos collaborateurs ne courent plus après les documents, ils reçoivent les pièces et avancent.",
          order: "des dossiers complets plus tôt, moins de retards à l’approche des échéances",
          questions: [
            "Gérez-vous assez de dossiers pour que les relances de pièces deviennent chronophages ?",
            "Savez-vous, dossier par dossier, quelles pièces vous attendez encore ?",
            "Les pièces en retard sont-elles une source récurrente de stress avant les échéances ?",
          ],
          impact: 1,
          faisabilite: 3,
        },
      ],
      compliance: {
        title: "Secret professionnel et déontologie",
        body: "Chaque système est conçu dès le départ pour respecter le secret professionnel et les règles de l’Ordre des experts-comptables. Vos pièces clients restent sous votre contrôle : hébergement adapté, aucune donnée envoyée à un modèle public sans votre accord. Le tout dans le cadre du RGPD et de l’AI Act.",
      },
      closing: {
        title: "Cette carte est générique. La vôtre ne l’est pas.",
        body: "Cette carte vaut pour un cabinet type. Le vôtre a ses dossiers, ses logiciels, ses habitudes. Ce premier échange gratuit, c’est 30 min pour poser votre carte à vous : je vous dis franchement où l’IA rapporte dans votre cabinet, et où elle ne sert à rien. Sans jargon, sans engagement.",
      },
    },
  },
  {
    slug: "carte-industrie",
    secteurSlug: "industrie",
    name: "Industrie",
    metaTitle: "IA en PME industrielle : par où commencer | Coucou IA",
    metaDescription:
      "Les cas d’usage IA d’une PME industrielle, classés par impact et faisabilité, avec une grille pour évaluer chacun chez vous. La carte des possibles.",
    h1: "IA en PME industrielle : par où commencer chez vous",
    intro:
      "Vous savez que l’IA va compter dans l’industrie. Voici les cas d’usage concrets de votre activité, classés par impact et par faisabilité, pour voir lesquels valent le coup chez vous.",
    bullets: [
      "Cinq cas d’usage de l’atelier au bureau d’études, du plus rentable au plus simple à lancer.",
      "Pour chacun, l’ordre de grandeur du gain et trois questions pour savoir si c’est chez vous.",
      "La carte de synthèse : quoi lancer en premier, quoi garder pour plus tard.",
    ],
    brevoListId: 4, // Liste Brevo "Nurture carte industrie"
    carte: {
      title: "La carte des possibles : PME industrielle",
      lede: "Coucou. Vous savez déjà que l’IA va compter pour l’industrie. Ce que personne ne vous dit, c’est par où commencer dans votre atelier et votre bureau d’études, sans jargon et sans usine à gaz. Cette carte répond à cette question : les cas d’usage de votre activité, du plus rentable au plus simple, posés à plat.",
      method:
        "La carte croise deux axes. L’impact, c’est ce que le cas vous fait gagner : du temps, des appels d’offres traités, moins de risques sur la qualité. La faisabilité, c’est la facilité de le mettre en production, selon les données déjà disponibles et la maturité de la technologie. En production veut dire un système qui tourne vraiment dans l’entreprise, utilisé par vos équipes, pas un pilote qui ne dépasse jamais une ligne.",
      useCases: [
        {
          title: "Réponse aux DCE et appels d’offres",
          problem:
            "Répondre à un DCE, c’est rassembler des dizaines de pièces techniques à la main, sous délai serré, à chaque appel d’offres. Un ingénieur y passe souvent plusieurs jours à retrouver les bonnes fiches produits, les références passées et les documents normatifs.",
          solution:
            "L’IA rassemble tout ça à partir de vos propres documents et produit un premier dossier de réponse. Vos équipes valident et complètent au lieu de partir d’une feuille blanche, et vous répondez à plus d’appels d’offres sans mobiliser un ingénieur à temps plein sur la paperasse.",
          order: "d’une semaine à une journée pour un premier dossier de réponse",
          questions: [
            "Répondez-vous à plusieurs DCE ou appels d’offres par mois ?",
            "Vos pièces techniques et vos réponses passées sont-elles déjà stockées quelque part (serveur, ERP) ?",
            "Vous arrive-t-il de renoncer à un appel d’offres faute de temps pour monter le dossier ?",
          ],
          impact: 3,
          faisabilite: 2,
        },
        {
          title: "Recherche dans la documentation technique",
          problem:
            "Une procédure, une fiche machine, une norme : l’information existe, mais elle est noyée dans les classeurs et le serveur partagé. Vos équipes perdent du temps à fouiller, ou refont ce qui existait déjà faute de l’avoir retrouvé.",
          solution:
            "L’IA retrouve la bonne information dans votre documentation à partir d’une question en langage courant, comme si vous demandiez à un collègue qui connaît tout par cœur. La réponse arrive en quelques secondes, avec sa source.",
          order: "de plusieurs minutes de recherche à une réponse immédiate",
          questions: [
            "Vos équipes consultent-elles la documentation technique plusieurs fois par jour ?",
            "Votre documentation est-elle déjà numérisée, même mal rangée ?",
            "Perdez-vous régulièrement du temps parce qu’un document est introuvable au bon moment ?",
          ],
          impact: 2,
          faisabilite: 3,
        },
        {
          title: "Suivi des non-conformités",
          problem:
            "Les rapports de contrôle qualité et les comptes rendus d’incident s’accumulent, chacun dans son coin. Difficile de voir qu’un même défaut revient, jusqu’à ce qu’il devienne un problème récurrent ou un arrêt de ligne.",
          solution:
            "L’IA lit les rapports au fil de l’eau, les classe et signale les signaux qui se répètent avant qu’ils ne coûtent cher. Votre responsable qualité voit les tendances au lieu de dépouiller des dizaines de comptes rendus.",
          order: "les défauts récurrents repérés tôt, avant l’arrêt de ligne",
          questions: [
            "Produisez-vous un volume régulier de rapports qualité ou d’incidents ?",
            "Ces rapports sont-ils saisis quelque part, même en texte libre ?",
            "Un défaut répétitif vous a-t-il déjà coûté cher parce qu’il a été vu trop tard ?",
          ],
          impact: 2,
          faisabilite: 2,
        },
        {
          title: "Automatisation du reporting de production",
          problem:
            "Le suivi de production passe encore par des ressaisies : temps d’arrêt, rebuts, cadences, recopiés d’un tableur à l’autre. Le temps de consolider les chiffres, ils sont déjà en retard sur la réalité de l’atelier.",
          solution:
            "L’IA consolide automatiquement les données d’atelier dans un tableau de bord à jour, sans ressaisie. Vous suivez vos indicateurs en temps réel au lieu d’attendre le rapport de fin de semaine.",
          order: "un tableau de bord à jour en continu, plus de ressaisie",
          questions: [
            "Vos indicateurs de production sont-ils recopiés à la main dans des tableurs ?",
            "Vos données d’atelier existent-elles déjà quelque part (MES, capteurs, feuilles) ?",
            "Vos chiffres de production arrivent-ils souvent trop tard pour réagir ?",
          ],
          impact: 1,
          faisabilite: 3,
        },
        {
          title: "Premier chiffrage de devis à partir des références passées",
          problem:
            "Chiffrer un devis, c’est souvent repartir de zéro alors qu’une affaire semblable a déjà été traitée. Retrouver la référence passée, ajuster les quantités et les prix prend du temps, et le devis part parfois trop tard ou au doigt mouillé.",
          solution:
            "L’IA retrouve les affaires comparables dans vos devis passés et propose un premier chiffrage à partir de vos propres références. Votre deviseur ajuste et arbitre au lieu de tout reconstruire, et le devis part plus vite et plus cohérent.",
          order: "un premier chiffrage en quelques minutes au lieu de plusieurs heures",
          questions: [
            "Produisez-vous assez de devis pour que le chiffrage soit un goulot d’étranglement ?",
            "Vos devis passés sont-ils conservés et exploitables (historique, ERP) ?",
            "Vous arrive-t-il de perdre une affaire parce que le devis est parti trop tard ?",
          ],
          impact: 3,
          faisabilite: 1,
        },
      ],
      compliance: {
        title: "Propriété industrielle et données de production",
        body: "Chaque système est conçu dès le départ pour protéger vos données de production et votre propriété industrielle. Rien ne sort de votre périmètre sans votre accord : hébergement adapté, aucun plan ni procédé envoyé à un modèle public par défaut. Le tout dans le cadre du RGPD et de l’AI Act.",
      },
      closing: {
        title: "Cette carte est générique. La vôtre ne l’est pas.",
        body: "Cette carte vaut pour une PME industrielle type. La vôtre a ses machines, ses références, ses appels d’offres. Ce premier échange gratuit, c’est 30 min pour poser votre carte à vous : je vous dis franchement où l’IA rapporte dans votre activité, et où elle ne sert à rien. Sans jargon, sans engagement.",
      },
    },
  },
];

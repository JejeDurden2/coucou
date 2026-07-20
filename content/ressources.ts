// Lead magnets « La carte des possibles » (/ressources/[slug]).
// Spec : .agents/lead-magnets.md. Un objet par secteur de tête de pont.
// Chiffres = ordres de grandeur étiquetés « illustration », jamais des références clients.

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
  // Campagne nurture Lemlist du secteur : l'étape 1 livre la carte par email,
  // les relances suivent (contenu des emails : .agents/nurture.md).
  lemlistCampaignId: string;
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
  formErrorServer: "Une erreur est survenue. Réessayez, ou écrivez-nous.",
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
} as const;

export const ressources: RessourcePage[] = [
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
    lemlistCampaignId: "cam_qnKzY6bXNxtSinjAF",
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
    lemlistCampaignId: "cam_YLiMdN5H3wAW84wYs",
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

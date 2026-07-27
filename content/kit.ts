// Kit de démarrage (/outils/kit-de-demarrage) : l'outil gratuit du dirigeant qui
// fait écrire son premier outil par une IA et bloque sur tout ce qui n'est pas du
// code (dépôt, base, hébergement, comptes, emails, domaine).
// Arbre de décision statique : aucun appel modèle, aucune API. Copie comprise.
// L'espace insécable (U+00A0) précède ? ! : comme dans le reste du site.

// Les valeurs sont uniques dans tout l'arbre : une faute de frappe dans une
// condition ne compile pas (TypeScript refuse la comparaison sans recouvrement).
export type KitAnswers = {
  projet: "outil-interne" | "produit" | "espace-client" | "automatisation";
  utilisateurs: "equipe" | "clients" | "les-deux";
  connexion: "connexion-oui" | "connexion-non";
  donnees: "donnees-oui" | "donnees-non";
  emails: "emails-oui" | "emails-non";
  avancement: "idee" | "prototype" | "en-ligne";
};

export type KitQuestionId = keyof KitAnswers;
type KitValue = KitAnswers[KitQuestionId];

// Brouillon : une réponse par question déjà posée.
export type KitDraft = Partial<Record<KitQuestionId, KitValue>>;

export type KitOption = {
  value: KitValue;
  // Libellé du bouton (on s'adresse au visiteur) et valeur envoyée à Lemlist.
  label: string;
  // Reprise à la première personne, pour le prompt à copier.
  recap: string;
};

export type KitQuestion = {
  id: KitQuestionId;
  label: string;
  help: string;
  options: KitOption[];
  // Question sautée quand la réponse est déjà connue (un espace client suppose
  // une connexion) ou quand elle n'a plus de sens (automatisation).
  skipWhen?: (draft: KitDraft) => boolean;
};

// Campagne Lemlist du kit : l'étape 1 renvoie le kit par email, les relances suivent.
export const kitLemlistCampaignId = "cam_mY6HiTaMEN9k6btJw";

// Prédicats de l'arbre. Une seule source pour la page, le prompt et les étapes.
export const isAutomation = (draft: KitDraft) => draft.projet === "automatisation";

const needsAuth = (draft: KitDraft) =>
  draft.projet === "espace-client" || draft.connexion === "connexion-oui";

export const hasPersonalData = (draft: KitDraft) => draft.donnees === "donnees-oui";

const needsEmails = (draft: KitDraft) => draft.emails === "emails-oui";

// Une base est utile dès qu'il y a des comptes ou des données de personnes.
const needsDatabase = (draft: KitDraft) => needsAuth(draft) || hasPersonalData(draft);

// Un espace client répond « oui » à la connexion sans qu'on pose la question.
// La réponse déduite l'emporte sur une réponse donnée avant un changement d'avis.
function withDerived(draft: KitDraft): KitDraft {
  return draft.projet === "espace-client"
    ? { ...draft, connexion: "connexion-oui" }
    : draft;
}

export const kitQuestions: KitQuestion[] = [
  {
    id: "projet",
    label: "Que construisez-vous ?",
    help: "En une phrase, ce que vous voulez avoir entre les mains.",
    options: [
      {
        value: "outil-interne",
        label: "Un outil interne pour votre équipe",
        recap: "un outil interne pour mon équipe",
      },
      {
        value: "produit",
        label: "Un produit pour vos clients",
        recap: "un produit pour mes clients",
      },
      {
        value: "espace-client",
        label: "Un site avec un espace client",
        recap: "un site avec un espace client",
      },
      {
        value: "automatisation",
        label: "Une automatisation entre vos logiciels",
        recap: "une automatisation entre mes logiciels",
      },
    ],
  },
  {
    id: "utilisateurs",
    label: "Qui l’utilisera ?",
    help: "Les gens qui ouvriront votre outil tous les jours.",
    skipWhen: isAutomation,
    options: [
      { value: "equipe", label: "Votre équipe", recap: "Il sera utilisé par mon équipe" },
      { value: "clients", label: "Vos clients", recap: "Il sera utilisé par mes clients" },
      {
        value: "les-deux",
        label: "Les deux",
        recap: "Il sera utilisé par mon équipe et par mes clients",
      },
    ],
  },
  {
    id: "connexion",
    label: "Faudra-t-il se connecter ?",
    help: "Un identifiant et un mot de passe pour entrer, ou une porte ouverte.",
    // Automatisation : hors sujet. Espace client : la réponse est oui, d'office.
    skipWhen: (draft) => isAutomation(draft) || draft.projet === "espace-client",
    options: [
      {
        value: "connexion-oui",
        label: "Oui, chacun son compte",
        recap: "Les utilisateurs devront se connecter",
      },
      {
        value: "connexion-non",
        label: "Non, tout le monde entre",
        recap: "Personne n’a besoin de se connecter",
      },
    ],
  },
  {
    id: "donnees",
    label: "Manipulera-t-il des données personnelles ou clients ?",
    help: "Un nom, un email, un numéro de dossier : c’est déjà une donnée personnelle.",
    skipWhen: isAutomation,
    options: [
      {
        value: "donnees-oui",
        label: "Oui",
        recap: "Il manipulera des données personnelles ou clients",
      },
      {
        value: "donnees-non",
        label: "Non",
        recap: "Il ne manipulera pas de données personnelles",
      },
    ],
  },
  {
    id: "emails",
    label: "Devra-t-il envoyer des emails ?",
    help: "Confirmation, mot de passe oublié, alerte, récapitulatif.",
    skipWhen: isAutomation,
    options: [
      { value: "emails-oui", label: "Oui", recap: "Il devra envoyer des emails" },
      { value: "emails-non", label: "Non", recap: "Il n’enverra pas d’emails" },
    ],
  },
  {
    id: "avancement",
    label: "Où en êtes-vous ?",
    help: "Répondez franchement : le kit change selon l’endroit d’où vous partez.",
    skipWhen: isAutomation,
    options: [
      { value: "idee", label: "Une idée", recap: "je n’ai qu’une idée" },
      {
        value: "prototype",
        label: "Un prototype qui tourne sur mon ordinateur",
        recap: "j’ai un prototype qui tourne sur mon ordinateur",
      },
      {
        value: "en-ligne",
        label: "Déjà en ligne, mais fragile",
        recap: "c’est déjà en ligne, mais fragile",
      },
    ],
  },
];

// Les questions encore pertinentes au vu des réponses déjà données.
export function visibleQuestions(draft: KitDraft): KitQuestion[] {
  return kitQuestions.filter((question) => !question.skipWhen?.(draft));
}

function optionOf(draft: KitDraft, id: KitQuestionId): KitOption | undefined {
  const value = draft[id];
  return kitQuestions.find((question) => question.id === id)?.options.find(
    (option) => option.value === value
  );
}

// Réponses envoyées à Lemlist : le lead arrive déjà qualifié.
export function kitLeadFields(draft: KitDraft): { name: KitQuestionId; value: string }[] {
  const complete = withDerived(draft);
  return kitQuestions.flatMap((question) => {
    const option = optionOf(complete, question.id);
    return option ? [{ name: question.id, value: option.label }] : [];
  });
}

// La pile conseillée. Une brique n'apparaît que si elle sert : c'est là que
// les réponses du visiteur se voient.
export type KitBrick = {
  name: string;
  // Ce que c’est, en français de tous les jours.
  plain: string;
  // Pourquoi elle est dans votre pile à vous.
  reason: string;
  when?: (draft: KitDraft) => boolean;
};

const kitStack: KitBrick[] = [
  {
    name: "GitHub",
    plain: "l’endroit où votre code est rangé, avec l’historique de chaque changement.",
    reason:
      "Sans dépôt, votre outil vit sur un seul ordinateur : personne ne peut le reprendre et rien ne revient en arrière.",
  },
  {
    name: "Next.js en TypeScript",
    plain: "le cadre dans lequel votre application est écrite.",
    reason:
      "Les pages, le serveur et l’accès aux données dans un seul projet : moins de pièces à assembler, moins de choses à comprendre.",
  },
  {
    name: "Vercel",
    plain: "le serveur qui publie votre application sur internet.",
    reason:
      "Branché sur votre dépôt : vous poussez le code, la mise en ligne se fait toute seule.",
  },
  {
    name: "Supabase, région UE",
    plain: "votre base de données et vos comptes utilisateurs au même endroit.",
    reason:
      "Vos données rangées ailleurs que sur votre disque dur, avec les comptes qui vont avec, et hébergées en Europe.",
    when: needsDatabase,
  },
  {
    name: "Resend",
    plain: "le service qui envoie vos emails à votre place.",
    reason:
      "Un email parti de votre application n’arrive nulle part s’il ne prouve pas qu’il vient de votre domaine. C’est tout le travail de Resend.",
    when: needsEmails,
  },
  {
    name: "Un nom de domaine",
    plain: "votre adresse sur internet, du genre monoutil.fr.",
    reason:
      "L’adresse par défaut de Vercel fait démo. La vôtre fait entreprise, et vos emails en dépendent aussi.",
  },
];

export function kitBricks(draft: KitDraft): KitBrick[] {
  return kitStack.filter((brick) => !brick.when || brick.when(draft));
}

// La liste des gestes qu'une IA ne peut pas faire à votre place, dans l'ordre.
export type KitStep = {
  title: string;
  what: string;
  // Le vrai site où ça se passe.
  where: string;
  time: string;
  piege: string;
  when?: (draft: KitDraft) => boolean;
};

const kitSteps: KitStep[] = [
  {
    title: "Reprendre ce qui tourne déjà",
    what: "Avant d’ajouter quoi que ce soit : listez où sont vos clés aujourd’hui, qui a accès au code et à l’hébergement, et ce qui se passe si la base disparaît demain matin.",
    where: "Votre projet actuel",
    time: "30 min",
    piege:
      "Une clé qui traîne dans le code d’un projet déjà en ligne est déjà exposée. Changez-la avant d’aller plus loin, ne la cachez pas.",
    when: (draft) => draft.avancement === "en-ligne",
  },
  {
    title: "Créer votre dépôt de code",
    what: "Ouvrez un compte GitHub, puis créez un dépôt privé pour votre projet et envoyez-y votre code. C’est la mémoire de votre outil : chaque version y reste.",
    where: "github.com",
    time: "10 min",
    piege:
      "Cochez « privé » à la création. Un dépôt public, c’est votre code lisible par n’importe qui, clés comprises.",
  },
  {
    title: "Brancher l’hébergement",
    what: "Créez un compte Vercel avec votre compte GitHub, puis importez le dépôt. Votre outil est en ligne quelques minutes plus tard, et se remet à jour à chaque envoi de code.",
    where: "vercel.com",
    time: "10 min",
    piege:
      "Importez le dépôt, jamais un dossier de votre ordinateur. Sinon vous renverrez tout à la main à chaque modification.",
  },
  {
    title: "Créer la base de données",
    what: "Créez un projet Supabase et choisissez une région européenne (Paris ou Francfort). Notez les deux clés : la publique, qui peut vivre dans le navigateur, et la secrète, qui ne quitte jamais le serveur.",
    where: "supabase.com",
    time: "15 min",
    piege:
      "La région se choisit à la création et ne se change plus. Si vous vous trompez, il faut refaire le projet.",
    when: needsDatabase,
  },
  {
    title: "Réserver votre nom de domaine",
    what: "Réservez le domaine chez OVH ou Cloudflare, puis ajoutez-y les deux lignes que Vercel vous donne. Ces lignes indiquent à internet quel serveur répond quand on tape votre adresse.",
    where: "ovhcloud.com ou cloudflare.com",
    time: "20 min, puis quelques heures d’attente",
    piege:
      "Comptez jusqu’à 24 h avant que le domaine réponde partout. Réservez-le avant d’annoncer quoi que ce soit.",
  },
  {
    title: "Brancher l’envoi d’emails",
    what: "Créez un compte Resend, puis vérifiez votre domaine : trois lignes à ajouter chez votre hébergeur de domaine pour prouver que les emails viennent bien de vous.",
    where: "resend.com",
    time: "20 min",
    piege:
      "Tant que le domaine n’est pas vérifié, vos emails partent en indésirables. N’envoyez jamais depuis une adresse gmail au nom de votre entreprise.",
    when: needsEmails,
  },
  {
    title: "Ranger vos clés",
    what: "Chaque clé se range dans les variables d’environnement : dans un fichier .env.local sur votre ordinateur, et dans les réglages de votre projet Vercel pour la version en ligne.",
    where: "Vercel, onglet Settings, puis Environment Variables",
    time: "10 min",
    piege:
      "Une clé écrite dans le code part dans le dépôt et y reste, même effacée ensuite. Si ça arrive, révoquez la clé et créez-en une autre.",
  },
  {
    title: "Mettre en ligne, puis essayer pour de vrai",
    what: "Envoyez votre code, laissez Vercel publier, puis ouvrez votre outil sur votre téléphone et refaites le parcours complet, de la première page jusqu’à l’action qui compte.",
    where: "Votre nom de domaine",
    time: "15 min",
    piege:
      "Essayez avec un compte qui n’est pas le vôtre. Ce qui marche quand on est le patron du projet ne marche pas toujours pour un utilisateur normal.",
  },
  {
    title: "Activer les sauvegardes",
    what: "Dans Supabase, vérifiez que les sauvegardes automatiques tournent, et notez en trois lignes comment on restaure.",
    where: "supabase.com, réglages du projet",
    time: "10 min",
    piege:
      "Une sauvegarde jamais restaurée n’est pas une sauvegarde. Faites l’essai une fois, à froid, pendant que tout va bien.",
    when: needsDatabase,
  },
];

export function kitStepsFor(draft: KitDraft): KitStep[] {
  return kitSteps.filter((step) => !step.when || step.when(draft));
}

// Bloc RGPD, seulement si le visiteur manipule des données de personnes.
// Des repères, jamais un avis juridique.
export const kitRgpd = {
  title: "Vos utilisateurs, leurs données",
  intro:
    "Vous allez manipuler des données de personnes. Trois réflexes suffisent pour partir droit, pas un dossier de quarante pages.",
  points: [
    "Hébergez en Europe. Supabase propose des régions UE, c’est le réglage le plus simple à faire correctement du premier coup.",
    "Publiez vos mentions légales et une page qui dit ce que vous collectez, pourquoi, et combien de temps vous le gardez.",
    "Tenez un registre : un tableau qui liste vos données, où elles sont et qui y accède. Une page suffit pour commencer.",
  ],
  note: "Ce sont des repères, pas un avis juridique. Pour le reste, parlez à un juriste.",
} as const;

// Le prompt à coller dans Claude, assemblé à partir des réponses.
export function buildKitPrompt(draft: KitDraft): string {
  const complete = withDerived(draft);
  const projet = optionOf(complete, "projet")?.recap ?? "un outil pour mon entreprise";

  const contexte: string[] = [`Je dirige une entreprise et je construis ${projet}.`];
  for (const id of ["utilisateurs", "connexion", "donnees", "emails"] as const) {
    const recap = optionOf(complete, id)?.recap;
    if (recap) {
      contexte.push(`${recap}.`);
    }
  }
  const avancement = optionOf(complete, "avancement")?.recap;
  if (avancement) {
    contexte.push(`Aujourd’hui, ${avancement}.`);
  }
  contexte.push("Je ne suis pas développeur : expliquez-moi chaque choix en français simple.");

  const pile: string[] = ["- Next.js en TypeScript, déployé sur Vercel."];
  if (needsDatabase(complete)) {
    pile.push(
      needsAuth(complete)
        ? "- Supabase en région UE pour la base de données et les comptes."
        : "- Supabase en région UE pour la base de données."
    );
  } else {
    pile.push("- Pas de base de données pour l’instant : dites-le-moi avant d’en ajouter une.");
  }
  if (needsEmails(complete)) {
    pile.push("- Resend pour les emails, avec un domaine vérifié.");
  }

  return [
    "Contexte",
    ...contexte,
    "",
    "La pile que je veux utiliser",
    ...pile,
    "",
    "Comment je veux qu’on travaille",
    "- Avancez par petites étapes, et expliquez chaque choix simplement avant de coder.",
    "- Aucune clé ni aucun mot de passe dans le code : tout passe par les variables d’environnement.",
    "- Demandez-moi confirmation avant toute suppression de fichier ou de données.",
    "- Commencez par une version minimale qui marche de bout en bout, puis on ajoute le reste.",
    "",
    "Pour démarrer",
    "Posez-moi d’abord les questions qui vous manquent, puis proposez-moi le plan de la première version. On code ensuite.",
  ].join("\n");
}

// Toute la copie de la page et de l'outil.
export const kit = {
  metaTitle: "Kit de démarrage : lancer votre premier outil | Coucou IA",
  metaDescription:
    "Vous faites écrire votre premier outil par une IA et vous bloquez sur le dépôt, la base, l’hébergement ? Six questions, et vous repartez avec votre kit.",
  serviceName: "Kit de démarrage : votre premier outil",

  h1: "Votre premier outil : le kit de démarrage",
  intro:
    "Le code, ça va : l’IA vous en écrit. C’est tout le reste qui coince. Dépôt, base de données, hébergement, comptes, emails, nom de domaine. Six questions, et vous repartez avec la liste de ce qu’il faut créer, dans l’ordre, et le prompt qui va avec.",

  // Parcours.
  progressLabel: "Question",
  progressJoin: "sur",
  backLabel: "Question précédente",
  restartLabel: "Recommencer",
  editLabel: "Changer une réponse",

  // Verdict, visible tout de suite après la dernière question.
  verdictEyebrow: "Votre pile",
  verdictTitle: "Voici ce qu’il vous faut.",
  verdictOpeners: {
    idee: "Vous partez d’une idée : vous allez tout créer dans le bon ordre, sans rien avoir à reprendre.",
    prototype:
      "Votre prototype tourne sur votre ordinateur. Il lui manque de quoi survivre à votre disque dur : un dépôt, un hébergeur, une base.",
    "en-ligne":
      "C’est en ligne et ça tremble. On reprend les fondations avant d’empiler autre chose dessus.",
  },
  stackPlainPrefix: "C’est",

  // Porte email : le kit complet est derrière.
  gateTitle: "La suite du kit vous attend.",
  gateBody:
    "La liste complète de ce qu’il faut créer, dans l’ordre, avec le temps que ça prend et le piège de chaque étape. Et le prompt à coller dans Claude pour démarrer droit.",
  gateEmailLabel: "Votre email professionnel",
  gateEmailPlaceholder: "prenom@entreprise.fr",
  gateFirstNameLabel: "Votre prénom (facultatif)",
  gateFirstNamePlaceholder: "Camille",
  gateSubmitLabel: "Recevoir le kit complet",
  gatePendingLabel: "Un instant…",
  gatePrivacyNote: "Pas de spam. Le kit, et c’est tout.",
  gateErrorInvalid: "Cette adresse email ne semble pas valide.",
  gateErrorServer: "Une erreur est survenue. Réessayez, ou écrivez-nous.",

  // Kit complet.
  kitEyebrow: "Le kit",
  checklistTitle: "La liste, dans l’ordre",
  checklistIntro:
    "Ce que l’IA ne peut pas cliquer à votre place. Faites-les dans cet ordre, chacune débloque la suivante.",
  stepWhereLabel: "Où",
  stepTimeLabel: "Temps",
  stepPiegeLabel: "Le piège",

  promptTitle: "Le prompt à copier",
  promptIntro:
    "Collez-le dans Claude avant la première ligne de code. Il y trouve votre contexte, votre pile et vos règles.",
  promptCopyLabel: "Copier le prompt",
  promptCopiedLabel: "Copié",

  // Branche automatisation : pas de kit, une réponse franche.
  automationTitle: "Votre besoin ne passe pas par ce kit.",
  automationBody:
    "Brancher des logiciels entre eux, c’est une autre boîte à outils : Make, n8n, ou du sur mesure quand les deux premiers coincent. Ce kit sert à construire une application, pas à relier ce qui existe déjà.",
  automationBodySecond:
    "Le bon choix dépend de vos logiciels, de vos volumes et de ce qui doit se passer quand ça casse. C’est exactement le genre de décision qui se prend à deux.",

  // Clôture honnête, après le kit complet.
  closingTitle: "Le kit vous mène jusqu’à la mise en ligne.",
  closingBody:
    "Après, ça se corse : tenir la charge, verrouiller les accès, brancher vos logiciels, reprendre un prototype qui tient au scotch. C’est notre métier. Ce premier échange, c’est 30 min pour regarder où vous en êtes et ce qu’il manque.",
} as const;

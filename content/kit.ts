// Kit de démarrage (/outils/kit-de-demarrage) : l'outil gratuit du dirigeant qui
// fait écrire son premier outil par une IA et bloque sur tout ce qui n'est pas du
// code (dépôt, base, hébergement, comptes, emails, fichiers, encaissement,
// branchements, domaine).
// Arbre de décision statique : aucun appel modèle, aucune API. Copie comprise.
// L'espace insécable (U+00A0) précède ? ! : % € comme dans le reste du site.

import type { FaqItem } from "@/content/secteurs";

// Les valeurs sont uniques dans tout l'arbre : une faute de frappe dans une
// condition ne compile pas (TypeScript refuse la comparaison sans recouvrement).
export type KitAnswers = {
  projet: "outil-interne" | "produit" | "espace-client" | "automatisation";
  utilisateurs: "equipe" | "clients" | "les-deux";
  volume: "moins-de-dix" | "dizaines" | "centaines";
  connexion: "connexion-oui" | "connexion-non";
  donnees: "donnees-oui" | "donnees-non";
  fichiers: "fichiers-oui" | "fichiers-non";
  emails: "emails-oui" | "emails-non";
  paiements: "paiements-oui" | "paiements-non";
  integrations: "integrations-non" | "integrations-lecture" | "integrations-ecriture";
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
  // une connexion, un outil interne n'encaisse pas) ou quand elle n'a plus de
  // sens (automatisation).
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

const hasFiles = (draft: KitDraft) => draft.fichiers === "fichiers-oui";

// Un outil interne n'encaisse pas : la question est sautée, et le garde-fou sur
// `projet` neutralise une réponse donnée avant un changement d'avis (même
// motif que needsAuth pour l'espace client).
const needsPayments = (draft: KitDraft) =>
  draft.projet !== "outil-interne" && draft.paiements === "paiements-oui";

const needsIntegrations = (draft: KitDraft) =>
  draft.integrations === "integrations-lecture" || draft.integrations === "integrations-ecriture";

// Des centaines d'utilisateurs : les paliers gratuits ne tiennent plus.
export const hasHighVolume = (draft: KitDraft) => draft.volume === "centaines";

// Une base est utile dès qu'il y a des comptes, des données de personnes, des
// fichiers à ranger ou des commandes à garder.
const needsDatabase = (draft: KitDraft) =>
  needsAuth(draft) || hasPersonalData(draft) || hasFiles(draft) || needsPayments(draft);

// Un espace client répond « oui » à la connexion, un outil interne répond « non »
// à l'encaissement, sans qu'on pose la question. La réponse déduite l'emporte sur
// une réponse donnée avant un changement d'avis.
function withDerived(draft: KitDraft): KitDraft {
  if (draft.projet === "espace-client") {
    return { ...draft, connexion: "connexion-oui" };
  }
  if (draft.projet === "outil-interne") {
    return { ...draft, paiements: "paiements-non" };
  }
  return draft;
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
    id: "volume",
    label: "Combien de personnes l’utiliseront ?",
    help: "L’ordre de grandeur de la première année suffit. Il décide de la facture et des précautions.",
    skipWhen: isAutomation,
    options: [
      {
        value: "moins-de-dix",
        label: "Une poignée, moins de dix",
        recap: "Moins de dix personnes l’utiliseront",
      },
      {
        value: "dizaines",
        label: "Quelques dizaines",
        recap: "Quelques dizaines de personnes l’utiliseront",
      },
      {
        value: "centaines",
        label: "Des centaines, ou plus",
        recap: "Des centaines de personnes l’utiliseront, voire plus",
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
    id: "fichiers",
    label: "Manipulera-t-il des documents ou des fichiers ?",
    help: "Un devis en PDF, une photo de chantier, un contrat signé : tout ce qui s’envoie et se relit.",
    skipWhen: isAutomation,
    options: [
      {
        value: "fichiers-oui",
        label: "Oui",
        recap: "Il manipulera des documents et des fichiers",
      },
      {
        value: "fichiers-non",
        label: "Non",
        recap: "Il ne manipulera pas de fichiers",
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
    id: "paiements",
    label: "Devra-t-il encaisser des paiements ?",
    help: "Une carte bancaire saisie dans votre outil, un abonnement, une facture réglée en ligne.",
    // Automatisation : hors sujet. Outil interne : la réponse est non, d'office.
    skipWhen: (draft) => isAutomation(draft) || draft.projet === "outil-interne",
    options: [
      { value: "paiements-oui", label: "Oui", recap: "Il devra encaisser des paiements" },
      { value: "paiements-non", label: "Non", recap: "Il n’encaissera pas de paiements" },
    ],
  },
  {
    id: "integrations",
    label: "Devra-t-il se brancher sur vos logiciels actuels ?",
    help: "Votre ERP, votre CRM, votre logiciel de facturation : tout ce qui tourne déjà chez vous.",
    skipWhen: isAutomation,
    options: [
      {
        value: "integrations-non",
        label: "Non, il vit seul",
        recap: "Il n’a pas besoin de se brancher sur mes logiciels",
      },
      {
        value: "integrations-lecture",
        label: "Oui, pour lire des données",
        recap: "Il devra lire des données dans mes logiciels actuels",
      },
      {
        value: "integrations-ecriture",
        label: "Oui, pour lire et écrire",
        recap: "Il devra lire et écrire des données dans mes logiciels actuels",
      },
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

// Réponses envoyées à Lemlist : le lead arrive déjà qualifié. Toute nouvelle
// question part d'elle-même, sans rien changer à la server action.
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
  // Ordre de grandeur mensuel, quand la brique coûte quelque chose.
  cost?: string;
  when?: (draft: KitDraft) => boolean;
  // Aperçu avant la porte email : le langage est toujours montré, plus une
  // seule brique que le visiteur ne connaît pas (rang 1 d'abord). Le reste
  // est flouté jusqu'à l'email.
  teaser?: true;
  insider?: 1 | 2 | 3;
};

const kitStack: KitBrick[] = [
  {
    name: "Claude Code",
    plain: "l’outil d’IA qui écrit et corrige le code avec vous, sur votre ordinateur.",
    reason:
      "Il fait le travail que vous ne savez pas faire, et le prompt de ce kit est écrit pour lui.",
    cost: "environ 20 €/mois",
  },
  {
    name: "GitHub",
    plain: "l’endroit où votre code est rangé, avec l’historique de chaque changement.",
    reason:
      "Sans dépôt, votre outil vit sur un seul ordinateur : personne ne peut le reprendre et rien ne revient en arrière.",
    cost: "0 €",
  },
  {
    name: "Next.js en TypeScript",
    teaser: true,
    plain: "le cadre dans lequel votre application est écrite.",
    reason:
      "Les pages, le serveur et l’accès aux données dans un seul projet : moins de pièces à assembler, moins de choses à comprendre.",
  },
  {
    name: "Vercel",
    insider: 3,
    plain: "le serveur qui publie votre application sur internet.",
    reason:
      "Branché sur votre dépôt : vous poussez le code, la mise en ligne se fait toute seule.",
    cost: "0 € pour démarrer, environ 20 €/mois ensuite",
  },
  {
    name: "Supabase, région UE",
    insider: 1,
    plain: "votre base de données et vos comptes utilisateurs au même endroit.",
    reason:
      "Vos données rangées ailleurs que sur votre disque dur, avec les comptes qui vont avec, et hébergées en Europe.",
    cost: "0 € pour démarrer, environ 25 €/mois en production",
    when: needsDatabase,
  },
  {
    name: "Resend",
    insider: 2,
    plain: "le service qui envoie vos emails à votre place.",
    reason:
      "Un email parti de votre application n’arrive nulle part s’il ne prouve pas qu’il vient de votre domaine. C’est tout le travail de Resend.",
    cost: "0 € pour démarrer",
    when: needsEmails,
  },
  {
    name: "Stripe",
    plain: "le service qui encaisse les paiements par carte et vous reverse l’argent.",
    reason:
      "Personne ne garde lui-même des numéros de carte. Stripe porte la sécurité et la conformité à votre place.",
    cost: "pas d’abonnement, 1,5 à 3 % par paiement",
    when: needsPayments,
  },
  {
    name: "Un nom de domaine",
    plain: "votre adresse sur internet, du genre monoutil.fr.",
    reason:
      "L’adresse par défaut de Vercel fait démo. La vôtre fait entreprise, et vos emails en dépendent aussi.",
    cost: "10 à 15 €/an",
  },
];

// L'aperçu gratuit : le langage et une seule brique inconnue du grand public.
// Le reste part dans `locked`, flouté jusqu'à l'email.
export function kitVerdictBricks(draft: KitDraft): { teaser: KitBrick[]; locked: KitBrick[] } {
  const bricks = kitStack.filter((brick) => !brick.when || brick.when(draft));
  const insider = bricks
    .filter((brick) => brick.insider)
    .sort((a, b) => (a.insider ?? 9) - (b.insider ?? 9))[0];
  const teaser = bricks.filter((brick) => brick.teaser || brick === insider);
  return { teaser, locked: bricks.filter((brick) => !teaser.includes(brick)) };
}

// La facture du mois, brique par brique, pour cette pile-là seulement.
export function kitCostsFor(draft: KitDraft): { name: string; cost: string }[] {
  return kitStack.flatMap((brick) =>
    (!brick.when || brick.when(draft)) && brick.cost
      ? [{ name: brick.name, cost: brick.cost }]
      : []
  );
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
    time: "30 min",
    piege:
      "Une clé qui traîne dans le code d’un projet déjà en ligne est déjà exposée. Changez-la avant d’aller plus loin, ne la cachez pas.",
    when: (draft) => draft.avancement === "en-ligne",
  },
  {
    title: "Installer l’outil d’IA",
    what: "Installez Claude Code sur votre ordinateur, créez un dossier vide pour votre projet, et lancez l’outil depuis ce dossier. Tout ce que vous construisez tiendra dedans.",
    where: "claude.com",
    time: "15 min",
    piege:
      "Ne le lancez jamais depuis un dossier qui contient tous vos documents : l’IA lit ce qui l’entoure. Un dossier par projet, et rien d’autre dedans.",
  },
  {
    title: "Créer votre dépôt de code",
    what: "Ouvrez un compte GitHub, puis créez un dépôt privé pour votre projet et envoyez-y votre code. C’est la mémoire de votre outil : chaque version y reste.",
    where: "github.com",
    time: "10 min",
    piege:
      "Cochez « privé » à la création. Un dépôt public, c’est votre code lisible par n’importe qui, clés comprises.",
  },
  {
    title: "Brancher l’hébergement",
    what: "Créez un compte Vercel avec votre compte GitHub, puis importez le dépôt. Votre outil est en ligne quelques minutes plus tard, et se remet à jour à chaque envoi de code.",
    where: "vercel.com",
    time: "10 min",
    piege:
      "Importez le dépôt, jamais un dossier de votre ordinateur. Sinon vous renverrez tout à la main à chaque modification.",
  },
  {
    title: "Créer la base de données",
    what: "Créez un projet Supabase et choisissez une région européenne (Paris ou Francfort). Notez les deux clés : la publique, qui peut vivre dans le navigateur, et la secrète, qui ne quitte jamais le serveur.",
    where: "supabase.com",
    time: "15 min",
    piege:
      "La région se choisit à la création et ne se change plus. Si vous vous trompez, il faut refaire le projet.",
    when: needsDatabase,
  },
  {
    title: "Activer le stockage de fichiers",
    what: "Dans votre projet Supabase, créez un espace de stockage (un « bucket ») privé pour vos documents. Votre application demandera un lien temporaire à chaque fois qu’un fichier doit s’ouvrir.",
    where: "supabase.com, onglet Storage",
    time: "10 min",
    piege:
      "Un espace public expose tous vos documents à qui devine l’adresse. Créez-le privé, puis vérifiez-le depuis une fenêtre de navigation privée.",
    when: hasFiles,
  },
  {
    title: "Réserver votre nom de domaine",
    what: "Réservez le domaine chez OVH ou Cloudflare, puis ajoutez-y les deux lignes que Vercel vous donne. Ces lignes indiquent à internet quel serveur répond quand on tape votre adresse.",
    where: "ovhcloud.com ou cloudflare.com",
    time: "20 min, puis quelques heures d’attente",
    piege:
      "Comptez jusqu’à 24 h avant que le domaine réponde partout. Réservez-le avant d’annoncer quoi que ce soit.",
  },
  {
    title: "Créer le compte d’encaissement",
    what: "Ouvrez un compte Stripe, puis faites vérifier l’identité de votre société : numéro SIREN, pièce d’identité du dirigeant, coordonnées bancaires. Sans cette vérification, l’argent encaissé ne vous est jamais reversé.",
    where: "stripe.com",
    time: "30 min, puis un à deux jours de vérification",
    piege:
      "Restez en mode test tant que le parcours complet ne marche pas de bout en bout. Le premier vrai paiement se fait sur votre propre carte, et vous vous le remboursez.",
    when: needsPayments,
  },
  {
    title: "Brancher l’envoi d’emails",
    what: "Créez un compte Resend, puis vérifiez votre domaine : trois lignes à ajouter chez votre hébergeur de domaine pour prouver que les emails viennent bien de vous.",
    where: "resend.com",
    time: "20 min",
    piege:
      "Tant que le domaine n’est pas vérifié, vos emails partent en indésirables. N’envoyez jamais depuis une adresse gmail au nom de votre entreprise.",
    when: needsEmails,
  },
  {
    title: "Préparer le branchement à vos logiciels",
    what: "Listez les logiciels à relier, cherchez le mot « API » dans leur documentation ou demandez-le à votre éditeur, puis notez pour chacun ce que vous devez lire, ce que vous devez écrire, et où se trouve la clé d’accès.",
    where: "La documentation de vos logiciels",
    time: "1 h",
    piege:
      "Commencez en lecture seule. On n’écrit dans un logiciel métier que le jour où tout le reste tient debout.",
    when: needsIntegrations,
  },
  {
    title: "Ranger vos clés",
    what: "Chaque clé se range dans les variables d’environnement : dans un fichier .env.local sur votre ordinateur, et dans les réglages de votre projet Vercel pour la version en ligne.",
    where: "Vercel, onglet Settings, puis Environment Variables",
    time: "10 min",
    piege:
      "Une clé écrite dans le code part dans le dépôt et y reste, même effacée ensuite. Si ça arrive, révoquez la clé et créez-en une autre.",
  },
  {
    title: "Mettre en ligne, puis essayer pour de vrai",
    what: "Envoyez votre code, laissez Vercel publier, puis ouvrez votre outil sur votre téléphone et refaites le parcours complet, de la première page jusqu’à l’action qui compte.",
    where: "Votre nom de domaine",
    time: "15 min",
    piege:
      "Essayez avec un compte qui n’est pas le vôtre. Ce qui marche quand on est le patron du projet ne marche pas toujours pour un utilisateur normal.",
  },
  {
    title: "Ne pas rester seul détenteur",
    what: "Donnez un deuxième accès à une personne de confiance sur GitHub, Vercel et Supabase, et rangez les mots de passe dans un gestionnaire de mots de passe partagé plutôt que dans un carnet.",
    where: "Les réglages d’équipe de chaque compte",
    time: "20 min",
    piege:
      "Le jour où votre ordinateur lâche, l’entreprise ne doit pas perdre l’outil avec lui. Un deuxième accès coûte vingt minutes aujourd’hui, trois semaines le jour venu.",
  },
  {
    title: "Activer les sauvegardes",
    what: "Dans Supabase, vérifiez que les sauvegardes automatiques tournent, et notez en trois lignes comment on restaure.",
    where: "supabase.com, réglages du projet",
    time: "10 min",
    piege:
      "Une sauvegarde jamais restaurée n’est pas une sauvegarde. Faites l’essai une fois, à froid, pendant que tout va bien.",
    when: needsDatabase,
  },
];

export function kitStepsFor(draft: KitDraft): KitStep[] {
  return kitSteps.filter((step) => !step.when || step.when(draft));
}

// Ce qui mérite un coup d'œil avant de se lancer, selon les réponses. Rien de
// juridique : des réflexes.
export type KitWatchPoint = {
  text: string;
  when: (draft: KitDraft) => boolean;
};

const kitWatchPoints: KitWatchPoint[] = [
  {
    text: "Encaisser en ligne suppose des conditions de vente écrites. Une page suffit, mais elle doit exister avant le premier paiement.",
    when: needsPayments,
  },
  {
    text: "Écrire dans un logiciel métier peut abîmer des données. Sauvegardez avant chaque premier essai, et gardez un moyen de revenir en arrière.",
    when: (draft) => draft.integrations === "integrations-ecriture",
  },
  {
    text: "À ce volume, les paliers gratuits ne tiennent pas. Surveillez les coûts dès le premier mois, avant de les découvrir sur une facture.",
    when: hasHighVolume,
  },
  {
    text: "Vos clients jugeront l’outil comme ils jugent votre entreprise. Prévoyez une adresse de contact visible pour les jours où ça coince.",
    when: (draft) => draft.utilisateurs === "clients" || draft.utilisateurs === "les-deux",
  },
];

export function kitWatchPointsFor(draft: KitDraft): string[] {
  return kitWatchPoints.filter((point) => point.when(draft)).map((point) => point.text);
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

// « a », « a et b », « a, b et c ».
function frenchList(items: string[]): string {
  return items.length < 2
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

// Le premier geste demandé à l'IA change selon l'endroit d'où part le visiteur.
const kitPromptStart = {
  idee: "Posez-moi d’abord les questions qui vous manquent, puis proposez-moi le plan de la première version. On code ensuite.",
  prototype:
    "Premier geste : mettez mon prototype existant dans un dépôt Git sans rien y changer. Relisez-le ensuite et dites-moi ce qui doit bouger, avant d’y toucher.",
  "en-ligne":
    "Premier geste : un état des lieux. Listez les clés exposées, qui a accès à quoi, et ce qui manque pour que je dorme tranquille. On répare ça avant d’ajouter la moindre fonction.",
} as const;

// Le prompt à coller dans Claude, assemblé à partir des réponses.
export function buildKitPrompt(draft: KitDraft): string {
  const complete = withDerived(draft);
  const projet = optionOf(complete, "projet")?.recap ?? "un outil pour mon entreprise";

  const contexte: string[] = [`Je dirige une entreprise et je construis ${projet}.`];
  const suite = [
    "utilisateurs",
    "volume",
    "connexion",
    "donnees",
    "fichiers",
    "emails",
    "paiements",
    "integrations",
  ] as const;
  for (const id of suite) {
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
    const roles = [
      "la base de données",
      ...(needsAuth(complete) ? ["les comptes"] : []),
      ...(hasFiles(complete) ? ["le stockage de mes fichiers"] : []),
    ];
    pile.push(`- Supabase en région UE pour ${frenchList(roles)}.`);
  } else {
    pile.push("- Pas de base de données pour l’instant : dites-le-moi avant d’en ajouter une.");
  }
  if (needsEmails(complete)) {
    pile.push("- Resend pour les emails, avec un domaine vérifié.");
  }
  if (needsPayments(complete)) {
    pile.push("- Stripe pour encaisser, sans jamais garder un numéro de carte chez moi.");
  }
  if (needsIntegrations(complete)) {
    pile.push("- Les branchements à mes logiciels commencent en lecture seule.");
  }

  const avancementValue = complete.avancement;
  const demarrer =
    avancementValue === "prototype" || avancementValue === "en-ligne"
      ? kitPromptStart[avancementValue]
      : kitPromptStart.idee;

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
    "- Dites-moi clairement quand une action m’attend hors du code : créer un compte, cliquer quelque part, payer.",
    "- À chaque étape, montrez-moi comment vérifier que ça marche.",
    "",
    "Pour démarrer",
    demarrer,
  ].join("\n");
}

// Ce qui reste derrière la porte email, chiffré : le visiteur voit la taille du kit.
// ponytail: toujours au pluriel (au moins 7 étapes et 5 briques), pas d'accord à gérer.
export function kitGateLine(steps: number, bricks: number): string {
  return `Pour vos réponses : ${steps} étapes à faire dans l’ordre, ${bricks} briques à mettre en place.`;
}

// Toute la copie de la page et de l'outil.
export const kit = {
  metaTitle: "Kit de démarrage : votre premier outil avec l’IA | Coucou IA",
  metaDescription:
    "Vous faites écrire votre premier outil par une IA et vous bloquez sur le dépôt, la base, l’hébergement ? Une dizaine de questions, et vous repartez avec votre kit.",
  serviceName: "Kit de démarrage : votre premier outil",

  h1: "Votre premier outil avec l’IA : le kit de démarrage",
  intro:
    "Le code, ça va : l’IA vous en écrit. C’est tout le reste qui coince. Dépôt, base de données, hébergement, comptes, emails, nom de domaine. Une dizaine de questions, et vous repartez avec la liste de ce qu’il faut créer, dans l’ordre, ce que ça coûte, et le prompt qui va avec.",

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
  // Deuxième lecture, selon ce qui se construit.
  projetReadings: {
    "outil-interne":
      "Un outil interne pardonne une allure sobre, jamais une donnée perdue : la fiabilité d’abord.",
    produit:
      "Un produit pour vos clients sera jugé comme votre entreprise : soignez le parcours avant d’empiler les fonctions.",
    "espace-client":
      "Un espace client, c’est moins d’emails et moins de relances : la connexion et les droits d’accès sont le cœur du sujet.",
  },
  stackPlainPrefix: "C’est",

  // Porte email : le kit complet est derrière.
  gateTitle: "La suite du kit vous attend.",
  gateBody:
    "Le reste de votre pile, la liste complète de ce qu’il faut créer, dans l’ordre, avec le temps que ça prend et le piège de chaque étape. Ce que ça coûte par mois, vos points de vigilance, et le prompt à coller dans Claude pour démarrer droit.",
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

  // Ce que la pile coûte, brique par brique.
  costsTitle: "Ce que ça coûte par mois",
  costsNote: "Ordres de grandeur, prix publics, à vérifier au moment de vous lancer.",
  costsTotal: "Comptez 20 à 70 €/mois pour un premier outil sérieux.",
  costsVolumeNote:
    "À des centaines d’utilisateurs, les paliers gratuits ne tiennent plus : prévoyez plutôt 100 à 200 €/mois, et activez les alertes de dépense dès le premier mois.",

  watchTitle: "Les points de vigilance",

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
  automationQuestionsTitle: "Trois questions avant de choisir",
  automationQuestions: [
    "Combien de fois par jour le geste se répète-t-il ? En dessous de quelques fois par semaine, une personne qui le fait à la main reste moins chère qu’une automatisation à entretenir.",
    "Vos logiciels ont-ils une API ? Cherchez le mot dans leur documentation ou demandez-le à votre éditeur. Sans cette porte d’entrée, aucune automatisation ne tiendra.",
    "Que se passe-t-il quand ça casse un dimanche ? Votre réponse tranche entre Make, n8n et du sur mesure.",
  ],

  // Clôture honnête, après le kit complet.
  closingTitle: "Le kit vous mène jusqu’à la mise en ligne.",
  closingBody:
    "Après, ça se corse : tenir la charge, verrouiller les accès, brancher vos logiciels, reprendre un prototype qui tient au scotch. C’est notre métier. Ce premier échange, c’est 30 min pour regarder où vous en êtes et ce qu’il manque.",
} as const;

// Lien croisé vers l'autre outil (/outils/par-ou-commencer).
export const kitCross = {
  body: "Pas sûr que ce soit le bon premier chantier ?",
  linkLabel: "Testez vos cas d’usage sur la grille par où commencer",
  href: "/outils/par-ou-commencer",
} as const;

// FAQ visible et FAQPage (JSON-LD) : des réponses complètes, citables telles
// quelles par un moteur de recherche ou une IA, sans dépendre du reste de la page.
export const kitFaqTitle = "Vos questions avant de vous lancer";

export const kitFaq: FaqItem[] = [
  {
    question: "Peut-on créer une application sans savoir coder ?",
    answer:
      "Oui. Une IA comme Claude écrit le code d’un outil de gestion, d’un espace client ou d’un premier produit. Ce qui bloque, c’est tout le reste : le dépôt de code, l’hébergement, la base de données, le nom de domaine. Le kit de démarrage liste ces étapes dans l’ordre.",
  },
  {
    question: "Quels outils faut-il pour mettre une application en ligne ?",
    answer:
      "Six briques suffisent pour un premier outil : Claude Code pour écrire le code, GitHub pour le ranger, Vercel pour l’hébergement, Supabase pour la base de données et les comptes utilisateurs (en région européenne), Resend pour les emails, et un nom de domaine réservé chez OVH ou Cloudflare. Ajoutez Stripe le jour où vous encaissez des paiements.",
  },
  {
    question: "Combien ça coûte par mois de faire tourner un premier outil ?",
    answer:
      "Comptez 20 à 70 €/mois : environ 20 € pour l’IA qui écrit le code, 0 € pour ranger le code sur GitHub, 0 à 20 € pour l’hébergement, 0 à 25 € pour la base de données et les comptes, et 10 à 15 € par an pour le nom de domaine. Encaisser des paiements n’ajoute pas d’abonnement, mais 1,5 à 3 % par transaction. Ce sont des ordres de grandeur, prix publics à vérifier au moment de vous lancer. Un outil qui sert des centaines de personnes monte plutôt à 100 à 200 €/mois.",
  },
  {
    question: "Combien de temps faut-il pour tout installer ?",
    answer:
      "Comptez deux à trois heures de manipulations, réparties sur deux jours : les comptes se créent en une soirée, mais un nom de domaine met parfois 24 h à répondre partout, et un compte d’encaissement demande un à deux jours de vérification. La construction de l’outil lui-même dépend de votre projet.",
  },
  {
    question: "Faut-il quand même un développeur ?",
    answer:
      "Pas pour démarrer. Le kit et une IA vous mènent jusqu’à la mise en ligne, et beaucoup de premiers outils tiennent très bien comme ça. Le jour où l’outil devient critique, un œil expert évite des erreurs coûteuses : il encaisse des paiements, il porte des données clients, il se branche sur vos logiciels métier. Une clé mal rangée ou une donnée écrasée se répare, mais toujours plus cher qu’une relecture avant. C’est exactement le métier de Coucou IA.",
  },
  {
    question: "Le kit de démarrage est-il gratuit ?",
    answer:
      "Oui. Vous répondez à une dizaine de questions, vous voyez tout de suite les premières briques, et le kit complet s’ouvre contre votre email : la liste des étapes, les coûts, les points de vigilance et le prompt à coller dans Claude. Notre métier commence après, quand votre outil doit tenir en production.",
  },
  {
    question: "Pourquoi l’IA ne fait-elle pas tout, justement ?",
    answer:
      "Une IA écrit du code mais ne clique pas à votre place : elle ne crée pas vos comptes, ne paie pas votre nom de domaine, ne range pas vos clés d’accès. Le kit détaille ces gestes dans l’ordre, avec le piège à éviter à chaque étape.",
  },
];

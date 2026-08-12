// Pages agents IA grand public (/agents-ia/[slug]). Décryptage honnête d’outils
// open source que les dirigeants entendent citer (OpenClaw, Hermes Agent) : ce
// qu’ils font, ce qu’ils coûtent, ce qui doit alerter une PME avant de les
// installer. Coucou IA n’est pas concurrent de ces outils : je les déploie et
// je les sécurise. Aucun prix Coucou IA ici, seulement le coût réel de l’outil.
// Coucou IA est unipersonnelle : « je », jamais « notre équipe ».
// Slugs verrouillés : openclaw, hermes-agent.

import type { FaqItem } from "@/content/secteurs";

export type AgentFact = {
  label: string;
  value: string;
};

export type AgentPoint = {
  title: string;
  body: string;
};

// Bloc offre « On vous l’installe », placé après l’analyse. Vend l’installation
// sans casser le ton décryptage : `honest` dit quand NE PAS installer.
export type AgentOffer = {
  title: string;
  intro: string;
  // Ce que l’installation comprend, concret, sans prix.
  items: string[];
  // La phrase honnête : quand l’outil n’est pas la bonne réponse.
  honest: string;
};

export type AgentPage = {
  slug: string;
  // Nom court : cartes du hub, breadcrumb, liens croisés.
  name: string;
  hubTitle: string;
  hubDescription: string;
  // ≤ 60 caractères, « | Coucou IA » compris.
  metaTitle: string;
  // ~150 caractères, mots-clés en tête.
  metaDescription: string;
  h1: string;
  intro: string;
  // Le verdict en 30 secondes : honnête, y compris quand l’outil ne convient pas.
  verdict: string;
  // Fiche d’identité : jamais de prix Coucou IA, seulement le coût de l’outil.
  facts: AgentFact[];
  // 3 forces concrètes.
  strengths: AgentPoint[];
  // 3 ou 4 risques concrets, pas des généralités.
  risks: AgentPoint[];
  // Quand ça a du sens pour une PME, avec des cas réels.
  forWho: { title: string; body: string; cases: string[] };
  // Bloc offre installation. Optionnel : une page sans offre reste pur décryptage.
  offer?: AgentOffer;
  // 4 questions Google-style. Alimente le JSON-LD FAQPage.
  faq: FaqItem[];
};

// Copie transverse du gabarit agents. Structurelle, jamais spécifique à une page.
export const agentsCopy = {
  verdictLabel: "Le verdict en 30 secondes",
  factsTitle: "Fiche d’identité",
  strengthsTitle: "Ce qui marche vraiment",
  risksTitle: "Ce qui doit vous alerter",
  forWhoDefaultTitle: "Quand ça a du sens pour une PME",
  offerLabel: "On vous l’installe",
  crossLinkHeading: "Aller plus loin",
  compareLinkName: "OpenClaw ou Hermes Agent : le comparatif complet",
  compareLinkHref: "/blog/openclaw-vs-hermes-agent",
} as const;

// Copie du hub /agents-ia.
export const agentsHub = {
  metaTitle: "OpenClaw, Hermes Agent : avis et installation | Coucou IA",
  metaDescription:
    "OpenClaw et Hermes Agent décryptés pour les PME : forces, risques de sécurité, RGPD. Et si l’outil tient la route, on vous l’installe. Échange gratuit.",
  h1: "OpenClaw, Hermes Agent : ce qu’il faut savoir avant d’installer un agent IA",
  intro:
    "Ces deux agents IA open source font parler d’eux, et quelqu’un chez vous les a peut-être déjà testés. Voici, sans jargon, ce qu’ils font vraiment, ce qu’ils coûtent, et ce qui doit vous alerter. Et quand l’un d’eux tient la route chez vous, on l’installe : cadré, sécurisé, réversible.",
};

export const agents: AgentPage[] = [
  {
    slug: "openclaw",
    name: "OpenClaw",
    hubTitle: "OpenClaw : l’assistant IA qui se pilote depuis WhatsApp",
    hubDescription:
      "Open source, gratuit, l’une des croissances les plus rapides de l’histoire de GitHub. Aussi l’une des plus exposées côté sécurité sans les bons garde-fous.",
    metaTitle: "OpenClaw : avis, risques et sécurité PME | Coucou IA",
    metaDescription:
      "OpenClaw (ex-Clawdbot) : assistant IA open source auto-hébergé, piloté depuis WhatsApp. Avis, risques de sécurité, RGPD, coûts réels. Échange gratuit.",
    h1: "OpenClaw : l’assistant IA qui se pilote depuis WhatsApp",
    intro:
      "OpenClaw s’auto-héberge sur votre serveur et se pilote depuis WhatsApp, Telegram, Slack ou Discord, avec votre propre clé API. Il a connu l’une des croissances les plus rapides de l’histoire de GitHub. Voici ce qu’il fait vraiment, et ce qui doit vous arrêter avant de l’installer sans y réfléchir.",
    verdict:
      "OpenClaw est un projet impressionnant : gratuit, open source, et franchement puissant. Il exécute des commandes, lit et écrit des fichiers, navigue sur le web depuis une simple conversation WhatsApp. C’est exactement ce qui en fait un risque en entreprise sans garde-fous : début 2026, des chercheurs en sécurité ont recensé des dizaines de milliers d’instances exposées sur internet, avec des vulnérabilités d’injection de prompt documentées. Aucune certification, pas d’accord de traitement des données : la conformité RGPD repose entièrement sur vous. Avant d’y connecter la moindre donnée d’entreprise, je pose le cadre : serveur isolé, accès limités, supervision humaine. C’est le travail que je fais avant d’installer OpenClaw chez un client.",
    facts: [
      { label: "Éditeur", value: "Peter Steinberger, créateur du projet ; confié à une fondation à but non lucratif en juillet 2026" },
      { label: "Licence", value: "MIT (open source), conservée après le passage en fondation" },
      { label: "Lancement", value: "Fin 2025 sous le nom Clawdbot, renommé OpenClaw début 2026" },
      { label: "Hébergement", value: "Auto-hébergé sur votre serveur, piloté depuis WhatsApp, Telegram, Slack ou Discord" },
      { label: "Ce que ça coûte", value: "Logiciel gratuit : restent le serveur et l’API du modèle (Claude, OpenAI ou un modèle local)" },
    ],
    strengths: [
      {
        title: "Open source et gratuit",
        body: "Licence MIT, aucun abonnement, le code reste sous vos yeux. Vous ne dépendez pas d’un éditeur qui change ses conditions du jour au lendemain.",
      },
      {
        title: "Multi-canal, sans nouvelle interface",
        body: "Il se pilote depuis WhatsApp, Telegram, Slack ou Discord : vos équipes n’ont pas d’outil supplémentaire à apprendre.",
      },
      {
        title: "Une croissance qui ne trompe pas",
        body: "Plus de 100 000 étoiles sur GitHub la première semaine, rapporté par la presse américaine : une communauté large, des correctifs et des idées qui avancent vite.",
      },
    ],
    risks: [
      {
        title: "Trop souvent exposé sur internet",
        body: "Début 2026, des chercheurs en sécurité ont recensé des dizaines de milliers d’instances OpenClaw accessibles depuis internet, faute d’être correctement isolées.",
      },
      {
        title: "L’injection de prompt, un risque réel",
        body: "Des vulnérabilités documentées permettent de détourner l’agent via un contenu piégé qu’il lit sur le web ou dans un fichier. Un agent qui exécute des commandes rend ce risque concret.",
      },
      {
        title: "Une place de marché sans contrôle",
        body: "ClawHub, la place de marché de compétences pour OpenClaw, ne soumet pas systématiquement ce qu’elle distribue à un contrôle. Vous ne savez pas toujours ce que vous installez.",
      },
      {
        title: "La conformité repose entièrement sur vous",
        body: "Aucune certification (SOC 2, ISO 27001), pas d’accord de traitement des données. Et les versions très fréquentes apportent leur lot de ruptures de compatibilité : la maintenance est réelle.",
      },
    ],
    forWho: {
      title: "Quand OpenClaw a du sens pour une PME",
      body: "OpenClaw n’est pas à écarter, il demande d’être posé correctement. Voici les situations où il trouve sa place.",
      cases: [
        "Vous avez une personne technique en interne capable d’isoler un serveur, de limiter les accès et de suivre les mises à jour.",
        "Le périmètre est délibérément restreint : une tâche précise, sur des données non sensibles, avec supervision humaine des actions engagées.",
        "Vous voulez tester ce qu’un agent IA rend possible avant d’en faire un usage plus large, dans un environnement dédié et surveillé.",
      ],
    },
    offer: {
      title: "OpenClaw installé, cadré et sécurisé en une semaine",
      intro:
        "Tout ce que cette page décrit, risques compris, c’est la liste de ce qu’on règle avant de vous le confier. En une semaine, OpenClaw tourne chez vous, dans un cadre écrit.",
      items: [
        "Hébergement européen sur un serveur dédié, jamais exposé sur internet.",
        "Périmètre et règles écrits avec vous : les instructions et la mémoire de l’assistant.",
        "Connexion à vos canaux : WhatsApp, Slack, ceux que vos équipes utilisent déjà.",
        "Validation humaine sur les actions sensibles : rien d’engageant ne part sans votre accord.",
        "Transfert de compétences à la fin : open source et réversible, vous restez propriétaire de tout.",
      ],
      honest:
        "Et si votre besoin tient dans une automatisation simple, on vous le dira au point de départ : inutile d’héberger un agent pour ça.",
    },
    faq: [
      {
        question: "OpenClaw est-il sûr pour une entreprise ?",
        answer:
          "Pas tel quel. C’est un outil puissant, open source et gratuit, mais début 2026 des chercheurs ont recensé des dizaines de milliers d’instances mal sécurisées et exposées sur internet, avec des vulnérabilités d’injection de prompt documentées. Sans serveur isolé, accès limités et supervision humaine, c’est un risque réel en entreprise.",
      },
      {
        question: "Qu’est-ce qu’OpenClaw, l’ex-Clawdbot ?",
        answer:
          "OpenClaw est un assistant IA personnel open source, lancé fin 2025 sous le nom Clawdbot par Peter Steinberger puis renommé début 2026. Il s’auto-héberge sur votre serveur et se pilote depuis WhatsApp, Telegram, Slack ou Discord, avec votre propre clé API.",
      },
      {
        question: "Combien coûte OpenClaw ?",
        answer:
          "Le logiciel est gratuit, licence MIT. Ce qui reste à votre charge : le serveur qui l’héberge et l’API du modèle que vous connectez, que ce soit Claude, OpenAI ou un modèle local.",
      },
      {
        question: "OpenClaw est-il conforme au RGPD ?",
        answer:
          "Aucune certification (SOC 2, ISO 27001) et aucun accord de traitement des données n’accompagne le projet : la conformité RGPD repose entièrement sur vous, sur la manière dont vous l’hébergez et sur les données que vous lui donnez à traiter.",
      },
    ],
  },
  {
    slug: "hermes-agent",
    name: "Hermes Agent",
    hubTitle: "Hermes Agent : l’IA qui écrit ses propres compétences",
    hubDescription:
      "Une base open source pour construire des agents, qui apprend en travaillant. Prometteur, encore jeune : la supervision humaine reste indispensable.",
    metaTitle: "Hermes Agent : avis, risques et coûts PME | Coucou IA",
    metaDescription:
      "Hermes Agent (Nous Research) : agent IA open source qui écrit ses propres compétences. Avis, limites de jeunesse, RGPD, coûts réels. Échange gratuit.",
    h1: "Hermes Agent : l’IA qui écrit ses propres compétences",
    intro:
      "Hermes Agent est une base open source pour construire des agents, publiée par Nous Research début 2026. Sa particularité : il écrit ses propres compétences réutilisables après chaque tâche et s’améliore avec l’usage. Voici ce qu’il fait vraiment, et pourquoi la supervision humaine reste indispensable.",
    verdict:
      "Hermes Agent est l’un des projets les plus intéressants du moment : auto-hébergé, multi-canal, et surtout capable d’écrire ses propres compétences réutilisables au fil des tâches. L’adoption a été très rapide en 2026, portée par une grosse mise à jour début août (voix en temps réel, communication d’agent à agent, recherche avec sources vérifiables). Mais c’est un logiciel jeune, encore en versions 0.x : pas de stabilité assurée entre deux mises à jour, documentation incomplète, aucun journal d’audit structuré. Et si personne ne relit les compétences qu’il s’écrit lui-même, une erreur peut se répéter à chaque usage. Avant de le brancher sur vos process, je pose la supervision qui manque : relecture des compétences, données en local, obligations RGPD posées noir sur blanc.",
    facts: [
      { label: "Éditeur", value: "Nous Research" },
      { label: "Licence", value: "MIT (open source)" },
      { label: "Lancement", value: "Février 2026" },
      { label: "Hébergement", value: "Auto-hébergé, multi-canal : Telegram, Slack, WhatsApp, ligne de commande" },
      { label: "Ce que ça coûte", value: "Logiciel gratuit : restent le serveur et l’API du modèle" },
    ],
    strengths: [
      {
        title: "Il apprend en travaillant",
        body: "Après chaque tâche, Hermes Agent écrit une compétence réutilisable et s’améliore avec l’usage : plus il tourne, plus il devient efficace sur vos cas concrets.",
      },
      {
        title: "Gratuit et multi-canal",
        body: "Licence MIT, aucun abonnement. Il se pilote depuis Telegram, Slack, WhatsApp ou en ligne de commande, selon vos habitudes.",
      },
      {
        title: "Un projet qui avance vite",
        body: "Début août 2026, une grosse mise à jour a ajouté la voix en temps réel, la communication d’agent à agent et la recherche avec sources vérifiables : le rythme d’évolution est soutenu.",
      },
    ],
    risks: [
      {
        title: "Un logiciel encore jeune",
        body: "Hermes Agent tourne en versions 0.x, sans stabilité assurée entre deux mises à jour. Ce qui fonctionne aujourd’hui peut changer demain.",
      },
      {
        title: "Documentation incomplète",
        body: "Beaucoup de zones d’ombre se découvrent en marchant, pas dans un guide. Ça ralentit la mise en place.",
      },
      {
        title: "Des compétences auto-écrites, sans relecture par défaut",
        body: "L’agent écrit lui-même ses compétences réutilisables. Une erreur codée une fois peut se répéter à chaque usage si personne ne la relit.",
      },
      {
        title: "Pas de journal d’audit structuré",
        body: "Difficile de tracer précisément ce que l’agent a fait et pourquoi. La supervision humaine n’est pas une option, elle est indispensable.",
      },
    ],
    forWho: {
      title: "Quand Hermes Agent a du sens pour une PME",
      body: "C’est un outil jeune et prometteur, pas encore taillé pour tourner seul en production. Voici où il trouve sa place aujourd’hui.",
      cases: [
        "Vous voulez explorer ce qu’un agent qui apprend en marchant peut faire sur des tâches répétitives, avec une personne qui relit ses compétences.",
        "Les données traitées ne sont pas sensibles, ou restent en local par défaut avec un accord de traitement posé avec le fournisseur du modèle.",
        "Vous acceptez le rythme d’un logiciel jeune : suivre les versions, tester avant de généraliser, garder quelqu’un aux commandes.",
      ],
    },
    offer: {
      title: "Un premier périmètre en production en 3 semaines",
      intro:
        "Un logiciel jeune se déploie petit. On commence par un seul périmètre, mis en production en 3 semaines, avec la supervision que l’outil n’apporte pas tout seul.",
      items: [
        "Un cas d’usage unique, choisi avec vous, pas dix chantiers en parallèle.",
        "Garde-fous et validations définis avant toute action : l’agent ne décide jamais seul sur ce qui compte.",
        "Tests sur vos cas réels avant la mise en production.",
        "Documentation remise à la fin : vous savez ce qui tourne, comment et pourquoi.",
      ],
      honest:
        "Et si une automatisation simple suffit chez vous, on vous le dira au point de départ : pas besoin d’un agent pour ça.",
    },
    faq: [
      {
        question: "Qu’est-ce qu’Hermes Agent ?",
        answer:
          "Hermes Agent est une base open source pour construire des agents IA, publiée par Nous Research en février 2026. Auto-hébergé et multi-canal (Telegram, Slack, WhatsApp, ligne de commande), il a la particularité d’écrire ses propres compétences réutilisables après chaque tâche et de s’améliorer avec l’usage.",
      },
      {
        question: "Hermes Agent est-il fiable pour une entreprise ?",
        answer:
          "C’est un logiciel jeune, en versions 0.x, sans stabilité assurée entre deux mises à jour et avec une documentation incomplète. Les compétences qu’il s’écrit lui-même doivent être relues : sans supervision humaine, une erreur peut se répéter à chaque usage.",
      },
      {
        question: "Combien coûte Hermes Agent ?",
        answer:
          "Le logiciel est gratuit, licence MIT. Restent à votre charge le serveur qui l’héberge et l’API du modèle que vous connectez.",
      },
      {
        question: "Hermes Agent est-il conforme au RGPD ?",
        answer:
          "Les données restent en local par défaut, ce qui est un bon point de départ. Mais les obligations qui vont avec, la durée de conservation et l’accord de traitement des données avec le fournisseur du modèle, restent entièrement à votre charge.",
      },
    ],
  },
];

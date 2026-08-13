// Article 2 du blog. Voir .agents/blog.md : « je », aucun prix, chiffres réels
// ou étiquetés illustration, maillage interne obligatoire dans le corps.

import type { BlogArticle } from "@/content/blog";

export const openclawVsHermesAgent: BlogArticle = {
  slug: "openclaw-vs-hermes-agent",
  title: "OpenClaw ou Hermes Agent : lequel installer dans votre PME ?",
  metaTitle: "OpenClaw, Hermes Agent : lequel pour une PME | Coucou IA",
  metaDescription:
    "OpenClaw ou Hermes Agent pour votre PME ? Ce que ces agents IA open source font vraiment, leurs limites, et la question à poser avant d'installer.",
  category: "décryptage",
  publishedAt: "2026-08-07",
  lede: "OpenClaw et Hermes Agent reviennent dans toutes les conversations de dirigeants en ce moment. La question utile : quel problème de votre entreprise vaut un agent, et avec quels garde-fous ?",
  keyTakeaways: [
    "OpenClaw et Hermes Agent sont deux agents IA open source et gratuits à installer : ce qui coûte, c'est le serveur, l'accès au modèle et la surveillance dans la durée, jamais le logiciel lui-même.",
    "OpenClaw exécute des commandes, lit et écrit des fichiers, navigue sur le web depuis WhatsApp ou Slack : puissant, donc risqué si personne ne ferme la porte derrière lui.",
    "Hermes Agent écrit ses propres compétences après chaque tâche et s'améliore avec l'usage, mais c'est un logiciel jeune, en version 0.x, sans stabilité assurée.",
    "Aucun des deux ne remplace un business case : le choix de l'outil vient après la mesure du problème, jamais avant.",
  ],
  blocks: [
    {
      kind: "p",
      text: "Impossible d'ouvrir LinkedIn sans tomber dessus : quelqu'un a installé OpenClaw sur son Mac le week-end dernier, un autre ne jure que par Hermes Agent, et la question qu'on me pose est toujours la même : lequel choisir ? Elle part du mauvais bout.",
    },
    {
      kind: "h2",
      id: "deux-agents-open-source",
      text: "Deux agents open source, deux philosophies",
    },
    {
      kind: "p",
      text: "**OpenClaw** est un assistant IA personnel open source, sous licence MIT. Il est né fin 2025 sous le nom Clawdbot, créé par Peter Steinberger, puis renommé OpenClaw début 2026. Vous l'installez sur votre propre serveur et vous le pilotez depuis WhatsApp, Telegram, Slack ou Discord, avec votre propre clé API (Claude, OpenAI ou un modèle installé chez vous).",
    },
    {
      kind: "p",
      text: "Sa croissance a été parmi les plus rapides de l'histoire de GitHub : plus de 100 000 étoiles la première semaine, rapporté par la presse américaine. Son créateur a été embauché par OpenAI en février 2026, et le projet a été confié à une fondation à but non lucratif en juillet 2026, licence MIT conservée. C'est ce succès qui alimente les conversations que vous entendez.",
    },
    {
      kind: "p",
      text: "**Hermes Agent** est une base open source pour construire des agents (MIT), publiée par Nous Research en février 2026. Lui aussi s'auto-héberge et parle sur plusieurs canaux : Telegram, Slack, WhatsApp, ligne de commande. Sa particularité tient en une phrase : l'agent écrit ses propres compétences réutilisables après chaque tâche, et s'améliore avec l'usage, sans que vous ayez à le reprogrammer.",
    },
    {
      kind: "p",
      text: "Son adoption a été rapide en 2026, avec une mise à jour importante début août : voix en temps réel, communication d'agent à agent, recherche avec sources vérifiables. Les deux outils sont gratuits à télécharger. Ce qui reste à votre charge, dans les deux cas, c'est le serveur qui les fait tourner et l'accès au modèle de langage qu'ils appellent.",
    },
    {
      kind: "h2",
      id: "ce-quils-font-vraiment",
      text: "Ce qu'ils font vraiment, et ce que ça implique",
    },
    {
      kind: "p",
      text: "OpenClaw exécute des commandes sur votre machine, lit et écrit des fichiers, navigue sur le web pour vous. Demandez-lui de réserver un billet, de trier un dossier, de répondre à un message : il le fait, sans repasser par vous à chaque étape. C'est exactement ce qui le rend utile, et exactement ce qui le rend risqué.",
    },
    {
      kind: "p",
      text: "Début 2026, des chercheurs en sécurité ont recensé des dizaines de milliers d'instances OpenClaw exposées directement sur internet, et des vulnérabilités d'injection de prompt sont documentées : un texte piégé, lu par l'agent, peut lui faire exécuter une action que personne n'a demandée. Sa place de marché de compétences, ClawHub, n'a pas de contrôle systématique sur ce qui y est publié.",
    },
    {
      kind: "callout",
      title: "Ce qu'OpenClaw ne vous donne pas",
      body: "Aucune certification (SOC 2, ISO 27001), aucun accord de traitement des données. La conformité RGPD repose entièrement sur vous. Ajoutez un rythme de versions effréné, avec des changements cassants fréquents : la maintenance devient un vrai poste de dépense.",
    },
    {
      kind: "p",
      text: "Hermes Agent pose un autre type de question. Le principe de compétences auto-écrites est séduisant : l'agent capitalise sur ce qu'il a appris, sans intervention humaine. Mais c'est aussi le risque : si une compétence encode une erreur et que personne ne la relit, l'agent la répète, plus vite qu'un humain ne l'aurait fait.",
    },
    {
      kind: "p",
      text: "C'est un logiciel jeune, encore en versions 0.x, sans stabilité assurée et avec une documentation incomplète. Il n'a pas de journal d'audit structuré pour retracer ce que l'agent a fait et pourquoi. Dans les deux cas, la supervision humaine est la condition pour que l'outil reste sous contrôle.",
    },
    {
      kind: "h2",
      id: "la-bonne-question",
      text: "La bonne question n'est pas lequel installer",
    },
    {
      kind: "p",
      text: "Un dirigeant qui me demande « OpenClaw ou Hermes Agent » a déjà sauté une étape. Ces deux outils sont des **agents génériques** : ils peuvent, en théorie, toucher à peu près n'importe quelle tâche sur un ordinateur. C'est justement ce qui les rend impossibles à évaluer dans l'abstrait, hors d'un cas précis chez vous.",
    },
    {
      kind: "p",
      text: "La question utile ressemble à celle que je pose pour tout projet IA : quelle tâche répétitive, chez vous, coûte assez cher en temps pour justifier qu'on y mette un agent, avec la surveillance que ça implique ? Si vous n'avez pas encore chiffré cette tâche, la [méthode pour chiffrer un projet IA avant de l'engager](/blog/business-case-ia) vient avant le choix de l'outil.",
    },
    {
      kind: "stat",
      label: "Prix du logiciel, dans les deux cas",
      value: "0 €",
      caption:
        "Le vrai coût est ailleurs : le serveur, l'usage du modèle et la surveillance humaine. C'est lui qu'un business case chiffre.",
    },
    {
      kind: "p",
      text: "Installer un agent générique sur un poste de travail sans cadre, c'est reproduire à la maison ce que j'ai vu chez des équipes qui utilisaient déjà ChatGPT sans règle claire : de la valeur réelle, mais aucune visibilité sur ce qui a été fait, avec quelles données, et par qui. Un agent qui écrit des fichiers et navigue sur le web mérite au minimum les mêmes garde-fous qu'un nouvel employé : un périmètre défini, des accès limités, une relecture régulière.",
    },
    {
      kind: "h2",
      id: "les-garde-fous-avant-installation",
      text: "Les garde-fous avant d'installer quoi que ce soit",
    },
    {
      kind: "p",
      text: "Si le business case tient et que vous voulez tester l'un de ces deux outils, quelques règles réduisent le risque sans annuler l'intérêt :",
    },
    {
      kind: "list",
      items: [
        "Un serveur dédié, jamais un poste de travail relié à vos outils sensibles.",
        "Des accès limités : l'agent ne touche que les fichiers et comptes strictement nécessaires à la tâche visée.",
        "Une clé API séparée, avec un plafond de dépense, pour repérer un usage anormal tout de suite.",
        "Une relecture humaine systématique des premières semaines, avant de laisser l'agent agir seul.",
        "Un point mensuel sur les versions installées : les deux projets changent vite, une mise à jour non lue est une porte ouverte.",
      ],
    },
    {
      kind: "p",
      text: "Ces règles ne sont pas propres à OpenClaw ou Hermes Agent : elles s'appliquent à tout agent IA autonome, qu'il vienne d'un projet open source ou d'un éditeur qui publie un prix. La différence, avec ces deux outils, c'est qu'aucune structure ne les applique à votre place. C'est écrit noir sur blanc dans leurs propres limites : pas de certification pour l'un, pas de stabilité assurée pour l'autre.",
    },
    {
      kind: "h2",
      id: "openclaw-hermes-ou-autre-chose",
      text: "OpenClaw, Hermes Agent, ou autre chose",
    },
    {
      kind: "p",
      text: "Il existe une troisième option que peu de dirigeants envisagent : ne rien installer, et se poser d'abord la question du bon niveau d'outil. Un agent générique auto-hébergé n'est pas toujours la réponse. Parfois une automatisation simple suffit, parfois [ChatGPT seul](/comparaison/chatgpt-seul) couvre déjà le besoin sans qu'il faille héberger quoi que ce soit chez vous.",
    },
    {
      kind: "p",
      text: "Je détaille [OpenClaw](/agents-ia/openclaw) et [Hermes Agent](/agents-ia/hermes-agent) chacun sur sa propre page, avec leurs cas d'usage précis. Si vous voulez d'abord clarifier où un agent IA a du sens chez vous, avant même de comparer des outils, la [grille par où commencer](/outils/par-ou-commencer) fait ce tri en quelques minutes.",
    },
    {
      kind: "p",
      text: "Ces deux projets ne vont pas disparaître, et d'autres suivront avec les mêmes promesses. Ce qui ne change pas, c'est l'ordre des questions : le problème d'abord, chiffré, puis l'outil, puis les garde-fous. Si vous voulez passer cet ordre en revue pour votre entreprise, le point de départ existe pour ça.",
    },
  ],
  faq: [
    {
      question: "OpenClaw est-il sûr pour une entreprise ?",
      answer:
        "Pas tel quel, sans garde-fous. OpenClaw exécute des commandes et navigue sur le web avec les accès qu'on lui donne : début 2026, des chercheurs en sécurité ont recensé des dizaines de milliers d'instances exposées sur internet, et des vulnérabilités d'injection de prompt sont documentées. Il n'a ni certification ni accord de traitement des données : la conformité repose sur vous, avec un serveur dédié, des accès limités et une relecture humaine régulière.",
    },
    {
      question: "C'est quoi Hermes Agent ?",
      answer:
        "Une base open source pour construire des agents IA (licence MIT), publiée par Nous Research en février 2026. Vous l'hébergez vous-même et le pilotez depuis Telegram, Slack, WhatsApp ou la ligne de commande. Sa particularité : il écrit ses propres compétences réutilisables après chaque tâche et s'améliore avec l'usage. C'est un logiciel jeune, encore en versions 0.x, sans stabilité assurée.",
    },
    {
      question: "OpenClaw et Hermes Agent sont-ils gratuits ?",
      answer:
        "Le logiciel oui, les deux sont open source et gratuits à télécharger. Ce qui reste à votre charge : le serveur qui les héberge et l'usage de l'API du modèle de langage qu'ils appellent (Claude, OpenAI ou un modèle local). Comptez aussi le temps de surveillance et de mise à jour, un poste réel une fois l'agent en production.",
    },
    {
      question: "Faut-il un agent IA générique dans une PME ?",
      answer:
        "Pas avant d'avoir chiffré la tâche visée. Un agent générique peut, en théorie, toucher à presque tout : c'est justement ce qui rend l'outil impossible à juger hors d'un cas précis. Mesurez d'abord le temps que la tâche vous coûte aujourd'hui, ce qu'elle coûtera après, et le coût de la mise en production, avant de choisir l'outil.",
    },
  ],
  relatedArticles: [
    "agent-ia-production-lecons",
    "business-case-ia",
    "ai-act-pme-obligations",
  ],
  relatedCasUsage: ["assistant-support-client", "traitement-documents"],
  relatedSecteurs: [],
};

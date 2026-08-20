// Article 8 du blog. Voir .agents/blog.md : « je », aucun prix, chiffres réels
// ou étiquetés illustration, maillage interne obligatoire dans le corps.

import type { BlogArticle } from "@/content/blog";

export const charteIaEntreprise: BlogArticle = {
  slug: "charte-ia-entreprise",
  title: "Charte IA d’entreprise : les 8 décisions à trancher, et le modèle",
  metaTitle: "Charte IA en entreprise : le guide et le modèle | Coucou IA",
  metaDescription:
    "Charte IA en entreprise : les huit décisions à trancher, la procédure qui la rend opposable, et un modèle à télécharger sans formulaire ni e-mail.",
  category: "méthode",
  publishedAt: "2026-08-20",
  lede: "Une charte IA est le document interne qui dit qui peut utiliser quels outils d’IA, sur quelles données, et ce qui doit être relu par un humain avant de sortir. La plupart des PME n’en ont pas, et leurs équipes ont déjà tranché la question à leur place.",
  keyTakeaways: [
    "Une charte IA est le document interne qui dit qui peut utiliser quels outils d’IA, sur quelles données, et ce qui doit être relu par un humain avant de sortir.",
    "Une charte qui prévoit des sanctions suit la même procédure que le règlement intérieur : consultation du CSE, transmission à l’inspection du travail, dépôt au greffe et affichage, avec un délai d’un mois avant d’entrer en vigueur.",
    "Une charte de PME tranche huit décisions concrètes, de qui a le droit d’utiliser l’IA jusqu’à qui la met à jour et à quelle fréquence.",
    "Aucun texte n’impose nommément une charte IA, mais le RGPD, l’article 4 de l’AI Act et le droit du travail rendent la question difficile à éviter.",
  ],
  blocks: [
    {
      kind: "p",
      text: "Le 21 mai 2026, la cour d’appel de Paris a confirmé la suspension d’un assistant d’intelligence artificielle interne chez un éditeur de presse professionnelle, le groupe Le Moniteur. Motif : l’outil avait été déployé sans consulter le comité social et économique. Cette décision dit une chose simple : mettre un outil d’IA entre les mains de vos salariés est un choix qui s’encadre.",
    },
    { kind: "h2", id: "pourquoi-une-charte", text: "Ce qu’une charte IA décide vraiment" },
    {
      kind: "p",
      text: "Une charte IA est le document interne qui dit qui peut utiliser quels outils d’IA, sur quelles données, et ce qui doit être relu par un humain avant de sortir. Elle pose par écrit des règles qui, sans elle, restent dans la tête d’un seul dirigeant, ou nulle part.",
    },
    {
      kind: "p",
      text: "Cas illustratif, sans nom de client : dans une agence immobilière de 24 salariés, une bonne moitié des négociateurs colle déjà des mandats et des échanges clients dans ChatGPT pour rédiger les annonces et préparer les relances. Personne n’a validé cet usage. Personne ne l’a non plus interdit. Le dirigeant l’a découvert en relisant une annonce qui reprenait, mot pour mot, une clause confidentielle d’un compromis de vente.",
    },
    {
      kind: "p",
      text: "L’IA générative est entrée par la porte de service dans la plupart des PME. Une charte décide comment ça se passe à partir de maintenant, et qui répond de quoi.",
    },
    { kind: "h2", id: "obligatoire-ou-pas", text: "Obligatoire, ou seulement difficile à éviter ?" },
    {
      kind: "p",
      text: "Aucun texte de loi n’écrit le mot « charte IA ». Vous pouvez chercher, vous ne trouverez pas d’article qui l’impose nommément. Trois textes rendent pourtant la question difficile à éviter.",
    },
    {
      kind: "p",
      text: "Le RGPD d’abord : saisir des données personnelles dans une IA générative reste un traitement de données, avec les mêmes obligations que n’importe quel autre logiciel. La CNIL recommande de fixer la liste des outils autorisés, les données qu’on n’y met jamais, et les usages permis.",
    },
    {
      kind: "p",
      text: "L’article 4 de l’AI Act ensuite, en vigueur depuis le 2 février 2025 : il impose à toute entreprise qui fournit ou utilise de l’IA de veiller à ce que son personnel dispose d’un niveau suffisant de maîtrise de l’IA. Aucun seuil de taille n’exempte personne. Aucun format n’est imposé non plus, mais l’obligation doit être prouvable. J’en détaille le contenu dans [cet article sur l’AI Act pour une PME](/blog/ai-act-pme-obligations).",
    },
    {
      kind: "stat",
      label: "AI Act, article 4",
      value: "2 février 2025",
      caption:
        "Date d’entrée en vigueur de l’obligation de maîtrise de l’IA, pour tout fournisseur et déployeur, sans seuil de taille ni certification imposée.",
    },
    {
      kind: "p",
      text: "Le droit du travail enfin, par un chemin détourné : mettre un outil d’IA à disposition des salariés est une introduction de nouvelle technologie au sens de l’article L2312-8 du Code du travail, et cette introduction se consulte avec le CSE avant le déploiement, comme l’a rappelé la cour d’appel de Paris en mai 2026.",
    },
    { kind: "h2", id: "les-huit-decisions", text: "Les huit décisions qu’une charte IA doit trancher" },
    {
      kind: "p",
      text: "Chacune de ces huit décisions est un arbitrage, et chacune engage le dirigeant qui la pose.",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "Qui a le droit d’utiliser l’IA, et pour quoi faire précisément.",
        "Quels outils sont approuvés, et lesquels sont interdits, nommément.",
        "Quelles données ne rentrent jamais dans une IA, sous aucun prétexte.",
        "Ce qui doit être relu par un humain avant de sortir de l’entreprise.",
        "Ce qu’on dit au client quand une IA a participé au travail rendu.",
        "Qui répond quand la sortie de l’IA est fausse.",
        "Qui forme les équipes, et comment on le prouve le jour où on vous le demande.",
        "Qui met la charte à jour, et à quelle fréquence.",
      ],
    },
    {
      kind: "p",
      text: "Sur la décision des outils approuvés, la question centrale est de savoir ce que couvre vraiment l’outil que vos équipes utilisent déjà. [Ce que ChatGPT seul couvre](/comparaison/chatgpt-seul) donne une base pour trancher entre le garder tel quel, l’encadrer, ou le compléter.",
    },
    {
      kind: "p",
      text: "La décision qui coûte le plus cher si vous la ratez : quelles données ne rentrent jamais dans une IA. Coordonnées et messages de clients identifiables, données de santé, données de vos salariés, tout ce qui est confidentiel par contrat. La question qui suit tout de suite est celle de l’hébergement : un modèle grand public garde vos échanges quelque part, souvent hors de France. C’est là que la question d’[une IA souveraine](/glossaire/ia-souveraine) devient concrète, au moment de choisir l’outil.",
    },
    {
      kind: "p",
      text: "La décision sur la relecture humaine est celle qu’on oublie le plus vite parce qu’elle ralentit. Un texte généré peut affirmer un fait qui n’existe pas avec la même assurance qu’un fait vérifié : c’est ce qu’on appelle une [hallucination](/glossaire/hallucination). La charte doit dire, métier par métier, ce qui part sans relecture, un brouillon interne, et ce qui n’en sort jamais sans un regard humain : un mandat, une annonce, un message à un client, un chiffre dans un devis.",
    },
    {
      kind: "p",
      text: "La décision sur la responsabilité est la plus inconfortable, et la plus utile. Si un agent commercial envoie une relance générée par IA avec un prix erroné, qui corrige, qui s’excuse, qui répond au client. Tant que cette question reste ouverte, chacun suppose que ce sera quelqu’un d’autre.",
    },
    {
      kind: "h2",
      id: "la-rendre-opposable",
      text: "La rendre opposable : la procédure que presque personne ne suit",
    },
    {
      kind: "p",
      text: "Le 21 mai 2026, la cour d’appel de Paris a confirmé la suspension de deux outils d’IA, un assistant interne baptisé « DIGI » et ChatGPT, déployés chez l’éditeur du Moniteur sans consultation préalable du CSE. La cour a jugé que DIGI « n’est pas une simple variante d’un logiciel de traitement de texte », puisqu’il fait des tâches jusque-là faites par les salariés : reformuler, résumer, titrer, transcrire. Elle a retenu un trouble manifestement illicite, et condamné l’employeur à 5 000 euros de dommages-intérêts au profit du CSE. L’usage reste suspendu jusqu’à la fin de la consultation.",
    },
    {
      kind: "stat",
      label: "Cour d’appel de Paris, 21 mai 2026, RG 25/13234",
      value: "5 000 €",
      caption:
        "Dommages-intérêts au profit du CSE de l’éditeur du Moniteur, pour déploiement de deux outils d’IA sans consultation préalable. L’usage reste suspendu jusqu’à la fin de la consultation.",
    },
    {
      kind: "p",
      text: "Deux seuils du Code du travail encadrent ce que vous devez faire selon la taille de votre entreprise. Le CSE est obligatoire à partir de 11 salariés. Le règlement intérieur, lui, devient obligatoire à partir de 50 salariés.",
    },
    {
      kind: "p",
      text: "Si votre charte prévoit des sanctions, elle suit la même procédure que le règlement intérieur, selon l’article L1321-5 du Code du travail : peu importe le nom qu’on lui donne. Cette procédure, fixée par l’article L1321-4, tient en quatre formalités, dans l’ordre : consultation du CSE, transmission à l’inspection du travail, dépôt au greffe du conseil de prud’hommes, affichage dans l’entreprise. Elle entre en vigueur un mois après la dernière de ces quatre étapes.",
    },
    {
      kind: "p",
      text: "Sautez cette procédure et votre charte garde une valeur pédagogique : elle explique, elle prévient, elle forme les équipes. Elle ne peut en revanche fonder aucune sanction disciplinaire tant que ces quatre formalités n’ont pas été accomplies.",
    },
    { kind: "h2", id: "le-modele", text: "Le modèle : comment l’adapter à votre équipe" },
    {
      kind: "p",
      text: "J’ai écrit [le modèle de charte IA](https://coucou-ia.com/charte-ia-modele.md) que vous pouvez récupérer directement. Il est libre : pas de formulaire, pas d’e-mail à laisser, vous le prenez et vous l’adaptez.",
    },
    {
      kind: "p",
      text: "Le modèle ne sert à rien rempli seul dans un bureau. Une charte écrite sans les équipes qui l’utiliseront est signée, classée, oubliée en quelques semaines. La méthode qui tient dans la durée est plus lente : une réunion par famille de métier, parce que les négociateurs ne saisissent pas les mêmes données que la comptabilité ou l’équipe administrative, et vous remplissez le modèle avec eux, décision par décision, sur les huit points listés plus haut.",
    },
    { kind: "h2", id: "les-erreurs", text: "Les erreurs qui rendent une charte inutile" },
    {
      kind: "p",
      text: "Quatre erreurs reviennent dans presque tous les dossiers que je vois.",
    },
    {
      kind: "list",
      items: [
        "La charte fleuve que personne ne lit après la première semaine.",
        "L’interdiction totale de l’IA, qui pousse l’usage dans l’ombre, sur les téléphones personnels, hors de portée de toute charte.",
        "La liste d’outils autorisés qu’on ne met jamais à jour : six mois après, elle décrit un monde qui n’existe plus.",
        "La charte signée en réunion générale, puis jamais reparlée : plus personne ne s’y réfère au moment où ça compterait.",
      ],
    },
    {
      kind: "callout",
      title: "Le principe qui tient",
      body: "Une charte qui interdit tout pousse l’usage vers l’endroit où vous ne le voyez plus. Une charte qui encadre le garde là où vous pouvez encore le corriger.",
    },
    { kind: "h2", id: "par-ou-commencer", text: "Par où commencer cette semaine" },
    {
      kind: "p",
      text: "Trois actions tiennent dans la semaine qui vient, et elles suffisent à sortir de l’usage clandestin.",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "Demandez à chaque équipe, en réunion courte, quels outils d’IA elle utilise déjà, sans jugement sur la réponse : c’est la seule façon d’obtenir la vraie liste.",
        "Listez, avec elles, les données qui ne doivent jamais sortir de l’entreprise vers un outil d’IA.",
        "Prenez [le modèle de charte](https://coucou-ia.com/charte-ia-modele.md) et remplissez les huit décisions en une réunion par métier, avant de penser à la procédure du règlement intérieur.",
      ],
    },
    {
      kind: "p",
      text: "Reprenez l’agence immobilière du début, cas illustratif, sans nom de client. La bonne volonté du dirigeant était là depuis le premier jour. Il manquait une réunion, celle qui met les huit décisions sur la table avant que les négociateurs ne les tranchent seuls. Le même scénario se rejoue dans beaucoup d’[agences immobilières](/secteurs/immobilier).",
    },
    {
      kind: "p",
      text: "La version qui tient est celle qu’on construit avec vos équipes, décision par décision. Si vous voulez aller plus vite, [le kit de démarrage](/outils/kit-de-demarrage) donne les étapes dans l’ordre. Ou réservez le point de départ : trente minutes, gratuites, sans engagement.",
    },
  ],
  faq: [
    {
      question: "Une charte IA est-elle obligatoire ?",
      answer:
        "Aucun texte n’emploie le mot « charte IA » et ne l’impose nommément. Mais le RGPD, l’article 4 de l’AI Act sur la maîtrise de l’IA et le droit du travail, avec la consultation du CSE avant tout déploiement, rendent la question difficile à éviter dans les faits.",
    },
    {
      question: "Qui doit signer la charte IA de l’entreprise ?",
      answer:
        "Le dirigeant l’écrit et la porte, et chaque salarié concerné en accuse réception. L’étape qui compte vraiment est la consultation du CSE, prévue par l’article L2312-8 du Code du travail, dès 11 salariés. Sans elle, la charte reste un document interne sans valeur disciplinaire.",
    },
    {
      question: "Que risque une PME sans cadre d’usage de l’IA ?",
      answer:
        "Le risque immédiat porte sur les données : des informations clients ou confidentielles saisies dans un outil grand public, sans contrôle. Le risque juridique existe aussi, comme l’a montré la décision de la cour d’appel de Paris du 21 mai 2026, qui a suspendu l’usage de deux outils d’IA déployés sans consultation du CSE et condamné l’employeur à 5 000 euros de dommages-intérêts.",
    },
  ],
  relatedArticles: ["ai-act-pme-obligations", "agent-ia-production-lecons", "prix-projet-ia"],
  relatedCasUsage: ["assistant-support-client", "traitement-documents"],
  relatedSecteurs: ["immobilier", "expertise-comptable"],
};

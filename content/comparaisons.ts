// Pages comparaison (/comparaison/[slug]). Spec : docs/programmatic-seo.md (barre des 60 %).
// On compare des CATÉGORIES, jamais une entreprise nommée. Seule exception : ChatGPT,
// qui est la catégorie elle-même. Aucun prix. Chiffres éventuels = exemples étiquetés.
// Coucou IA est unipersonnelle : « je », « un seul interlocuteur », jamais « notre équipe ».
// Slugs verrouillés : grand-cabinet-conseil, esn, freelance-ia, chatgpt-seul.

import type { FaqItem } from "@/content/secteurs";

export type ComparisonRow = {
  // Le critère comparé, dans les mots du dirigeant.
  criterion: string;
  // Colonne Coucou IA.
  coucou: string;
  // Colonne de la catégorie comparée.
  other: string;
};

export type ComparisonDifference = {
  title: string;
  body: string;
};

export type ComparaisonPage = {
  slug: string;
  // Nom court de la catégorie : breadcrumb, liens.
  name: string;
  // En-tête de la colonne « autre » du tableau (court).
  otherColumn: string;
  // Titre de la carte du hub : la phrase de comparaison.
  hubTitle: string;
  // Description courte de la carte du hub.
  hubDescription: string;
  // ≤ 60 caractères, « | Coucou IA » compris.
  metaTitle: string;
  // ~150 caractères, mots-clés en tête.
  metaDescription: string;
  h1: string;
  intro: string;
  // Le verdict en 30 secondes : honnête, y compris quand l’autre option gagne.
  verdict: string;
  // Tableau comparatif : 5 ou 6 critères concrets.
  comparison: ComparisonRow[];
  // 3 ou 4 différences racontées, pas des puces creuses.
  differences: ComparisonDifference[];
  // « Quand choisir [l’autre option] » : cas réels où l’autre gagne. Obligatoire et sincère.
  whenOther: { title: string; body: string; cases: string[] };
  // 3 ou 4 questions propres à la comparaison. Alimente le JSON-LD FAQPage.
  faq: FaqItem[];
};

// Copie transverse du gabarit comparaison. Structurelle, jamais spécifique à une page.
export const comparaisonsCopy = {
  verdictLabel: "Le verdict en 30 secondes",
  tableTitle: "Ce qu’on compare vraiment",
  criterionHead: "Le critère",
  coucouHead: "Coucou IA",
  differencesTitle: "Les différences qui comptent",
} as const;

// Copie du hub /comparaison.
export const comparaisonsHub = {
  metaTitle: "Cabinet IA, ESN, freelance ou ChatGPT | Coucou IA",
  metaDescription:
    "Coucou IA face aux autres options pour votre projet IA : grand cabinet, ESN, freelance ou ChatGPT. Verdict honnête, critère par critère. Échange gratuit.",
  h1: "Coucou IA ou une autre option pour votre IA ?",
  intro:
    "Grand cabinet, ESN, freelance ou ChatGPT tout seul : chaque option a sa place. Voici, sans détour, où je fais la différence, et où c’est une autre qu’il vous faut.",
};

export const comparaisons: ComparaisonPage[] = [
  {
    slug: "grand-cabinet-conseil",
    name: "Grand cabinet de conseil",
    otherColumn: "Grand cabinet",
    hubTitle: "Coucou IA ou un grand cabinet de conseil",
    hubDescription:
      "La signature d’un grand cabinet ou un système en production à l’échelle de votre PME : où est vraiment la valeur pour vous.",
    metaTitle: "Cabinet conseil IA ou indépendant pour PME | Coucou IA",
    metaDescription:
      "Cabinet conseil IA ou grand cabinet pour votre PME ? Un seul interlocuteur, un système en production, un business case chiffré. Premier échange gratuit.",
    h1: "Coucou IA ou un grand cabinet de conseil ?",
    intro:
      "Un grand cabinet rassure : la marque, les équipes, la méthode. Mais pour une PME, la facture et les délais grimpent vite, et le livrable reste souvent une présentation. La vraie question n’est pas la taille du cabinet, c’est ce qui tourne chez vous à la fin.",
    verdict:
      "Si vous êtes un groupe multi-pays avec une transformation à piloter sur plusieurs années, un grand cabinet a les moyens de vos ambitions : prenez-le, je vous le dis franchement. Si vous êtes une PME ou une ETI qui veut savoir par où commencer et voir un premier système en production sans y engloutir un budget de grand compte, je suis mieux placé : un seul interlocuteur, un business case chiffré avant la moindre ligne de code, et du concret livré, pas une présentation.",
    comparison: [
      {
        criterion: "Par où commencer",
        coucou:
          "Je pars de votre activité et je cartographie ce que l’IA rend possible chez vous, sans jargon.",
        other:
          "Cadrage stratégique complet, souvent surdimensionné pour une PME, avec une phase d’analyse longue avant la moindre action.",
      },
      {
        criterion: "Mise en production",
        coucou:
          "Je livre le système qui tourne, branché sur vos outils, pas seulement le plan.",
        other:
          "La stratégie est le cœur du métier ; le développement est souvent confié à un autre prestataire.",
      },
      {
        criterion: "Calibre pour une PME",
        coucou:
          "Un périmètre taillé à votre échelle, sans les strates ni les frais de structure d’un grand groupe.",
        other:
          "Un modèle pensé pour les grands comptes : la structure de coûts suit rarement une PME.",
      },
      {
        criterion: "Interlocuteur",
        coucou:
          "Un seul, du premier échange à la production. Vous savez toujours à qui parler.",
        other:
          "Une équipe qui change au fil des phases, avec des profils juniors sur le terrain et l’associé aux réunions clés.",
      },
      {
        criterion: "Continuité",
        coucou:
          "Le système livré et documenté reste à vous ; il tourne sans dépendre d’une mission qui se prolonge.",
        other:
          "La mission structure la relation : la valeur s’arrête souvent quand le budget s’arrête.",
      },
      {
        criterion: "Mesure des résultats",
        coucou:
          "Business case chiffré avant, résultats mesurés après. La méthode est la preuve.",
        other:
          "Des livrables riches et des cadres d’analyse, mais le résultat concret est plus rarement mesuré en production.",
      },
    ],
    differences: [
      {
        title: "La marque rassure, le système fait le travail",
        body: "Un grand cabinet vend d’abord une signature et une méthode éprouvée sur des groupes du CAC 40. C’est rassurant, et parfois c’est exactement ce qu’il faut. Mais dans une PME, ce qui compte le lundi matin, ce n’est pas l’épaisseur du rapport, c’est de savoir si l’IA traite vraiment vos devis ou vos factures. Je vous vends le second, et je le mets en route.",
      },
      {
        title: "La présentation ou la production",
        body: "Beaucoup de missions de conseil s’arrêtent au plan d’action : une belle feuille de route, puis il faut trouver qui la réalise. Le prototype reste au labo, le budget est déjà parti. Chez moi, la stratégie et le code sont sous le même toit : je chiffre, je priorise, puis je livre le système qui tourne. Pas de passage de relais où le projet se perd.",
      },
      {
        title: "Le bon calibre, pas l’usine à gaz",
        body: "Les honoraires d’un grand cabinet et ses cycles de plusieurs mois sont calibrés pour des enjeux à sept chiffres. Sur un premier chantier IA de PME, c’est disproportionné : vous payez la structure avant de payer le résultat. Je travaille au périmètre réel de votre besoin, et vous voyez le retour attendu avant d’engager quoi que ce soit.",
      },
      {
        title: "Un seul interlocuteur, du début à la fin",
        body: "Dans une grande mission, l’associé signe, les consultants tournent, et vous ré-expliquez votre contexte à chaque nouvelle tête. Avec moi, c’est la même personne qui écoute, chiffre, code et vous forme. Rien ne se perd entre deux réunions, et vous savez toujours à qui poser une question.",
      },
    ],
    whenOther: {
      title: "Quand choisir un grand cabinet",
      body: "Il y a des situations où c’est clairement le bon choix, et je préfère vous le dire que forcer la porte.",
      cases: [
        "Vous êtes un groupe multi-pays et la transformation touche des dizaines de sites, avec une conduite du changement à grande échelle.",
        "Le chantier se chiffre en millions et court sur plusieurs années, avec un comité de pilotage et des dizaines de personnes à coordonner.",
        "Vous avez besoin d’une signature reconnue pour rassurer un conseil d’administration ou des actionnaires sur un investissement lourd.",
        "Votre besoin dépasse largement l’IA : refonte d’organisation, stratégie de groupe, fusion. Là, la puissance d’un cabinet fait la différence.",
      ],
    },
    faq: [
      {
        question: "Un grand cabinet n’est-il pas plus crédible pour un projet IA ?",
        answer:
          "Sur un chantier de groupe, oui, la marque et la taille comptent. Sur un premier projet IA de PME, ce qui vous rend crédible en interne, c’est un système qui tourne et des résultats mesurés, pas l’épaisseur d’un rapport. C’est exactement ce que je livre.",
      },
      {
        question: "Vous êtes seul, comment tenez-vous face à une équipe entière ?",
        answer:
          "Je ne cours pas après les mêmes missions. Un grand cabinet mobilise une équipe parce que le périmètre l’exige. Sur un projet calibré pour une PME, un interlocuteur unique qui chiffre, code et livre va souvent plus vite, sans les frais de coordination d’une grosse équipe.",
      },
      {
        question: "Et si mon projet grandit et dépasse ce que vous pouvez porter seul ?",
        answer:
          "On en parle dès le premier échange. Si votre besoin relève d’une transformation de groupe, je vous le dis et je peux vous orienter. Mon terrain, c’est de vous amener vite à un premier système en production, mesuré, à l’échelle de votre entreprise.",
      },
      {
        question: "Un grand cabinet livre-t-il le système, ou seulement la stratégie ?",
        answer:
          "Cela dépend du cabinet, mais le cœur de métier reste le conseil et le cadrage. Le développement est souvent confié à un autre prestataire, avec un passage de relais. Chez moi, la stratégie et la mise en production ne font qu’un.",
      },
    ],
  },
  {
    slug: "esn",
    name: "Une ESN",
    otherColumn: "ESN",
    hubTitle: "Coucou IA ou une ESN",
    hubDescription:
      "Une ESN fournit de la capacité de développement. Moi, je définis d’abord par où commencer, puis je livre le système.",
    metaTitle: "ESN ou cabinet de conseil IA pour PME | Coucou IA",
    metaDescription:
      "ESN ou cabinet de conseil IA pour votre projet PME ? L’ESN exécute, je définis par où commencer puis je livre en production. Premier échange gratuit.",
    h1: "Coucou IA ou une ESN ?",
    intro:
      "Une ESN vous fournit des développeurs et de la capacité, parfois en régie chez vous. C’est précieux quand vous savez déjà quoi construire. Sur l’IA, le nœud est en amont : par où commencer, et qui s’assure que ce qu’on code crée vraiment de la valeur, pas juste des jours-hommes facturés ?",
    verdict:
      "Si vous avez une DSI qui pilote, un cahier des charges clair et un besoin de renfort au forfait ou en régie sur la durée, une ESN fait très bien le travail. Si vous cherchez d’abord quelqu’un pour définir par où commencer, chiffrer le retour et livrer un premier système IA sans monter une équipe, je suis plus adapté : je décide du cap avec vous, puis je le construis. L’ESN exécute un plan ; je vous aide à écrire le bon.",
    comparison: [
      {
        criterion: "Par où commencer",
        coucou:
          "Je définis le cap avec vous : où l’IA rapporte, par quoi démarrer, dans quel ordre.",
        other:
          "Vous arrivez avec le besoin déjà cadré. L’ESN exécute la commande, elle la définit rarement.",
      },
      {
        criterion: "Stratégie et priorisation",
        coucou:
          "Business case chiffré et priorisation par impact avant d’écrire du code.",
        other:
          "Posture d’exécutant : on construit ce qui est demandé, sans arbitrer la valeur.",
      },
      {
        criterion: "Mise en production",
        coucou:
          "Je livre un système qui tourne et mesuré, pas seulement du développement au forfait.",
        other:
          "Forte capacité de développement, mais le résultat métier n’est pas toujours l’objet du contrat.",
      },
      {
        criterion: "Modèle de facturation",
        coucou:
          "Au projet, sur un périmètre chiffré, avec le retour attendu posé avant d’engager.",
        other:
          "En régie ou au forfait, souvent en jours-hommes : vous payez la capacité, pas le résultat.",
      },
      {
        criterion: "Interlocuteur",
        coucou: "Un seul, de la stratégie à la production.",
        other:
          "Un ou plusieurs consultants en mission, qui peuvent tourner selon les affectations.",
      },
      {
        criterion: "Adaptée sans DSI",
        coucou:
          "Je pilote de bout en bout ; vous n’avez pas besoin d’une équipe technique pour suivre.",
        other:
          "Le modèle régie suppose souvent une DSI côté client pour cadrer et piloter.",
      },
    ],
    differences: [
      {
        title: "Exécuter un plan, ou écrire le bon",
        body: "Une ESN est excellente pour fournir des bras qualifiés quand le quoi et le comment sont déjà tranchés. Le problème, sur l’IA, c’est que personne n’a encore répondu au « par où commencer ». Si vous confiez ça à une équipe qui code ce qu’on lui demande, vous risquez de construire vite quelque chose dont la valeur n’a jamais été vérifiée. Mon métier commence là : décider du bon chantier avant de le lancer.",
      },
      {
        title: "Payer la capacité ou payer le résultat",
        body: "En régie, vous achetez des jours-hommes : la facture court tant que la mission court, indépendamment de ce qui sort en production. Je fonctionne autrement : un périmètre chiffré, un retour attendu posé avant d’engager, un système livré et mesuré. L’enjeu n’est pas le nombre de jours passés, c’est ce que ça vous rapporte.",
      },
      {
        title: "Sans DSI pour piloter, vous n’êtes pas coincé",
        body: "Le modèle de régie suppose souvent quelqu’un côté client pour cadrer les développeurs et arbitrer au quotidien. Beaucoup de PME n’ont pas cette DSI. Je pilote le projet de bout en bout et je documente ce que je livre, pour que le système tourne sans que vous ayez à monter une équipe technique en interne.",
      },
      {
        title: "Stratégie et code, sans couture",
        body: "Une ESN met du développement là où un cabinet a laissé une stratégie, et le raccord entre les deux se paie souvent en incompréhensions. Chez moi, la personne qui décide du cap est celle qui écrit le code : rien ne se perd entre l’intention et la mise en œuvre.",
      },
    ],
    whenOther: {
      title: "Quand choisir une ESN",
      body: "Une ESN est parfois le meilleur choix, et voici où elle prend clairement l’avantage.",
      cases: [
        "Vous avez une DSI qui pilote et un cahier des charges déjà écrit : vous cherchez de la capacité de développement, pas une vision.",
        "Vous voulez du renfort en régie sur la durée, intégré à vos équipes, sur un périmètre technique large qui dépasse l’IA.",
        "Le projet demande plusieurs profils en parallèle sur plusieurs mois, avec un volume qu’un interlocuteur unique ne peut pas porter.",
        "Vous devez faire évoluer et maintenir un parc applicatif existant, au-delà d’un premier chantier IA.",
      ],
    },
    faq: [
      {
        question: "ESN ou cabinet de conseil IA, quelle différence pour un projet IA ?",
        answer:
          "Une ESN fournit de la capacité de développement, souvent en régie, à partir d’un besoin déjà cadré. Un cabinet de conseil IA comme le mien définit d’abord par où commencer et chiffre le retour, puis livre le système. En résumé : l’ESN exécute, j’aide à décider puis j’exécute.",
      },
      {
        question: "Une ESN peut-elle définir par où commencer avec l’IA ?",
        answer:
          "Ce n’est pas son cœur de métier. Une ESN est taillée pour construire ce qu’on lui demande, pas pour arbitrer où l’IA crée le plus de valeur chez vous. Ce cadrage, c’est le point de départ que je vous propose avant tout développement.",
      },
      {
        question: "On n’a pas de DSI pour piloter une régie, est-ce un problème avec vous ?",
        answer:
          "Non, au contraire. Le modèle régie suppose souvent une DSI côté client. Moi, je pilote de bout en bout et je documente, pour que vous n’ayez pas à monter une équipe technique juste pour suivre le projet.",
      },
      {
        question: "Vous êtes seul, une ESN a des dizaines de développeurs, est-ce risqué ?",
        answer:
          "Sur un premier chantier IA calibré pour une PME, un interlocuteur unique va souvent plus vite qu’une équipe à coordonner. Si le volume dépasse ce qu’une personne peut porter, je vous le dis franchement : là, une ESN est le bon outil.",
      },
    ],
  },
  {
    slug: "freelance-ia",
    name: "Un freelance IA",
    otherColumn: "Freelance IA",
    hubTitle: "Coucou IA ou un freelance IA",
    hubDescription:
      "Même taille qu’un freelance, mais un business case chiffré avant de coder et un système documenté qui tourne sans moi.",
    metaTitle: "Freelance ou consultant IA indépendant | Coucou IA",
    metaDescription:
      "Freelance IA ou cabinet : même taille, méthode différente. Business case chiffré avant de coder, système documenté qui tourne sans moi. Échange gratuit.",
    h1: "Coucou IA ou un freelance IA ?",
    intro:
      "Un freelance IA coûte moins cher et va droit au but : vous décrivez la tâche, il la code. Pour un besoin ponctuel et bien cadré, difficile de faire plus simple. La question qui reste : qui décide que c’est le bon chantier, et que se passe-t-il le jour où le freelance n’est plus là ?",
    verdict:
      "Soyons clairs : je travaille seul, comme un freelance. Sur ce point, aucune différence, et je ne vais pas vous vendre une équipe que je n’ai pas. Si votre besoin est une tâche précise, déjà cadrée, à réaliser une fois, un bon freelance fera l’affaire, souvent pour moins cher. La différence se joue ailleurs : je ne code pas avant d’avoir chiffré le retour et priorisé par impact, et je livre un système documenté qui tourne sans moi. Vous ne dépendez pas de ma présence, vous dépendez du système livré.",
    comparison: [
      {
        criterion: "Taille",
        coucou:
          "Un seul interlocuteur, comme un freelance. Je ne prétends pas être une équipe.",
        other: "Une personne, en direct. Même échelle que moi sur ce point.",
      },
      {
        criterion: "Avant de coder",
        coucou:
          "Je chiffre le retour attendu et je priorise par impact avant d’écrire une ligne.",
        other:
          "Démarrage souvent direct sur la tâche demandée, sans business case en amont.",
      },
      {
        criterion: "Par où commencer",
        coucou: "Je vous dis où l’IA rapporte chez vous, et où elle ne sert à rien.",
        other:
          "Exécute ce que vous avez déjà décidé ; le choix du chantier vous revient.",
      },
      {
        criterion: "Continuité",
        coucou:
          "Le système est documenté et pensé pour tourner sans moi. Il reste à vous.",
        other:
          "Le projet dépend souvent d’une seule personne et de sa disponibilité.",
      },
      {
        criterion: "Passation",
        coucou:
          "Documentation et transfert prévus dès le départ : vous n’êtes pas prisonnier.",
        other:
          "Variable : sans passation formelle, le savoir part avec le freelance.",
      },
      {
        criterion: "Redevabilité",
        coucou:
          "Résultats mesurés après livraison, pas seulement la tâche cochée.",
        other:
          "Livrable remis, mais le résultat en production est rarement mesuré.",
      },
    ],
    differences: [
      {
        title: "Même taille, méthode différente",
        body: "Autant le dire tout de suite : un freelance et moi, c’est une personne face à votre projet. Je ne vais pas inventer une équipe. Ce qui nous sépare, ce n’est pas le nombre, c’est la manière. Avant de toucher au code, je chiffre ce que ça doit vous rapporter et je décide avec vous par quoi commencer. Un freelance démarre en général directement sur la tâche que vous lui donnez.",
      },
      {
        title: "Le business case avant la ligne de code",
        body: "Un freelance facture son temps sur ce que vous demandez. Si le chantier n’était pas le bon, vous l’apprenez à la fin. Je prends le problème à l’envers : j’estime le retour attendu, je priorise par impact, et je ne lance que ce qui vaut la peine. Vous engagez sur des chiffres, pas sur une intuition.",
      },
      {
        title: "Le système tourne sans moi",
        body: "C’est la vraie réponse à la fragilité du modèle solo. Un projet freelance s’arrête souvent le jour où le freelance n’est plus disponible : le savoir part avec lui. Je livre un système documenté, avec la passation prévue dès le départ. La continuité ne tient pas à ma présence, elle tient au système que vous gardez. Vous ne dépendez pas de moi.",
      },
      {
        title: "Redevable sur le résultat, pas sur la tâche",
        body: "Cocher une tâche, ce n’est pas prouver qu’elle rapporte. Après la mise en production, je mesure ce que le système change vraiment : temps gagné, coûts réduits. C’est la même honnêteté que le business case de départ, appliquée à l’arrivée.",
      },
    ],
    whenOther: {
      title: "Quand choisir un freelance IA",
      body: "Un freelance est parfois le choix le plus sensé, et je préfère vous le dire que vous retenir.",
      cases: [
        "Votre besoin est une tâche unique et déjà cadrée : un script, une intégration précise, un prototype à usage interne.",
        "Vous savez exactement quoi construire et vous cherchez surtout la main la moins chère pour l’exécuter.",
        "Le projet n’a pas vocation à durer ni à passer à l’échelle : une fois livré, il ne sera pas maintenu.",
        "Vous avez déjà quelqu’un en interne pour cadrer et reprendre la suite : la continuité est assurée de votre côté.",
      ],
    },
    faq: [
      {
        question: "Vous êtes seul comme un freelance, quelle est la vraie différence ?",
        answer:
          "La taille est la même, je ne le cache pas. La différence est la méthode : je chiffre le retour et je priorise avant de coder, et je livre un système documenté qui tourne sans moi. Un freelance exécute la tâche demandée ; moi je m’assure d’abord que c’est la bonne, puis je la rends autonome.",
      },
      {
        question: "Un projet solo, n’est-ce pas risqué si vous n’êtes plus disponible ?",
        answer:
          "C’est justement le risque que je neutralise. Le système est documenté et la passation prévue dès le départ, pour qu’il tourne sans moi. La continuité tient au système livré, qui reste à vous, pas à ma présence.",
      },
      {
        question: "Un freelance est moins cher, pourquoi payer plus ?",
        answer:
          "Pour une tâche ponctuelle et bien cadrée, un freelance est souvent le bon calcul, et je vous le dirai. Vous payez plus quand vous voulez être sûr de lancer le bon chantier, avec un retour chiffré avant d’engager et un système qui dure au-delà de la mission.",
      },
      {
        question: "Comment être sûr que ce qu’on construit crée de la valeur ?",
        answer:
          "Parce qu’on ne démarre pas sans business case chiffré : le retour attendu est posé avant le code, et mesuré après la mise en production. La valeur n’est pas une promesse, c’est ce qu’on vérifie avant et après.",
      },
    ],
  },
  {
    slug: "chatgpt-seul",
    name: "ChatGPT tout seul",
    otherColumn: "ChatGPT seul",
    hubTitle: "Coucou IA ou ChatGPT tout seul",
    hubDescription:
      "ChatGPT est un outil individuel. Un système sur mesure travaille sur vos données, dans vos process, en production. Les deux sont complémentaires.",
    metaTitle: "ChatGPT suffit-il pour une PME ? | Coucou IA",
    metaDescription:
      "ChatGPT suffit-il pour une PME ? Ses limites en entreprise : vos données, vos process, la confidentialité. Outil individuel ou système. Échange gratuit.",
    h1: "Coucou IA ou ChatGPT tout seul ?",
    intro:
      "ChatGPT est bluffant, gratuit ou presque, et vos équipes l’utilisent déjà. Alors pourquoi payer pour un système sur mesure ? Parce qu’entre un outil individuel qui répond dans une fenêtre et un système branché sur vos données et vos process, il y a tout ce qui sépare un brouillon d’un résultat en production.",
    verdict:
      "Gardez ChatGPT : pour rédiger un brouillon, résumer un texte ou débloquer une idée, c’est un excellent outil individuel, et je le recommande. Mais ChatGPT tout seul ne connaît pas vos données, ne s’exécute pas dans vos process et ne protège pas ce que vos équipes y collent. Dès que vous voulez un résultat fiable, répétable et branché sur votre entreprise, il faut un système construit autour. Les deux ne s’opposent pas : ChatGPT outille la personne, je construis le système.",
    comparison: [
      {
        criterion: "Vos données",
        coucou:
          "Le système répond à partir de VOS documents et de VOS données, avec des réponses sourcées.",
        other:
          "Répond à partir de connaissances générales : il ne connaît pas votre entreprise.",
      },
      {
        criterion: "Dans vos process",
        coucou:
          "Branché sur vos outils, il agit dans votre chaîne : il lit, traite, route, met à jour.",
        other:
          "Vit dans une fenêtre de discussion : c’est à l’utilisateur de copier-coller à chaque fois.",
      },
      {
        criterion: "Fiabilité et répétabilité",
        coucou:
          "Cadré et testé pour donner le même résultat fiable à chaque exécution.",
        other:
          "Résultats variables d’une fois à l’autre, selon la formulation de la personne.",
      },
      {
        criterion: "Confidentialité",
        coucou:
          "Conçu dès le départ pour garder vos données sous contrôle, RGPD et AI Act.",
        other:
          "Ce que vos équipes y collent échappe à votre maîtrise, sans cadre défini.",
      },
      {
        criterion: "À l’échelle de l’entreprise",
        coucou:
          "Un système partagé, mesuré, utilisé par toute l’équipe de la même façon.",
        other:
          "Usage individuel, chacun dans son coin, sans industrialisation ni mesure.",
      },
      {
        criterion: "Mesure des résultats",
        coucou: "Business case chiffré avant, résultats mesurés après.",
        other:
          "Aucune mesure : on ne sait pas ce que l’outil fait gagner, ni à qui.",
      },
    ],
    differences: [
      {
        title: "Il ne connaît pas votre entreprise",
        body: "ChatGPT tout seul répond avec des connaissances générales. Posez-lui une question sur votre client, votre contrat ou votre stock : il improvise ou il invente. Un système sur mesure fait l’inverse : il répond à partir de vos documents réels, avec des réponses que vous pouvez tracer jusqu’à leur source. C’est la différence entre une réponse plausible et une réponse juste.",
      },
      {
        title: "Le brouillon contre la production",
        body: "Dans ChatGPT, c’est toujours un humain qui ouvre la fenêtre, formule, copie et colle le résultat ailleurs. Ça marche pour une tâche à la fois. Un système, lui, s’exécute dans vos process : il lit les factures qui arrivent, route les demandes, met à jour vos outils, sans qu’une personne relance la machine à chaque fois. L’un assiste, l’autre travaille.",
      },
      {
        title: "Ce que vos équipes y collent",
        body: "Le vrai angle mort de l’usage libre, c’est la confidentialité. Vos collaborateurs collent des données clients, des contrats, des chiffres dans un outil grand public, sans cadre. Un système conçu pour l’entreprise garde vos données sous contrôle, avec un hébergement adapté et le respect du RGPD et de l’AI Act. La souveraineté de vos données n’est pas une option, c’est un point de départ.",
      },
      {
        title: "Complémentaires, pas concurrents",
        body: "Je ne vais pas vous dire d’abandonner ChatGPT, ce serait absurde. C’est un excellent outil individuel pour écrire, résumer, explorer. Mais il ne remplace pas un système d’entreprise, et l’inverse est vrai aussi. Le bon réflexe : garder l’un pour la personne et construire l’autre pour l’entreprise.",
      },
    ],
    whenOther: {
      title: "Quand ChatGPT tout seul suffit",
      body: "Souvent, vous n’avez pas besoin de plus, et le dire fait partie de mon métier.",
      cases: [
        "Un usage individuel du quotidien : rédiger un mail, résumer un compte rendu, reformuler un texte, chercher une idée.",
        "Des brouillons et des premières versions qu’un humain relit et corrige systématiquement avant tout usage.",
        "Une exploration ponctuelle, sans données sensibles ni besoin de résultat répétable ou tracé.",
        "Vos équipes montent en compétence sur l’IA : c’est même un excellent point de départ avant d’industrialiser quoi que ce soit.",
      ],
    },
    faq: [
      {
        question: "ChatGPT suffit-il pour une PME ?",
        answer:
          "Pour un usage individuel, oui : écrire, résumer, explorer. Pour un résultat fiable, branché sur vos données et répétable à l’échelle de l’entreprise, non. ChatGPT tout seul reste un outil personnel, pas un système d’entreprise. Les deux sont complémentaires.",
      },
      {
        question: "Quelles sont les limites de ChatGPT en entreprise ?",
        answer:
          "Il ne connaît pas vos données, il ne s’exécute pas dans vos process, ses réponses varient d’une fois à l’autre, et il ne protège pas ce que vos équipes y collent. Ces limites disparaissent quand on construit un système autour de vos données et de vos outils.",
      },
      {
        question: "On a déjà testé ChatGPT et ça n’a rien changé, pourquoi ?",
        answer:
          "Parce qu’un outil individuel ne transforme pas un process d’entreprise. La valeur arrive quand l’IA est branchée sur vos données et vos process, en production, et mesurée. Ce n’est pas le prompt qui compte, c’est le système.",
      },
      {
        question: "Un système sur mesure remplace-t-il ChatGPT ?",
        answer:
          "Non, et ce n’est pas le but. ChatGPT reste utile pour l’usage individuel de vos équipes. Le système sur mesure prend le relais pour ce qui doit être fiable, répétable et confidentiel à l’échelle de l’entreprise. Gardez les deux.",
      },
    ],
  },
];

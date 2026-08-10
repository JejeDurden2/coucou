// Article 4 du blog. Voir .agents/blog.md : « je », aucun prix Coucou IA,
// chiffres réels et sourcés, maillage interne obligatoire dans le corps.
// Les montants publics du dispositif Bpifrance sont le sujet de l'article.

import type { BlogArticle } from "@/content/blog";

export const diagDataIaBpifrance: BlogArticle = {
  slug: "diag-data-ia-bpifrance",
  title: "Diag Data IA : l’aide publique que personne ne vous a signalée",
  metaTitle: "Diag Data IA Bpifrance : ce qu’il finance | Coucou IA",
  metaDescription:
    "Diag Data IA Bpifrance : 8 jours d’expert facturés 10 000 € HT, financés à 40 % par France 2030. Qui y a droit, comment ça se passe, ce que ça ne couvre pas.",
  category: "décryptage",
  publishedAt: "2026-08-10",
  lede: "Bpifrance facture 10 000 € HT huit jours d’un expert data et IA dans votre entreprise, et France 2030 en paie 40 %. Il vous reste 6 000 € HT, une feuille de route, et cinq critères d’éligibilité que la plupart des dirigeants concernés n’ont jamais lus.",
  keyTakeaways: [
    "Le Diag Data IA de Bpifrance finance 8 jours d’un expert data et IA agréé, sur 3 mois maximum, facturés 10 000 € HT et pris en charge à 40 % par France 2030 : reste à charge 6 000 € HT.",
    "Sont éligibles les PME et ETI au sens européen de 10 à 2 000 salariés, avec au moins 1 000 000 € de chiffre d’affaires sur 12 mois et plus d’un an d’existence, clientes ou non de Bpifrance.",
    "France 2030 a mobilisé 9,6 M€ pour cofinancer 2 000 accompagnements sur 2026 et 2027 : l’enveloppe est comptée, le dispositif n’est pas un droit permanent.",
    "L’expert est agréé individuellement par Bpifrance, pas au nom de son cabinet, et c’est l’entreprise qui le désigne dans sa demande sur diag.bpifrance.fr.",
    "Le Diag finance l’analyse et la feuille de route, jamais le développement : la mise en production reste entièrement à votre charge et se décide sur un business case chiffré.",
  ],
  blocks: [
    {
      kind: "p",
      text: "Huit jours d’un expert data et IA dans votre entreprise, facturés 10 000 € HT, dont 4 000 € payés par l’État. Vous repartez avec une feuille de route. Le dispositif s’appelle le Diag Data IA, il est porté par Bpifrance et financé par France 2030. La plupart des dirigeants de PME à qui j’en parle découvrent son existence et son montant dans la même phrase.",
    },
    {
      kind: "p",
      text: "Ce n’est pas de la négligence. Une aide publique ne se vend pas : aucun commercial n’est payé pour vous appeler à son sujet. Elle se trouve, sur un site que vous ne consultez pas, sous un nom que vous ne cherchez pas. Les entreprises qui en profitent sont donc souvent celles qui avaient déjà commencé.",
    },
    {
      kind: "h2",
      id: "ce-que-ca-finance",
      text: "Ce que le Diag Data IA finance, exactement",
    },
    {
      kind: "p",
      text: "Huit jours d’intervention, répartis sur trois mois maximum. Un expert agréé vient regarder vos données, vos processus et vos outils, puis vous rend un état des lieux et une feuille de route. La facture est fixée à 10 000 € HT, France 2030 en prend 40 % à sa charge, il vous reste 6 000 € HT.",
    },
    {
      kind: "stat",
      label: "Reste à charge, Diag Data IA",
      value: "6 000 € HT",
      caption:
        "8 jours d’expert agréé sur 3 mois maximum, facturés 10 000 € HT, pris en charge à 40 % par France 2030. Source : bpifrance.fr, catalogue d’offres.",
    },
    {
      kind: "p",
      text: "Le prix fixe est la bonne nouvelle cachée du dispositif. Vous ne négociez pas un devis, vous ne comparez pas trois propositions dont aucune ne décrit le même travail. Sur le marché libre, le même mot recouvre trois semaines d’ateliers ou une note de synthèse.",
    },
    {
      kind: "p",
      text: "Le cadre général, c’est le plan national « Osez l’IA », renforcé le 17 juin 2026. Son objectif affiché : 80 % des PME et ETI françaises équipées en IA d’ici 2030. Le Diag Data IA est l’un des outils qui doivent y mener, et il est financé comme tel.",
    },
    {
      kind: "h2",
      id: "qui-y-a-droit",
      text: "Qui y a droit, et qui passe à côté",
    },
    {
      kind: "p",
      text: "Les critères tiennent en cinq lignes. PME ou ETI au sens européen. De 10 à 2 000 salariés. Au moins 1 000 000 € de chiffre d’affaires sur douze mois. Plus d’un an d’existence. Hors entreprises en difficulté au sens européen. Vous n’avez pas besoin d’être client de Bpifrance : c’est le malentendu qui écarte le plus de candidats avant même la première question.",
    },
    {
      kind: "p",
      text: "Les seuils écartent les indépendants et les très petites structures. Au-delà, la porte est large : une entreprise de 25 personnes qui facture 3 millions y a droit exactement comme une ETI de 800 personnes. Beaucoup de dirigeants supposent le contraire et ne vérifient jamais.",
    },
    {
      kind: "callout",
      title: "L’enveloppe est comptée",
      body: "France 2030 a mobilisé 9,6 M€ pour cofinancer 2 000 accompagnements sur 2026 et 2027. Ce n’est pas un guichet permanent : c’est un budget avec un plafond et une date de fin. Si le dispositif vous concerne, le bon moment pour instruire la demande est celui où vous y pensez.",
    },
    {
      kind: "h2",
      id: "comment-ca-se-passe",
      text: "Comment ça se passe, dans l’ordre",
    },
    {
      kind: "p",
      text: "Le point qui surprend le plus : vous choisissez votre expert. Bpifrance ne vous en attribue pas un. Les intervenants sont agréés individuellement, à titre personnel et non au nom de leur cabinet, et c’est vous qui désignez le vôtre dans votre demande sur diag.bpifrance.fr.",
    },
    {
      kind: "p",
      text: "La conséquence est pratique : un cabinet peut être excellent sans qu’aucun de ses consultants ne soit agréé, et un expert agréé peut travailler seul. Vérifiez le nom de la personne, pas l’enseigne. Puis posez-lui les questions que mérite n’importe quel prestataire : quels secteurs il connaît, ce qu’il a mis en production, ce qu’il vous rendra à la fin.",
    },
    {
      kind: "p",
      text: "Ensuite, huit jours sur trois mois au maximum : entretiens avec vos équipes, revue de vos données et de vos outils, tri des usages possibles, rédaction. Trois mois est un plafond, pas un objectif. Plus la mission est resserrée, plus la feuille de route arrive pendant que le sujet est encore chaud.",
    },
    {
      kind: "h2",
      id: "ce-que-ca-ne-couvre-pas",
      text: "Ce que le Diag ne couvre pas",
    },
    {
      kind: "p",
      text: "Huit jours d’analyse ne produisent pas un système qui tourne. Le Diag Data IA finance la réflexion et la feuille de route, jamais le développement, jamais l’intégration à vos outils, jamais la [mise en production](/glossaire/mise-en-production). Ce budget-là arrive après, il est d’un autre ordre de grandeur, et personne ne le subventionne à 40 %.",
    },
    {
      kind: "p",
      text: "Il ne couvre pas non plus le rangement que la mission va révéler. Documents éparpillés sur trois disques partagés, logiciel métier qui n’exporte rien de propre : c’est presque toujours ce qui sépare une bonne idée d’un système qui marche, et cela se traite avec vos équipes.",
    },
    {
      kind: "p",
      text: "Enfin, il ne décide pas à votre place. Une feuille de route liste des chantiers ; elle ne dit pas lequel se rembourse. C’est le travail de chiffrage que je décris dans [chiffrer un projet IA avant de le lancer](/blog/business-case-ia) : temps mesuré aujourd’hui, temps qui restera après, coût de la mise en production. Trois chiffres, une soustraction, une décision.",
    },
    {
      kind: "h2",
      id: "pourquoi-maintenant",
      text: "Pourquoi l’État paie, et ce que ça dit du terrain",
    },
    {
      kind: "p",
      text: "L’INSEE a publié le 21 juillet 2026 le chiffre qui explique l’enveloppe : 18 % des entreprises françaises de 10 salariés ou plus utilisaient l’IA en 2025, contre 10 % un an plus tôt. La progression est forte, le niveau reste bas. Et l’écart de taille saute aux yeux : 15 % chez les entreprises de 10 à 49 salariés, 31 % chez celles de 50 à 249.",
    },
    {
      kind: "stat",
      label: "Entreprises de 10 salariés ou plus utilisant l’IA",
      value: "18 %",
      caption:
        "En 2025, contre 10 % en 2024. 15 % chez les 10-49 salariés, 31 % chez les 50-249. Source : INSEE Première n° 2120, 21 juillet 2026.",
    },
    {
      kind: "p",
      text: "Le chiffre le plus parlant de cette étude est ailleurs : 71 % des entreprises qui n’utilisent pas l’IA disent ne pas y voir d’utilité. Pas le prix, pas la technique, pas le règlement. L’utilité. C’est exactement ce qu’un état des lieux sérieux traite : montrer, sur vos propres tâches, ce qui change et ce qui ne change rien. Le [traitement automatique de documents](/cas-usage/traitement-documents) est le cas où le déclic se produit le plus vite, parce que le temps perdu s’y compte en heures visibles.",
    },
    {
      kind: "h2",
      id: "apres-la-feuille-de-route",
      text: "Ce que vous faites de la feuille de route",
    },
    {
      kind: "p",
      text: "Une feuille de route qui reste dans un tiroir coûte 6 000 € HT et zéro heure gagnée. Le rendu arrive, tout le monde le trouve bon, personne n’a de mandat pour la suite. Trois réflexes évitent ça, et ils se décident avant la fin de la mission.",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "Exigez, dans le rendu, un chantier classé premier avec le volume concerné, les données nécessaires et le temps que la tâche coûte aujourd’hui, mesuré et non estimé.",
        "Nommez, avant la fin des huit jours, la personne de votre entreprise qui portera ce premier chantier et le temps qu’elle y consacrera chaque semaine.",
        "Fixez une date de décision à trois semaines du rendu : on lance, on reporte, ou on abandonne. Sans date, c’est toujours « on reporte ».",
      ],
    },
    {
      kind: "p",
      text: "Un dernier réflexe, moins évident : demandez à ce que la feuille de route distingue ce qui relève de l’IA et ce qui relève d’une règle fixe. La [différence entre automatisation et IA](/glossaire/automatisation-vs-ia) tranche souvent en faveur de la solution la moins chère, et un bon expert vous le dira au lieu de vous vendre du modèle là où un script suffisait.",
    },
    {
      kind: "h2",
      id: "diag-ou-audit",
      text: "Diag Data IA ou état des lieux privé : comment choisir",
    },
    {
      kind: "p",
      text: "Autant le dire tout de suite : je ne suis pas expert agréé Bpifrance, donc je ne réalise pas de Diag Data IA subventionné. Je vous explique le dispositif parce qu’il est bon pour beaucoup d’entreprises que je croise, et parce qu’un conseil qui vous cache une aide publique n’est pas un conseil.",
    },
    {
      kind: "p",
      text: "Les deux formats répondent à un besoin proche : savoir où l’IA sert chez vous et par quoi commencer. Ils ne se choisissent pas sur le prix, ils se choisissent sur la situation.",
    },
    {
      kind: "list",
      items: [
        "Le Diag Data IA convient quand vous partez de loin, que le périmètre est large, et que vous voulez balayer toute l’entreprise avec un cadre et un tarif connus d’avance.",
        "Un état des lieux privé convient quand vous avez déjà une idée précise, un délai court, ou un besoin qui sort du format : huit jours sur trois mois n’est pas toujours le bon rythme.",
        "Les critères d’éligibilité tranchent aussi tout seuls : moins de 10 salariés, moins de 1 000 000 € de chiffre d’affaires ou moins d’un an d’existence, et la question ne se pose pas.",
        "Dernier critère, le plus honnête : la personne. Agréée ou non, regardez ce qu’elle a mis en production, pas ce qu’elle a présenté en réunion.",
      ],
    },
    {
      kind: "callout",
      title: "Ce que je fais, dans les deux cas",
      body: "Le point de départ chez moi reste gratuit et ne dépend d’aucun dispositif : trente minutes pour regarder vos tâches répétitives et vous dire franchement si le Diag Data IA est la bonne porte, si un chantier plus court suffit, ou s’il vaut mieux ne rien lancer cette année.",
    },
    {
      kind: "p",
      text: "Pour avancer sans rien attendre, deux points d’entrée. La [grille par où commencer](/outils/par-ou-commencer) trie vos idées en trois questions : volume, données, douleur. Le [kit de démarrage](/outils/kit-de-demarrage) vous donne de quoi construire une première version vous-même. Aucun ne remplace huit jours d’expert, mais les deux vous font arriver à la mission avec vos vrais chiffres en main. Ça vaut bien une journée sur les huit.",
    },
  ],
  faq: [
    {
      question: "Qu’est-ce que le Diag Data IA de Bpifrance ?",
      answer:
        "C’est un accompagnement de 8 jours par un expert data et IA agréé par Bpifrance, réparti sur 3 mois maximum, qui aboutit à un état des lieux de vos données et de vos processus et à une feuille de route. Il est facturé 10 000 € HT et pris en charge à 40 % par France 2030, dans le cadre du plan national « Osez l’IA ».",
    },
    {
      question: "Qui peut bénéficier du Diag Data IA ?",
      answer:
        "Les PME et ETI au sens européen, de 10 à 2 000 salariés, avec au moins 1 000 000 € de chiffre d’affaires sur les douze derniers mois et plus d’un an d’existence. Les entreprises en difficulté au sens européen sont exclues. Il n’est pas nécessaire d’être client de Bpifrance pour en faire la demande.",
    },
    {
      question: "Combien coûte un Diag Data IA ?",
      answer:
        "La mission est facturée 10 000 € HT. France 2030 en prend 40 % à sa charge, ce qui laisse 6 000 € HT à l’entreprise. Ce montant couvre l’analyse et la feuille de route uniquement : le développement, l’intégration et la mise en production des projets retenus restent à votre charge et se chiffrent séparément.",
    },
  ],
  relatedArticles: ["business-case-ia", "prix-projet-ia", "ai-act-pme-obligations"],
  relatedCasUsage: ["traitement-documents", "recherche-interne"],
  relatedSecteurs: ["industrie", "services-b2b"],
};

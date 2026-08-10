// Article 5 du blog. Voir .agents/blog.md : « je », aucun prix Coucou IA,
// chiffres réels et sourcés ou étiquetés illustration, maillage interne
// obligatoire dans le corps. Le seul montant réel cité est public (Bpifrance).

import type { BlogArticle } from "@/content/blog";

export const prixProjetIa: BlogArticle = {
  slug: "prix-projet-ia",
  title: "Ce que la facture d’un projet IA contient vraiment",
  metaTitle: "Prix d’un agent IA : les postes de coût | Coucou IA",
  metaDescription:
    "Prix d’un agent IA : les cinq postes qui font varier la facture, et les six questions à poser pour lire un devis et comparer deux propositions.",
  category: "décryptage",
  publishedAt: "2026-08-10",
  lede: "Les fourchettes publiées sur le web vont de moins de 3 000 € à plus de 100 000 € pour « un agent IA », sans jamais expliquer le calcul. Voici les cinq postes qui font varier la facture, et de quoi lire un devis sans se faire raconter d’histoires.",
  keyTakeaways: [
    "Un prix annoncé avant d’avoir regardé vos processus et vos données n’est pas un prix : c’est un tarif de catalogue posé sur un projet que personne n’a décrit.",
    "Cinq postes expliquent l’écart entre deux devis d’agent IA : le nombre d’outils à brancher, l’état des données, l’autonomie confiée à l’agent, les exigences de conformité, et le coût de fonctionnement une fois le système en service.",
    "Le branchement aux outils existants coûte souvent plus cher que l’intelligence de l’agent : chaque outil ajoute des droits à obtenir, des formats à traduire et des pannes à gérer.",
    "Un devis sérieux sépare l’investissement de départ du coût annuel de fonctionnement : le premier se rembourse une fois, le second se soustrait au gain chaque année.",
    "Le Diag Data IA de Bpifrance, état des lieux de 8 jours facturé 10 000 € HT et pris en charge à 40 % par France 2030, donne un repère public sur le coût d’une analyse préalable.",
  ],
  blocks: [
    {
      kind: "p",
      text: "Deux devis pour le même besoin, côte à côte sur la table d’un dirigeant (la scène est recomposée, l’écart ne l’est pas) : un système qui trie les demandes arrivées par courriel et prépare les réponses. Le premier tient sur une page et annonce un forfait. Le second fait onze pages et coûte dix fois plus. Les deux prestataires sont honnêtes. Ils ne chiffrent pas le même projet, et rien dans les documents ne permet de s’en apercevoir.",
    },
    {
      kind: "p",
      text: "Cherchez « combien coûte un agent IA » et vous trouverez des fourchettes qui se contredisent : moins de 3 000 € sur un site, plus de 100 000 € sur le suivant, aucune explication du calcul dans les deux cas. Je n’en ajouterai pas une. Un prix annoncé avant d’avoir regardé vos processus et vos données n’est pas un prix, c’est un appât.",
    },
    {
      kind: "h2",
      id: "un-a-dix",
      text: "Pourquoi deux devis honnêtes varient de un à dix",
    },
    {
      kind: "p",
      text: "Le mot [agent IA](/glossaire/agent-ia) désigne aujourd’hui deux objets qui n’ont rien à voir. D’un côté, un assistant branché sur une page de questions fréquentes, qui répond dans une fenêtre de discussion et ne touche à rien. De l’autre, un système qui lit vos dossiers, écrit dans votre logiciel de gestion, relance un fournisseur et sait quand s’arrêter pour demander un humain.",
    },
    {
      kind: "p",
      text: "Le premier se monte en quelques jours. Le second demande des semaines, parce que l’essentiel du travail n’est pas l’intelligence : c’est tout ce qu’il y a autour. Un prestataire qui vous donne un prix au téléphone a choisi lequel des deux il vend, sans vous demander lequel vous achetez.",
    },
    {
      kind: "p",
      text: "Cinq postes expliquent presque tout l’écart, et aucun ne dépend du prestataire : ils dépendent de chez vous.",
    },
    {
      kind: "h2",
      id: "integrations",
      text: "Poste 1 : le nombre de branchements aux outils en place",
    },
    {
      kind: "p",
      text: "C’est le premier multiplicateur, et de loin le plus sous-estimé. Un agent qui ne parle à rien est une démonstration. Un agent utile lit et écrit dans vos outils : messagerie, logiciel de gestion, dossiers partagés, parfois un vieux logiciel métier que plus personne ne maintient.",
    },
    {
      kind: "p",
      text: "Chaque branchement ajoute quatre lignes au chiffrage : obtenir les droits d’accès, traduire les formats dans les deux sens, gérer les pannes de l’autre côté, refaire le tour à chaque changement de version. Deux outils modernes avec une interface de programmation propre, c’est quelques jours. Un logiciel métier de 2009 sans interface, où tout passe par des exports de fichiers, c’est un autre projet.",
    },
    {
      kind: "callout",
      title: "La question qui trie les devis en trente secondes",
      body: "« Combien de systèmes l’agent doit-il lire, et dans combien doit-il écrire ? » Qui a chiffré sérieusement répond par une liste nominative de vos outils. Qui vend un catalogue répond « on s’intègre à tout ». Personne ne s’intègre à tout : on s’intègre à ce qu’on a ouvert et testé.",
    },
    {
      kind: "h2",
      id: "donnees",
      text: "Poste 2 : le volume et l’état de vos données",
    },
    {
      kind: "p",
      text: "Un système d’IA ne vaut que ce que valent les documents qu’on lui donne. Et l’écart de coût ne vient pas de la quantité, il vient de l’état. Des fiches propres dans une base unique, c’est un branchement. Vingt ans d’archives réparties entre un serveur, trois boîtes aux lettres et le disque dur d’une personne partie en retraite, c’est un chantier avant le chantier.",
    },
    {
      kind: "p",
      text: "Ce qui pèse dans le chiffrage : rassembler les sources, décider laquelle fait foi quand deux se contredisent, convertir ce qui est scanné, retirer ce qui ne doit pas sortir, vérifier sur un échantillon que le système lit juste. Sur un projet de [traitement de documents](/cas-usage/traitement-documents), cette préparation dépasse souvent le temps d’écriture de l’agent lui-même. Un devis qui n’en parle pas a oublié le poste, ou compte vous l’envoyer en avenant.",
    },
    {
      kind: "h2",
      id: "autonomie",
      text: "Poste 3 : le niveau d’autonomie que vous confiez à l’agent",
    },
    {
      kind: "p",
      text: "Trois niveaux, trois budgets. L’agent propose et un humain valide tout : le moins cher, le plus rapide à mettre en service. L’agent agit seul sur les cas simples et renvoie les cas incertains : intermédiaire, et presque toujours le bon réglage. L’agent décide et exécute sans relecture : le plus cher, de loin.",
    },
    {
      kind: "p",
      text: "L’écart ne vient pas du modèle, il vient du filet de sécurité. Dès qu’une action part sans relecture, il faut savoir ce qu’elle a fait et pouvoir revenir en arrière : trace de chaque décision, limites strictes sur ce que l’agent peut toucher, seuil au-delà duquel il s’arrête, et quelqu’un pour recevoir l’alerte. Ce filet, la démonstration ne le montre jamais.",
    },
    {
      kind: "p",
      text: "D’où un conseil qui économise beaucoup d’argent : commencez au niveau où l’humain valide, mesurez le taux d’erreur réel pendant quelques semaines, puis achetez l’autonomie que vos chiffres justifient. L’inverse, payer l’autonomie d’abord et découvrir ensuite le taux d’erreur, coûte deux fois.",
    },
    {
      kind: "h2",
      id: "conformite",
      text: "Poste 4 : ce que la conformité ajoute, et quand",
    },
    {
      kind: "p",
      text: "Ce poste va de presque rien à très cher, et la variable n’est pas votre taille : c’est la nature des données. Un agent qui reformule des notes internes anonymes ne demande rien. Un agent qui touche des données de santé, des données bancaires ou des dossiers de candidature entre dans un autre régime : hébergement qualifié, analyse d’impact, registre, parfois une revue juridique.",
    },
    {
      kind: "p",
      text: "Le piège classique : payer la conformité maximale par précaution, sur un usage qui ne la demande pas. Le piège inverse : la découvrir trois mois après la mise en service, quand il faut tout redéployer ailleurs. Tranchez la nature des données avant le chiffrage.",
    },
    {
      kind: "h2",
      id: "fonctionnement",
      text: "Poste 5 : le coût de fonctionnement, celui qui revient chaque mois",
    },
    {
      kind: "p",
      text: "Certains devis appellent ce poste le « run », mot anglais pour ce que je nomme le coût de fonctionnement : ce que le système coûte chaque mois une fois qu’il tourne. C’est la ligne la plus souvent absente, et celle qui décide si votre gain tient dans la durée.",
    },
    {
      kind: "p",
      text: "Elle contient au moins quatre choses. Les appels aux modèles, facturés au [token](/glossaire/token) et donc proportionnels à votre volume réel, pas à celui de la démonstration. L’hébergement et la surveillance. Le temps humain de supervision : quelqu’un qui regarde ce que l’agent a fait et traite ce qu’il a renvoyé. Les évolutions, parce que vos formats bougent, vos outils changent de version et vos règles métier aussi.",
    },
    {
      kind: "p",
      text: "Demandez ce coût annuel en pourcentage de l’investissement de départ, et le volume mensuel sur lequel il a été calculé. Sans réponse, la production n’a pas été chiffrée. Et tant que le système ne tourne pas tous les matins, vous n’avez rien gagné.",
    },
    {
      kind: "h2",
      id: "point-d-ancrage",
      text: "Un point de repère public, puisque personne n’en donne",
    },
    {
      kind: "p",
      text: "Refuser de publier des prix ne dispense pas de donner des repères. Il en existe un, public, et il vient de l’État : le Diag Data IA de Bpifrance, un état des lieux de 8 jours facturé 10 000 € HT, pris en charge à 40 % par France 2030, soit 6 000 € HT à votre charge.",
    },
    {
      kind: "stat",
      label: "Diag Data IA, Bpifrance",
      value: "8 jours",
      caption:
        "État des lieux facturé 10 000 € HT, pris en charge à 40 % par France 2030 : 6 000 € HT restent à charge. Source : bpifrance.fr, catalogue d’offres.",
    },
    {
      kind: "p",
      text: "Ce chiffre ne dit rien du coût de votre projet. Il dit mieux : même l’État compte huit jours de travail pour regarder les processus et les données d’une entreprise avant de décider quoi que ce soit. Un prestataire qui donne un prix ferme sans avoir passé un temps comparable chez vous ne vous fait pas gagner du temps, il fait une hypothèse et vous en transfère le risque. J’ai détaillé ce dispositif et ses limites dans [mon décryptage du Diag Data IA](/blog/diag-data-ia-bpifrance).",
    },
    {
      kind: "stat",
      label: "Entreprises de 10 salariés ou plus utilisant l’IA",
      value: "18 %",
      caption:
        "En 2025. Parmi les non-utilisatrices, 71 % n’y voient pas d’utilité et 54 % citent le manque d’expertise. Source : INSEE Première n° 2120, 21 juillet 2026.",
    },
    {
      kind: "p",
      text: "Ce manque d’expertise, cité par plus d’une entreprise sur deux, explique pourquoi les fourchettes fantaisistes prospèrent : quand personne dans la salle ne sait ce qui compose la facture, n’importe quel chiffre passe.",
    },
    {
      kind: "h2",
      id: "lire-un-devis",
      text: "Lire un devis IA : six questions, dans l’ordre",
    },
    {
      kind: "p",
      text: "Prenez les deux propositions et posez-leur les mêmes questions. Les écarts de prix deviennent lisibles en une heure.",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "Quels outils l’agent lit-il, dans lesquels écrit-il ? Une liste nominative, pas « vos outils ».",
        "Qui rassemble et nettoie les données, et ce temps est-il dans le prix ou en supplément ?",
        "Quelle autonomie est chiffrée, et que se passe-t-il quand l’agent n’est pas sûr de lui ?",
        "Quelles données personnelles ou sensibles sont touchées, et où sont-elles hébergées ?",
        "Combien coûte une année de fonctionnement, sur quel volume mensuel ?",
        "Que devient le prix si mon volume double, et qui paie les évolutions de l’année deux ?",
      ],
    },
    {
      kind: "p",
      text: "Deux propositions qui répondent aux six sont comparables. Deux propositions qui n’en traitent aucune ne le sont pas : ce sont deux paris différents sur le même inconnu.",
    },
    {
      kind: "p",
      text: "Et gardez l’ordre des opérations. Un coût ne se juge pas seul, il se juge contre un gain mesuré : combien d’heures cette tâche vous prend aujourd’hui, combien elle vous prendra après. C’est la méthode de [chiffrer un projet IA avant de l’engager](/blog/business-case-ia), et elle se fait avant de demander le moindre devis. Avant ça encore, [la grille en trois questions](/outils/par-ou-commencer) dit en quelques minutes si le sujet mérite un chiffrage.",
    },
    {
      kind: "p",
      text: "Le bon devis n’est pas le moins cher. C’est celui dont vous comprenez chaque ligne, et dont vous pouvez discuter chaque poste parce que vous savez ce qu’il contient. Le reste, c’est de la vitrine.",
    },
  ],
  faq: [
    {
      question: "Combien coûte un agent IA pour une PME ?",
      answer:
        "Aucun chiffre honnête ne se donne sans avoir regardé vos outils et vos données : d’où des fourchettes publiées qui vont de moins de 3 000 € à plus de 100 000 € sans jamais se rejoindre. Le prix dépend de cinq facteurs mesurables chez vous : le nombre d’outils à brancher, l’état de vos données, l’autonomie confiée à l’agent, les exigences de conformité, et le coût de fonctionnement annuel. Exigez un chiffrage poste par poste, jamais un forfait.",
    },
    {
      question: "Pourquoi les prix des agents IA varient autant ?",
      answer:
        "Parce que le mot recouvre deux objets très différents : un assistant qui répond dans une fenêtre de discussion sans toucher à vos systèmes, et un système qui lit vos dossiers, écrit dans vos outils et agit seul sur certains cas. L’essentiel du coût vient des branchements, de la préparation des données et du filet de sécurité, pas du modèle d’IA lui-même.",
    },
    {
      question: "Combien coûte le fonctionnement d’un agent IA par mois ?",
      answer:
        "Ce coût mensuel additionne quatre postes : les appels aux modèles, facturés à l’usage et donc proportionnels à votre volume réel, l’hébergement et la surveillance, le temps humain de supervision, et les évolutions. Demandez le montant annuel et le volume mensuel qui a servi au calcul : sans réponse, la production n’a pas été chiffrée.",
    },
  ],
  relatedArticles: ["business-case-ia", "diag-data-ia-bpifrance"],
  relatedCasUsage: ["traitement-documents", "assistant-support-client"],
  relatedSecteurs: ["services-b2b", "industrie"],
};

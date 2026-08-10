// Article 1 du blog. Voir .agents/blog.md : « je », aucun prix, chiffres réels
// ou étiquetés illustration, maillage interne obligatoire dans le corps.

import type { BlogArticle } from "@/content/blog";

export const businessCaseIa: BlogArticle = {
  slug: "business-case-ia",
  title: "Chiffrer un projet IA avant de le lancer",
  metaTitle: "Business case IA : chiffrer avant d’engager | Coucou IA",
  metaDescription:
    "Business case IA : les trois chiffres à mesurer avant d’engager un euro (temps passé, temps visé, coût de mise en production) et le seuil qui décide.",
  category: "méthode",
  publishedAt: "2026-08-03",
  lede: "Un projet IA se décide sur trois chiffres mesurés avant la première ligne de code : ce que la tâche vous coûte aujourd’hui, ce qu’elle coûtera après, ce que la mise en production demande. Et renoncer sur la foi de ces trois chiffres vaut autant que lancer.",
  keyTakeaways: [
    "Un business case IA tient sur trois chiffres : le temps que la tâche coûte aujourd’hui, le temps qu’elle coûtera une fois le système en place, et le coût de la mise en production.",
    "Le temps actuel se mesure sur des dossiers réels, chronomètre en main : une estimation donnée en réunion se trompe souvent du simple au double, dans un sens comme dans l’autre.",
    "Le temps qui reste après l’IA n’est jamais zéro : il faut y compter la relecture humaine, les cas renvoyés à quelqu’un et les corrections.",
    "Un business case qui ne peut pas conclure « on ne fait pas » n’est pas un business case : renoncer avant d’engager est un résultat, pas un échec.",
  ],
  blocks: [
    {
      kind: "p",
      text: "Un devis de projet IA porte toujours un chiffre : ce que ça coûte. Les deux qui décident vraiment n’y sont presque jamais : ce que la tâche vous coûte déjà, et ce qu’elle vous coûtera encore une fois le système en place. J’ai lu beaucoup de ces devis avant d’en écrire. Sans les deux autres chiffres, personne ne décide, tout le monde parie.",
    },
    {
      kind: "h2",
      id: "sur-du-vent",
      text: "Pourquoi tant de projets IA se décident sur du vent",
    },
    {
      kind: "p",
      text: "Le déclencheur est presque toujours le même. Une démonstration impressionne, quelqu’un imagine la même chose chez lui, un essai démarre le mois suivant. La démonstration marche toujours : c’est son métier. Six mois plus tard, personne ne sait dire ce que l’outil a rapporté, et le [POC](/glossaire/poc) finit dans un tiroir avec la facture.",
    },
    {
      kind: "p",
      text: "Ce n’est pas de la naïveté, c’est un défaut de mesure. Le travail répétitif coûte cher parce qu’il est dilué : vingt minutes ici, une demi-journée là, jamais sur une seule ligne comptable. Tant que ce coût reste invisible, on ne peut ni le comparer à un investissement, ni savoir qu’on l’a réduit.",
    },
    {
      kind: "p",
      text: "L’erreur voisine coûte tout aussi cher : mettre de l’IA là où une règle fixe suffisait. Avant de chiffrer, vérifiez que le problème est bien flou et varié, sinon la [différence entre automatisation et IA](/glossaire/automatisation-vs-ia) tranche à votre place, et en votre faveur.",
    },
    {
      kind: "h2",
      id: "temps-actuel",
      text: "Chiffre 1 : ce que la tâche vous coûte aujourd’hui",
    },
    {
      kind: "p",
      text: "Celui-là se mesure, il ne s’estime pas. Demandez en réunion combien de temps prend un dossier, vous obtiendrez un chiffre faux, souvent du simple au double, et pas toujours dans le sens que vous croyez. Je préfère suivre **cinq dossiers réels** avec la personne qui les traite, sur sa semaine normale, sans réorganiser sa journée pour l’occasion.",
    },
    {
      kind: "p",
      text: "Ce qu’on chronomètre n’est pas la partie noble du travail, c’est tout ce qui l’entoure :",
    },
    {
      kind: "list",
      items: [
        "Chercher le bon fichier, la bonne version, le bon interlocuteur.",
        "Recopier d’un outil vers un autre ce qui existe déjà quelque part.",
        "Relancer, attendre une réponse, reprendre le dossier à froid.",
        "Reprendre ce qui revient de la relecture, parfois deux fois.",
      ],
    },
    {
      kind: "stat",
      label: "Réponse aux appels d’offres",
      value: "540 h/an",
      caption:
        "Illustration, pas une référence client : 90 dossiers par an, 6 heures mesurées par dossier sur cinq cas réels.",
    },
    {
      kind: "p",
      text: "Une fois les heures posées, convertissez-les avec le coût horaire chargé des personnes concernées. Votre service financier a ce chiffre, inutile de l’inventer. Sur l’exemple ci-dessus, ces 540 heures représentent environ 70 jours de travail par an, sur une tâche que personne ne réclame.",
    },
    {
      kind: "h2",
      id: "temps-vise",
      text: "Chiffre 2 : le temps qui restera après",
    },
    {
      kind: "p",
      text: "Ce chiffre n’est jamais zéro. Un système en production propose un premier jet, extrait des données, trie des demandes : quelqu’un relit, corrige et signe. Il faut aussi compter les cas que le système renvoie à un humain parce qu’il n’est pas sûr, et c’est une bonne nouvelle, pas un défaut de conception.",
    },
    {
      kind: "callout",
      title: "Le piège qui fausse tous les calculs",
      body: "Compter le gain à 100 %. « L’IA rédige la réponse, donc on économise les six heures. » Non : elle rédige un premier jet que quelqu’un relit. Le gain réel, c’est la différence entre le temps mesuré et le temps de relecture, jamais le temps total.",
    },
    {
      kind: "p",
      text: "Le temps visé s’estime avec la personne qui fera la relecture, pas avec le prestataire. Sur l’exemple des appels d’offres, la relecture et la personnalisation d’un premier jet tiennent en 2 heures par dossier, contre 6 aujourd’hui. Soit 180 heures par an au lieu de 540. Vous pouvez retrouver le détail de ce cas sur la page [réponse aux appels d’offres](/cas-usage/reponse-appels-offres).",
    },
    {
      kind: "h2",
      id: "cout-mise-en-production",
      text: "Chiffre 3 : ce que coûte la mise en production",
    },
    {
      kind: "p",
      text: "C’est le chiffre que la plupart des projets sous-estiment, parce qu’ils ne comptent que le développement. Or un système qui tourne tous les matins n’a rien à voir avec une démonstration réussie un soir : la [mise en production](/glossaire/mise-en-production) est le seul jalon à partir duquel vous gagnez quelque chose.",
    },
    {
      kind: "p",
      text: "Un chiffrage sérieux additionne au moins ces postes :",
    },
    {
      kind: "list",
      items: [
        "Le développement du système et son branchement à vos outils existants.",
        "L’accès aux données : documents à rassembler, droits à ouvrir, historique à reprendre.",
        "Le coût d’usage des modèles, proportionnel au volume que vous venez de mesurer.",
        "L’hébergement et la surveillance, pour savoir le jour où le système se trompe.",
        "La formation des équipes et les quelques semaines de réglages après le lancement.",
        "La maintenance annuelle : vos formats bougent, vos outils changent de version.",
      ],
    },
    {
      kind: "p",
      text: "Je ne publie pas de prix, et un prestataire qui vous en donne un avant d’avoir vu vos données vend un catalogue, pas un projet. Ce que vous devez exiger, c’est un [chiffrage détaillé par poste](/blog/prix-projet-ia), séparant l’investissement de départ du coût annuel de fonctionnement. Le premier se rembourse, le second se soustrait au gain, chaque année.",
    },
    {
      kind: "h2",
      id: "le-calcul",
      text: "Le calcul, et le seuil qui décide",
    },
    {
      kind: "p",
      text: "Le gain annuel est une soustraction, puis une multiplication : (temps mesuré aujourd’hui moins temps visé après) fois le coût horaire chargé. Vous le comparez au coût de la première année, fonctionnement compris. Deux lignes suffisent, et elles tiennent sur une feuille devant votre comité.",
    },
    {
      kind: "stat",
      label: "Le même exemple, une fois soustrait",
      value: "360 h/an",
      caption:
        "Illustration, pas une référence client : 540 heures mesurées moins 180 heures de relecture, soit environ 45 jours de travail rendus par an.",
    },
    {
      kind: "callout",
      title: "Ma règle de décision",
      body: "L’investissement de départ doit se rembourser en moins de douze mois de gain. Au-delà, trop de choses auront changé chez vous avant que le compteur ne s’équilibre. Et sous 200 heures par an passées sur la tâche visée, je ne lance pas : le volume ne paiera pas la mise en production.",
    },
    {
      kind: "p",
      text: "Ne cherchez pas la deuxième décimale, cherchez l’ordre de grandeur. Un bon business case se lit d’un coup d’œil : le gain écrase le coût, ou l’inverse. Si le résultat se joue à 10 % près, la réponse est non : votre marge d’erreur sur la mesure est plus large que l’écart que vous êtes en train d’arbitrer.",
    },
    {
      kind: "h2",
      id: "renoncer",
      text: "Renoncer, et pourquoi c’est une réussite",
    },
    {
      kind: "p",
      text: "Le cas le plus fréquent, c’est le non. Il tombe pour trois raisons, presque toujours les mêmes : le volume est trop faible, les données sont introuvables ou inaccessibles, ou la tâche n’ennuie personne. Ces trois questions se testent en quelques minutes avec la [grille par où commencer](/outils/par-ou-commencer), avant même de sortir le chronomètre.",
    },
    {
      kind: "p",
      text: "Dire non coûte quelques jours de mesure. Le découvrir après la mise en service coûte un budget, une équipe démotivée et deux ans de méfiance envers l’IA dans l’entreprise. Un business case qui ne peut pas conclure « on ne fait pas » n’est pas un business case, c’est une plaquette commerciale.",
    },
    {
      kind: "p",
      text: "Un non n’est pas une porte fermée non plus. Il désigne la tâche suivante, et il révèle souvent un gain gratuit au passage : ranger des fichiers, supprimer une double saisie, écrire une règle simple. Vous récupérez une partie du temps sans acheter quoi que ce soit, ce qui reste le meilleur retour possible.",
    },
    {
      kind: "h2",
      id: "par-ou-commencer",
      text: "Par où commencer chez vous",
    },
    {
      kind: "p",
      text: "L’exercice se fait sans prestataire, et il vaut mieux le faire avant d’en appeler un :",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "Listez les trois tâches répétitives dont vos équipes se plaignent le plus.",
        "Passez chacune au filtre volume, données, douleur, et gardez celle qui coche les trois.",
        "Mesurez cinq dossiers réels avec la personne qui les traite, allers-retours compris.",
        "Estimez avec elle le temps de relecture qui restera une fois le système en place.",
        "Demandez un chiffrage détaillé de la mise en production, poste par poste.",
        "Comparez, et acceptez le non si le non gagne.",
      ],
    },
    {
      kind: "p",
      text: "Si l’exercice complet vous semble lourd, sachez que l’État finance une partie du travail : le [Diag Data IA de Bpifrance](/blog/diag-data-ia-bpifrance) prend en charge 40 % d’un état des lieux mené par un expert agréé. Il rend une feuille de route ; les trois chiffres de cet article restent votre affaire.",
    },
    {
      kind: "p",
      text: "Si vous voulez construire une première version vous-même, avec une IA et sans développeur, [le kit de démarrage](/outils/kit-de-demarrage) vous donne la pile, les étapes et le prompt à copier. Et si vous préférez poser vos trois chiffres à voix haute, le point de départ existe pour ça : trente minutes, et je vous dis franchement si ça vaut le coup chez vous.",
    },
  ],
  faq: [
    {
      question: "Comment calculer le ROI d’un projet IA ?",
      answer:
        "Multipliez les heures rendues chaque année (temps mesuré aujourd’hui moins temps de relecture qui restera) par le coût horaire chargé des personnes concernées. Comparez ce gain annuel au coût de la première année, fonctionnement et maintenance compris. Deux lignes, un ordre de grandeur : si l’écart se joue à quelques pour cent, c’est que la réponse est non.",
    },
    {
      question: "Combien de temps avant de voir un retour sur un projet IA ?",
      answer:
        "Le compteur ne démarre pas à la signature, il démarre à la mise en production, quand vos équipes utilisent vraiment le système. Mon repère : si l’investissement de départ ne se rembourse pas en moins de douze mois de gain mesuré, je ne lance pas. Au-delà, votre organisation aura changé avant que le calcul ne s’équilibre.",
    },
    {
      question: "Que faire si le business case est négatif ?",
      answer:
        "On ne lance pas, et c’est l’argent le mieux économisé de l’année. Regardez la tâche suivante sur votre liste : c’est souvent la deuxième ou la troisième qui coche le volume, les données et la douleur. Au passage, un business case négatif montre presque toujours un gain gratuit : une double saisie à supprimer ou des fichiers à ranger, sans acheter quoi que ce soit.",
    },
  ],
  relatedArticles: ["ai-act-pme-obligations", "openclaw-vs-hermes-agent"],
  relatedCasUsage: ["reponse-appels-offres", "traitement-documents"],
  relatedSecteurs: ["services-b2b", "expertise-comptable"],
};

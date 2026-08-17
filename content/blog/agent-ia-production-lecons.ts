// Article 6 du blog. Voir .agents/blog.md : « je », aucun prix Coucou IA,
// chiffres réels et sourcés (Livia, produit Coucou IA, jamais un client),
// maillage interne obligatoire dans le corps.

import type { BlogArticle } from "@/content/blog";

export const agentIaProductionLecons: BlogArticle = {
  slug: "agent-ia-production-lecons",
  title: "Ce que construire Livia m’a appris sur les agents IA en production",
  metaTitle: "Agent IA en production : ce qui casse | Coucou IA",
  metaDescription:
    "Agent IA en production : ce qui casse vraiment, entre données sales, cas limites du métier et pannes. Retour d’expérience sur Livia, agent IA Qualiopi.",
  category: "coulisses",
  publishedAt: "2026-08-13",
  lede: "Un agent IA en production casse rarement sur le modèle. Il casse sur les cas limites du métier, les données sales et la confiance qu’il faut regagner après un incident. C’est ce que m’a appris Livia, l’agent IA que je construis pour la conformité Qualiopi.",
  keyTakeaways: [
    "Un agent IA en production casse rarement sur le modèle : il casse sur les données sales, les cas limites du métier et les branchements aux outils existants.",
    "Faire dire « je ne sais pas » à un agent IA est un choix de conception, posé dès le premier jour et sur chaque type de décision.",
    "L’autonomie d’un agent IA se règle action par action : lire, proposer, écrire et envoyer sont quatre niveaux de risque différents, à décider séparément.",
    "Un agent qui envoie deux fois la même relance après une panne abîme la confiance des utilisateurs plus qu’un agent resté silencieux une heure.",
    "Sans mesure hebdomadaire (part des dossiers traités seul, part corrigée avant envoi, délai, coût réel), impossible de savoir si un agent IA en production sert vraiment son entreprise.",
  ],
  blocks: [
    {
      kind: "p",
      text: "Livia répond à une question précise : où en est un organisme de formation sur les 32 indicateurs du référentiel Qualiopi, et quelles preuves lui manquent avant l’audit. La version que je montrais en démonstration répondait aux dossiers propres, ceux que j’avais choisis pour qu’elle ait raison. La version qui tourne en production doit répondre aux dossiers sales, ceux que personne n’a choisis.",
    },
    {
      kind: "h2",
      id: "la-demo-et-la-production",
      text: "La démo tient dix minutes, la production tient des mois",
    },
    {
      kind: "p",
      text: "Ce partage du travail surprend presque tout le monde la première fois. La partie qui marche, celle qu’on montre en réunion, prend quelques semaines à construire. La partie qui tient tous les jours, celle que personne ne montre, prend le reste du temps : le dossier incomplet, le nom mal orthographié, le format de fichier que personne n’avait prévu. Une démo choisit ses cas. La production les reçoit tels quels.",
    },
    {
      kind: "p",
      text: "[Un agent IA](/glossaire/agent-ia) observe une situation, décide d’une action et agit, parfois plusieurs fois de suite, sans qu’un humain reformule la demande à chaque étape. C’est cette capacité à enchaîner les décisions, sur des dossiers qu’il n’a jamais vus, qui rend la production différente de la démonstration.",
    },
    {
      kind: "h2",
      id: "ce-qui-casse-vraiment",
      text: "Ce qui casse vraiment un agent IA",
    },
    {
      kind: "p",
      text: "Les données sales arrivent en tête : un champ vide, un intitulé de formation mal saisi, un justificatif scanné à l’envers. Viennent ensuite les cas limites du métier, ceux qu’aucune documentation ne liste parce qu’ils n’arrivent qu’une fois par trimestre. Puis les branchements aux outils existants : l’export qui change de colonne d’un mois sur l’autre, l’API qui renvoie une erreur silencieuse.",
    },
    {
      kind: "stat",
      label: "Indicateurs Qualiopi suivis par Livia",
      value: "32",
      caption:
        "Livia, l’agent IA que je construis pour la conformité Qualiopi, surveille les 32 indicateurs du référentiel. Sur le terrain, ce sont 32 façons différentes qu’un organisme a de ranger ses preuves. Source : livia.tech.",
    },
    {
      kind: "p",
      text: "Construire un agent qui gère un référentiel de 32 indicateurs demande de comprendre que chaque organisme range ses preuves différemment : certains dans un espace de stockage partagé, d’autres dans une boîte mail, d’autres sur papier. C’est le même problème que je retrouve dans tout [traitement de documents](/cas-usage/traitement-documents). La difficulté tient à reconnaître la même information sous des formes différentes : un intitulé dans un tableau, une date dans un scan, une signature au bas d’une page.",
    },
    {
      kind: "h2",
      id: "savoir-s-arreter",
      text: "Savoir s’arrêter est un choix de conception",
    },
    {
      kind: "p",
      text: "Un agent lent agace. Un agent qui répond de travers avec assurance coûte de l’argent et de la confiance, les deux d’un coup. Faire dire « je ne sais pas » à un agent IA est un choix posé dès le premier jour, sur chaque type de décision, et il faut le vouloir.",
    },
    {
      kind: "p",
      text: "Sur Livia, ça veut dire fixer un seuil de certitude en dessous duquel l’agent remonte le dossier à un humain plutôt que de trancher seul. Ça veut dire aussi accepter qu’un agent se taise plus souvent, pour rester juste chaque fois qu’il répond. Le risque inverse porte un nom : l’[hallucination](/glossaire/hallucination), une réponse formulée avec assurance et sans fondement réel. Elle se combat à la conception, avant que l’agent n’arrive en production.",
    },
    {
      kind: "h2",
      id: "autonomie-action-par-action",
      text: "L’autonomie se règle action par action",
    },
    {
      kind: "p",
      text: "Chaque action d’un agent IA porte son propre niveau de risque et appelle sa propre décision. Lire un dossier, proposer une correction, écrire un message, l’envoyer : quatre gestes bien distincts.",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "Lire : l’agent consulte les preuves et les compare au référentiel, sans rien modifier.",
        "Proposer : l’agent signale un écart et suggère une correction, qu’un humain valide ou rejette.",
        "Écrire : l’agent rédige un message ou un document, prêt à partir, mais encore dans le brouillon.",
        "Envoyer : l’agent transmet, à un client, à un auditeur, à une administration.",
      ],
    },
    {
      kind: "p",
      text: "Sur Livia, tout ce qui part vers un organisme ou vers un auditeur passe par un humain avant l’envoi. C’est le niveau que je monte en dernier, seulement quand les trois premiers ont fait leurs preuves en usage réel.",
    },
    {
      kind: "callout",
      title: "Cadrer l’autonomie avant le code",
      body: "Poser ces quatre niveaux avant d’écrire une ligne de traitement évite la question la plus coûteuse à se poser après coup : « qui a laissé partir ça ? ». C’est un sujet à régler tôt, avant le premier prototype.",
    },
    {
      kind: "h2",
      id: "le-lendemain-d-une-panne",
      text: "Ce qu’une démo ne montre jamais : le lendemain d’une panne",
    },
    {
      kind: "p",
      text: "Le serveur qui redémarre, le traitement qui s’arrête à moitié, la file d’attente qui double : aucun système n’échappe à la panne. Ce qui compte, c’est ce qui se passe après.",
    },
    {
      kind: "list",
      items: [
        "Une reprise sans doublon : l’agent doit savoir ce qu’il a déjà fait avant de reprendre, sinon il refait le travail, ou relance deux fois le même message.",
        "Un journal complet de chaque action : quel dossier, quelle décision, quelle preuve à l’appui, horodaté et consultable.",
        "La capacité à rejouer une séquence précise, sans tout relancer depuis le début.",
      ],
    },
    {
      kind: "p",
      text: "Un agent qui envoie deux fois la même relance à un client abîme la confiance plus qu’un agent resté silencieux une heure. La panne se pardonne facilement. Le doublon reste dans la boîte mail du client, avec la date et l’heure. C’est ce genre de détail qui décide si un dirigeant fait confiance à un agent IA en [mise en production](/glossaire/mise-en-production).",
    },
    {
      kind: "h2",
      id: "les-chiffres-hebdomadaires",
      text: "Les quatre chiffres à regarder chaque semaine",
    },
    {
      kind: "p",
      text: "Une fois l’agent en production, la question à se poser chaque semaine est simple : est-ce que ça marche encore aujourd’hui ? Quatre chiffres suffisent à y répondre. Encore faut-il les regarder toutes les semaines, et non le seul jour du lancement.",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "La part des dossiers traités sans intervention humaine : si elle baisse, quelque chose dans les données ou le métier a changé sans que la conception suive.",
        "La part des propositions corrigées avant envoi : un indicateur direct de la justesse de l’agent.",
        "Le délai de traitement, du dossier reçu à la réponse prête.",
        "Le coût mensuel réel de fonctionnement : appels au modèle, stockage, temps humain de supervision.",
      ],
    },
    {
      kind: "p",
      text: "Sans ces quatre chiffres, l’agent devient un acte de foi : on sent qu’il aide, sans savoir où ni de combien. C’est le même réflexe que je décris pour [chiffrer un projet IA avant de le lancer](/blog/business-case-ia) : mesurer avant, pendant et après.",
    },
    {
      kind: "stat",
      label: "Préparation d’un audit Qualiopi",
      value: "2 jours",
      caption: "Contre 3 semaines avant Livia. Source : livia.tech.",
    },
    {
      kind: "callout",
      title: "Un score, pour montrer les trous",
      body: "Livia calcule un score Qualiopi factuel en dix minutes. Le chiffre est utile parce qu’il est mesuré : il montre où sont les trous dans le dossier, à un instant donné. Source : livia.tech.",
    },
    {
      kind: "h2",
      id: "si-je-recommencais",
      text: "Si je recommençais Livia demain",
    },
    {
      kind: "p",
      text: "Si je recommençais Livia demain, je changerais l’ordre du travail. Je construirais le journal des actions et la reprise sans doublon avant la première fonctionnalité visible. Je fixerais les quatre niveaux d’autonomie, lire, proposer, écrire, envoyer, sur un tableau avant d’écrire une ligne de traitement des données. Et je choisirais les quatre chiffres hebdomadaires avant le premier utilisateur.",
    },
    {
      kind: "p",
      text: "Rien de tout ça ne se voit en démonstration. C’est justement pour ça que personne ne le montre, et que presque personne ne le construit à temps.",
    },
    {
      kind: "p",
      text: "Si vous vous demandez par où commencer sur votre projet, [cette grille gratuite](/outils/par-ou-commencer) pose trois questions : le volume, les données, la douleur. Ensuite, le point de départ : trente minutes, gratuites, pour regarder vos tâches répétitives et décider du premier chantier.",
    },
  ],
  faq: [
    {
      question: "Combien de temps faut-il pour mettre un agent IA en production ?",
      answer:
        "Le délai dépend surtout du nombre de cas limites du métier à couvrir et de la qualité des données de départ. La partie visible, celle qui marche en démonstration, prend quelques semaines. La partie qui tient tous les jours, avec les données sales et les cas particuliers, prend le plus de temps.",
    },
    {
      question:
        "Pourquoi un agent IA qui marche en démonstration échoue-t-il en production ?",
      answer:
        "Une démonstration choisit ses cas : des dossiers propres, préparés à l’avance. La production reçoit les dossiers réels, avec des champs vides, des formats inattendus et des situations que personne n’a documentées. L’échec vient presque toujours de là.",
    },
    {
      question: "Faut-il laisser un agent IA agir sans validation humaine ?",
      answer:
        "Cela dépend du type d’action. Lire un dossier ou proposer une correction peut se faire seul dès le début. Écrire un message prêt à partir, ou l’envoyer à un client ou à un auditeur, mérite une validation humaine, au moins tant que l’agent n’a pas fait ses preuves sur la durée.",
    },
  ],
  relatedArticles: [
    "whatsapp-planning-equipe-terrain",
    "openclaw-vs-hermes-agent",
    "business-case-ia",
    "prix-projet-ia",
  ],
  relatedCasUsage: ["traitement-documents", "assistant-support-client"],
  relatedSecteurs: ["services-b2b", "expertise-comptable"],
};

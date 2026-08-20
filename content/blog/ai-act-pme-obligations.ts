// Article 2 du blog. Voir .agents/blog.md : « je », aucun prix, chiffres réels
// ou étiquetés illustration, maillage interne obligatoire dans le corps.

import type { BlogArticle } from "@/content/blog";

export const aiActPmeObligations: BlogArticle = {
  slug: "ai-act-pme-obligations",
  title: "L’AI Act pour une PME : ce qui s’applique vraiment",
  metaTitle: "AI Act PME : ce qui s’applique en 2026 | Coucou IA",
  metaDescription:
    "AI Act PME : ce qui s’applique au 2 août 2026, la question fournisseur ou déployeur, l’obligation de 2025 que presque personne n’a vue, et ce qui attend 2027.",
  category: "décryptage",
  publishedAt: "2026-08-06",
  lede: "Depuis le 2 août 2026, l’AI Act ne demande pas à votre PME un dossier de conformité, mais trois choses simples : dire quand on parle à une IA, avoir formé son personnel depuis février 2025, et savoir si vous êtes fournisseur ou déployeur. La partie qui fait peur, les systèmes à haut risque, a été repoussée à décembre 2027.",
  keyTakeaways: [
    "Depuis le 2 août 2026, l’essentiel de l’AI Act (règlement UE 2024/1689) devient applicable, avec en premier lieu l’article 50 sur la transparence et la capacité des autorités nationales à contrôler et sanctionner.",
    "La quasi-totalité des PME sont des déployeurs de systèmes d’IA : les obligations les plus lourdes visent d’abord les fournisseurs, ceux qui conçoivent ou commercialisent un système sous leur nom.",
    "L’article 4 sur la maîtrise de l’IA est en vigueur depuis le 2 février 2025, s’applique sans seuil de taille, et n’exige aucune certification : un format libre et proportionné suffit, à condition de pouvoir le prouver.",
    "Le Digital Omnibus, publié le 24 juillet 2026, a repoussé les obligations liées au haut risque au 2 décembre 2027 pour les systèmes autonomes et au 2 août 2028 pour ceux intégrés à des produits déjà réglementés.",
    "Pour une PME, le plafond de sanction retenu est le plus bas des deux montants (fixe ou pourcentage du chiffre d’affaires), alors que les grandes entreprises se voient appliquer le plus élevé.",
  ],
  blocks: [
    {
      kind: "p",
      text: "Un dirigeant d’une PME de services de 60 salariés m’assurait, il y a peu, ne pas utiliser l’IA dans son entreprise. Une demi-journée d’entretiens avec ses équipes plus tard, on comptait 11 usages différents, dont 4 qu’il ignorait : un tri de CV côté RH, deux assistants de rédaction, un outil de résumé de comptes rendus. Cas illustratif, sans nom de client, mais il dit l’essentiel : l’AI Act ne s’applique pas au projet IA que vous préparez. Il s’applique à ce qui tourne déjà chez vous, sans que vous l’ayez décidé.",
    },
    {
      kind: "p",
      text: "Ce règlement européen, vous en avez sans doute entendu la version anxiogène : amendes à huit chiffres, dossiers de conformité, audits. La réalité du 2 août 2026 est plus étroite. Trois vérifications concrètes suffisent à une PME qui ne fait ni IA médicale ni recrutement automatisé. La partie qui fait la une, elle, attendra 2027.",
    },
    {
      kind: "h2",
      id: "ce-qui-change",
      text: "Ce qui a changé le 2 août 2026, et ce qui n’a pas bougé",
    },
    {
      kind: "p",
      text: "L’AI Act, le [glossaire](/glossaire/ai-act) le détaille, est le règlement européen (UE) 2024/1689. Entré en vigueur le 1er août 2024, il s’applique par étapes depuis. Le 2 août 2026 est la plus large de ces étapes : l’essentiel du texte devient applicable, en particulier l’article 50 sur la transparence et la capacité des autorités nationales à contrôler et sanctionner.",
    },
    {
      kind: "p",
      text: "Ce qui n’a pas bougé, c’est tout ce qui s’appliquait déjà. Les pratiques interdites et l’obligation de maîtrise de l’IA depuis le 2 février 2025. Les obligations des fournisseurs de modèles à usage général et le régime de gouvernance depuis le 2 août 2025. Le 2 août 2026 ajoute une couche, il n’efface pas les précédentes.",
    },
    {
      kind: "h2",
      id: "fournisseur-ou-deployeur",
      text: "La question qui décide de tout : fournisseur ou déployeur ?",
    },
    {
      kind: "p",
      text: "L’AI Act distingue deux rôles. Le fournisseur développe ou met sur le marché un système d’IA sous son nom. Le déployeur l’utilise dans un cadre professionnel. La quasi-totalité des PME sont des déployeurs : elles achètent un outil, elles ne le construisent pas pour le vendre. Les obligations les plus lourdes du règlement visent d’abord les fournisseurs.",
    },
    {
      kind: "p",
      text: "Une nuance compte, et elle échappe souvent : une PME qui met un système d’IA en marque blanche sous son propre nom, ou qui le modifie substantiellement, peut basculer côté fournisseur. Si vous revendez un assistant conçu ailleurs en l’habillant de votre marque, posez-vous la question avant de la balayer.",
    },
    {
      kind: "callout",
      title: "Quand un déployeur devient fournisseur sans s’en rendre compte",
      body: "Marque blanche, modification substantielle du modèle, intégration poussée dans votre propre produit : ce sont les trois cas qui font basculer une PME du côté des obligations lourdes. En dehors de ces cas, vous restez déployeur.",
    },
    {
      kind: "h2",
      id: "dire-que-c-est-une-ia",
      text: "Dire que c’est une IA : l’obligation qui vous concerne vraiment",
    },
    {
      kind: "p",
      text: "L’article 50 tient en deux règles. Signaler clairement à une personne qu’elle échange avec un système d’IA, agent conversationnel ou avatar. Rendre identifiables les contenus générés ou fortement modifiés par une IA, marquage technique ou mention visible. C’est l’obligation qui touche le plus de PME au 2 août 2026, bien avant le haut risque.",
    },
    {
      kind: "p",
      text: "Un [assistant qui répond aux clients](/cas-usage/assistant-support-client) sur votre site en est l’exemple le plus direct. Dans ceux que je mets en production, ça tient en une phrase d’ouverture et un bouton pour passer à un humain. Ce n’est pas une contrainte de conception : je le mettrais de toute façon.",
    },
    {
      kind: "p",
      text: "La question suivante arrive presque toujours dans le même souffle, et elle porte sur les données : où elles sont hébergées, qui peut les lire. Le règlement ne la tranche pas à votre place, votre architecture si. Le [glossaire sur l’IA souveraine](/glossaire/ia-souveraine) donne les termes du choix.",
    },
    {
      kind: "h2",
      id: "obligation-ratee",
      text: "L’obligation que presque tout le monde a ratée",
    },
    {
      kind: "p",
      text: "L’article 4 est en vigueur depuis le 2 février 2025, dix-huit mois avant l’échéance dont tout le monde parle. Il impose à tout fournisseur et tout déployeur de veiller à ce que son personnel dispose d’un niveau suffisant de maîtrise de l’IA. Aucun seuil de taille, aucun chiffre d’affaires minimum : une entreprise de 5 salariés est concernée autant qu’une ETI.",
    },
    {
      kind: "p",
      text: "Aucune certification n’est exigée. Le format est libre : un atelier d’une heure, une note interne, une session avec les équipes qui utilisent l’outil au quotidien. La formation doit être proportionnée aux rôles, et vous devez pouvoir en apporter la preuve si on vous la demande. C’est l’obligation la plus simple à remplir, et la plus souvent oubliée.",
    },
    {
      kind: "stat",
      label: "Article 4, maîtrise de l’IA",
      value: "2 fév. 2025",
      caption:
        "Applicable à tout fournisseur et tout déployeur, sans seuil de taille ni certification exigée. Source : règlement (UE) 2024/1689.",
    },
    {
      kind: "h2",
      id: "haut-risque-reporte",
      text: "Le haut risque : repoussé à 2027",
    },
    {
      kind: "p",
      text: "Le 16 juin 2026, le Parlement européen a adopté le règlement dit « Digital Omnibus ». Le Conseil l’a validé le 29 juin, il a été publié le 24 juillet. Il reporte les obligations des systèmes à haut risque : au 2 décembre 2027 pour les systèmes autonomes de l’annexe III (recrutement, évaluation de solvabilité, éducation, biométrie), au 2 août 2028 pour ceux intégrés à des produits déjà réglementés, comme les dispositifs médicaux ou les jouets connectés.",
    },
    {
      kind: "p",
      text: "Deux dates restent proches. Le 2 décembre 2026, deux interdictions nouvelles entrent en vigueur, sur les contenus intimes non consentis et les contenus pédocriminels. La même date sert de délai pour marquer les contenus générés par IA que vous aviez déjà diffusés avant. Si vous travaillez dans la [santé et le médico-social](/secteurs/sante-medico-social), c’est là que le report change vraiment votre calendrier : le sursis est réel, il n’est pas indéfini.",
    },
    {
      kind: "stat",
      label: "Haut risque, annexe III",
      value: "2 déc. 2027",
      caption:
        "Recrutement, évaluation de solvabilité, éducation, biométrie : date repoussée par le Digital Omnibus, publié le 24 juillet 2026.",
    },
    {
      kind: "h2",
      id: "ce-que-vous-risquez",
      text: "Les sanctions, et la règle qui vous protège",
    },
    {
      kind: "p",
      text: "L’article 99 fixe trois étages. Jusqu’à 35 millions d’euros ou 7 % du chiffre d’affaires mondial pour les pratiques interdites. Jusqu’à 15 millions ou 3 % pour la plupart des autres manquements, dont l’article 50. Jusqu’à 7,5 millions ou 1 % pour des informations inexactes fournies aux autorités.",
    },
    {
      kind: "callout",
      title: "Le chiffre de 35 millions n’est pas votre plafond",
      body: "Pour les grandes entreprises, le plafond retenu est le plus élevé des deux montants. Pour les PME et les jeunes entreprises, c’est l’inverse : le plafond retenu est le plus bas des deux. Le chiffre qui circule partout n’est, dans l’immense majorité des cas, pas celui qui s’applique à vous.",
    },
    {
      kind: "h2",
      id: "cette-semaine",
      text: "Ce que je ferais chez vous cette semaine",
    },
    {
      kind: "p",
      text: "Retour à la PME de services et à ses 11 usages. Le registre n’a pas demandé un mois de cabinet, ni un consultant en cravate. Il a demandé une demi-journée d’entretiens et une liste. C’est l’ordre de grandeur du travail à faire avant tout chiffrage plus large : [chiffrer un projet IA avant de l’engager](/blog/business-case-ia) commence exactement pareil, en mesurant ce qui existe déjà.",
    },
    {
      kind: "stat",
      label: "Usages recensés",
      value: "11 usages",
      caption:
        "Cas illustratif, sans nom de client : PME de services, 60 salariés, une demi-journée d’entretiens, dont 4 usages ignorés de la direction.",
    },
    {
      kind: "p",
      text: "Trois choses, dans l’ordre, si vous n’avez encore rien fait.",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "Recensez, en une demi-journée d’entretiens, les usages de l’IA déjà en place dans vos équipes, y compris ceux dont la direction n’a jamais entendu parler.",
        "Vérifiez, pour chacun, s’il parle à un client ou produit un contenu diffusé : c’est là que l’article 50 s’applique, et c’est là qu’il faut le signaler.",
        "Organisez une session de maîtrise de l’IA proportionnée aux rôles concernés, et gardez-en une trace écrite : c’est l’article 4, il est déjà en vigueur.",
      ],
    },
    {
      kind: "p",
      text: "Pas de dossier de conformité à monter cette semaine. Trois vérifications, un registre à écrire, et [une grille en trois questions](/outils/par-ou-commencer) si vous ne savez pas par où commencer. Le haut risque attendra 2027, et vous aurez le temps de vous y préparer sans le faire dans l’urgence.",
    },
    {
      kind: "p",
      text: "Une fois le registre écrit, le document qui le prolonge est [la charte d’usage de l’IA](/blog/charte-ia-entreprise) : elle dit à vos équipes quels outils sont approuvés, quelles données ne sortent jamais et ce qui doit être relu avant d’être envoyé. J’en donne le modèle, et la procédure qui la rend opposable.",
    },
  ],
  faq: [
    {
      question: "L’AI Act s’applique-t-il aux PME ?",
      answer:
        "Oui, sans seuil de taille pour la plupart des obligations. La quasi-totalité des PME ont le statut de déployeur, donc des obligations plus légères que celles qui pèsent sur les concepteurs de systèmes. L’article 4 sur la maîtrise de l’IA s’applique même aux plus petites structures.",
    },
    {
      question: "Quelles sont les obligations de l’AI Act au 2 août 2026 ?",
      answer:
        "Cette date rend applicable l’essentiel du règlement, avec en premier lieu l’article 50 sur la transparence : signaler qu’on parle à une IA, identifier les contenus générés. Les autorités nationales peuvent aussi contrôler et sanctionner à partir de cette date. Les obligations liées au haut risque, elles, ont été repoussées à 2027 et 2028.",
    },
    {
      question: "Faut-il former ses salariés à l’IA pour être en règle ?",
      answer:
        "Oui, c’est l’article 4, en vigueur depuis février 2025, qui l’impose à tout fournisseur et tout déployeur, sans distinction de taille. Aucun programme officiel n’est exigé : le format est libre, mais la formation doit être proportionnée aux rôles et l’entreprise doit pouvoir en apporter la preuve.",
    },
  ],
  relatedArticles: ["charte-ia-entreprise", "business-case-ia"],
  relatedCasUsage: ["assistant-support-client", "qualification-leads"],
  relatedSecteurs: ["sante-medico-social", "assurance-mutuelle"],
};

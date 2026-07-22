// Glossaire « L’IA sans jargon » (/glossaire et /glossaire/[slug]).
// Le positionnement de la marque en contenu : expliquer l’IA aux dirigeants de
// PME, sans jargon. La « définition » de chaque terme est citable telle quelle
// (objectif AI-SEO) et sert aussi de définition d’une ligne sur l’index.
// Chiffres = exemples illustratifs (label « Exemple »), jamais des références.
// Slugs croisés vérifiés dans content/secteurs.ts et content/cas-usage-pages.ts.

export type GlossaireTerm = {
  slug: string;
  // Nom court : cartes de l’index, breadcrumb, liens croisés, JSON-LD DefinedTerm.
  name: string;
  // Titre H1 complet de la page terme.
  h1: string;
  // ≤ 60 caractères.
  metaTitle: string;
  // ~150 caractères, contient la définition courte.
  metaDescription: string;
  // La définition citable : 1 à 2 phrases autosuffisantes. Lede de la page,
  // définition d’une ligne sur l’index, et description du JSON-LD DefinedTerm.
  definition: string;
  // L’image concrète, l’analogie du quotidien d’une PME. Jamais condescendant.
  explanation: string;
  // Le terme relié à un usage concret : gain, risque, décision d’achat.
  whatItChanges: string;
  // Une situation PME réaliste. Chiffres étiquetés « Exemple » uniquement.
  example: string;
  // 2 ou 3 slugs de termes liés dans le glossaire.
  relatedTerms: string[];
  // Slugs /cas-usage pour le maillage (0 à 2, total avec relatedSecteurs : 1 à 2).
  relatedCasUsage: string[];
  // Slugs /secteurs pour le maillage (0 à 2, total avec relatedCasUsage : 1 à 2).
  relatedSecteurs: string[];
};

// Copie du hub /glossaire.
export const glossaireHub = {
  metaTitle: "L’IA sans jargon : le glossaire pour dirigeants | Coucou IA",
  metaDescription:
    "Le glossaire de l’IA sans jargon pour dirigeants de PME : RAG, agent IA, LLM, hallucination, AI Act. Chaque terme en clair, et ce que ça change chez vous.",
  h1: "L’IA sans jargon",
  intro:
    "Chaque mot de l’IA, expliqué en clair pour un dirigeant : la définition, l’image concrète, et ce que ça change dans votre PME. Pas de charabia, pas de survente.",
};

// Copie transverse des gabarits glossaire (même rôle que spokes.ts pour les spokes).
export const glossaireShared = {
  eyebrow: "L’IA sans jargon",
  definitionLabel: "Définition",
  explanationTitle: "L’image, pour un dirigeant",
  whatItChangesTitle: "Ce que ça change dans votre PME",
  exampleTitle: "Un exemple concret",
  exampleLabel: "Exemple",
  relatedTermsHeading: "À lire aussi dans le glossaire",
  relatedPagesHeading: "Voir en pratique",
  cta: {
    title: "Un mot clair, c’est un bon début. Un système qui tourne, c’est mieux.",
    sub: "30 minutes, gratuites et sans engagement. Je vous dis où l’IA rapporte chez vous, et où elle ne sert à rien.",
  },
} as const;

export const glossaire: GlossaireTerm[] = [
  {
    slug: "ia-generative",
    name: "IA générative",
    h1: "L’IA générative, expliquée simplement",
    metaTitle: "IA générative : la définition claire | Coucou IA",
    metaDescription:
      "IA générative : définition simple pour dirigeant. Une IA qui produit du contenu neuf (texte, image, synthèse) à partir d’une consigne. L’image et un exemple.",
    definition:
      "L’IA générative est une intelligence artificielle qui produit du contenu neuf (texte, image, code, synthèse) au lieu de seulement classer ou prédire. Vous lui donnez une consigne, elle rédige une réponse originale à partir de tout ce qu’elle a appris.",
    explanation:
      "Voyez un collaborateur très rapide qui a beaucoup lu et sait rédiger un premier jet sur presque tout, mais qui n’a jamais mis les pieds dans votre entreprise. Il écrit vite et plutôt bien. Il ne connaît ni vos dossiers, ni vos clients, ni vos règles maison.",
    whatItChanges:
      "C’est la brique qui rédige vos premiers jets : devis, réponses, comptes rendus, courriers. Le gain n’est pas magique, c’est le temps de la page blanche qui disparaît. Le risque : elle écrit avec assurance même quand elle se trompe. Un humain valide toujours avant l’envoi.",
    example:
      "Exemple : une PME qui répond à un appel d’offres. L’IA rédige un premier jet à partir de vos documents en quelques minutes, là où un chargé d’affaires y passait une demi-journée. Il relit, ajuste ce qui est propre à ce client, et signe.",
    relatedTerms: ["llm", "hallucination", "machine-learning"],
    relatedCasUsage: ["reponse-appels-offres"],
    relatedSecteurs: [],
  },
  {
    slug: "llm",
    name: "Grand modèle de langage (LLM)",
    h1: "Le grand modèle de langage (LLM), sans jargon",
    metaTitle: "LLM (grand modèle de langage) : définition | Coucou IA",
    metaDescription:
      "LLM (grand modèle de langage) : le moteur de l’IA qui rédige du texte. Définition simple pour dirigeant, l’image concrète et ce que ça change dans votre PME.",
    definition:
      "Un grand modèle de langage (LLM, de l’anglais large language model) est le moteur de l’IA qui rédige du texte. Entraîné sur d’énormes quantités d’écrits, il prédit les mots les plus probables pour former une réponse cohérente à votre demande.",
    explanation:
      "Pensez à un moteur, comme celui d’une voiture. ChatGPT, Claude, Gemini, Mistral sont des carrosseries différentes autour du même type de moteur. Il est puissant, mais générique : seul, sorti de l’usine, il ne connaît rien de votre activité.",
    whatItChanges:
      "C’est ce que vous « louez » à un fournisseur. Choisir un modèle, c’est arbitrer entre qualité, coût et lieu d’hébergement de vos données. Vous n’achetez pas le moteur, vous le branchez sur vos documents et vos process. C’est ce branchement qui crée la valeur, pas le moteur nu.",
    example:
      "Exemple : un assistant support client s’appuie sur un LLM pour comprendre la question et rédiger la réponse. Mais la réponse juste vient de VOS fiches produits et de votre historique de tickets, pas des connaissances générales du modèle.",
    relatedTerms: ["ia-generative", "token", "prompt"],
    relatedCasUsage: ["assistant-support-client"],
    relatedSecteurs: [],
  },
  {
    slug: "rag",
    name: "RAG",
    h1: "Le RAG : l’IA qui répond avec vos documents",
    metaTitle: "RAG : la définition simple pour dirigeant | Coucou IA",
    metaDescription:
      "RAG : l’IA qui répond à partir de VOS documents plutôt que de connaissances générales, en citant ses sources. Définition simple, l’image et un exemple PME.",
    definition:
      "Le RAG (retrieval-augmented generation) est une IA qui répond à partir de VOS documents plutôt que de ses seules connaissances générales. Elle va chercher les passages utiles dans votre base (contrats, procédures, historique), puis rédige une réponse appuyée sur ces sources.",
    explanation:
      "C’est la différence entre un consultant qui répond de mémoire et un qui ouvre d’abord votre dossier avant de parler. Le RAG lit vos documents, puis répond, et vous montre d’où vient l’information. Vous pouvez vérifier la source d’un clic.",
    whatItChanges:
      "C’est souvent le premier cas d’usage vraiment rentable en PME, et le moins risqué. L’IA répond avec vos vraies réponses, cite ses sources, et n’a pas besoin d’un modèle réentraîné pour ça. Résultat : moins d’inventions, plus de confiance, une mise en route rapide.",
    example:
      "Exemple : une entreprise industrielle dont les procédures sont éparpillées entre un Drive, une messagerie et un vieil ERP. Avec le RAG, un salarié pose sa question en langage courant et retrouve la bonne procédure en quelques secondes, source à l’appui, au lieu d’une demi-heure de recherche.",
    relatedTerms: ["hallucination", "llm", "ia-souveraine"],
    relatedCasUsage: ["recherche-interne", "assistant-support-client"],
    relatedSecteurs: [],
  },
  {
    slug: "agent-ia",
    name: "Agent IA",
    h1: "L’agent IA : l’IA qui agit, pas seulement qui répond",
    metaTitle: "Agent IA : définition simple pour dirigeant | Coucou IA",
    metaDescription:
      "Agent IA : un programme qui exécute une tâche de bout en bout, pas seulement répondre. Définition simple pour dirigeant, l’image concrète et un exemple PME.",
    definition:
      "Un agent IA est un programme qui exécute une tâche de bout en bout pour vous, au lieu de seulement répondre à une question. Il enchaîne des étapes (lire, décider, agir dans vos outils) pour atteindre un objectif, dans les limites que vous fixez.",
    explanation:
      "C’est la différence entre demander un renseignement à un assistant et lui confier une mission : « trie ces demandes et envoie chacune au bon commercial ». L’assistant répond à une question. L’agent, lui, abat la tâche du début à la fin.",
    whatItChanges:
      "C’est ce qui fait passer l’IA d’outil de réponse à collègue qui traite une tâche répétitive. Le gain est réel. La vraie question à poser : jusqu’où le laisse-t-on décider seul, et où un humain valide. Un agent utile est un agent cadré, pas un agent lâché sans garde-fou.",
    example:
      "Exemple : une entreprise de services reçoit 150 demandes par mois sur quatre canaux. Un agent qualifie chaque demande, remplit la fiche dans le CRM et la route au bon commercial. L’équipe démarre la journée avec des dossiers déjà triés, sans une heure de tri manuel.",
    relatedTerms: ["automatisation-vs-ia", "rag", "llm"],
    relatedCasUsage: ["qualification-leads", "traitement-documents"],
    relatedSecteurs: [],
  },
  {
    slug: "machine-learning",
    name: "Machine learning",
    h1: "Le machine learning, expliqué à un dirigeant",
    metaTitle: "Machine learning : la définition simple | Coucou IA",
    metaDescription:
      "Machine learning (apprentissage automatique) : un programme qui apprend à partir d’exemples plutôt que de règles écrites. Définition simple, l’image, un exemple.",
    definition:
      "Le machine learning (apprentissage automatique) est la méthode qui permet à un programme d’apprendre à partir d’exemples, au lieu d’être programmé règle par règle. On lui montre beaucoup de cas passés, il en tire des régularités pour traiter des cas nouveaux.",
    explanation:
      "Voyez un nouveau collaborateur qui apprend en observant des centaines de dossiers déjà traités, plutôt qu’en lisant un manuel de procédures. Plus les exemples sont nombreux et propres, meilleur il devient. Des exemples faux ou en désordre, et il apprend de travers.",
    whatItChanges:
      "C’est la famille de techniques sous le capot de presque toute l’IA, y compris les LLM. Ce qu’il faut en retenir : la qualité dépend de VOS données. Des données éparses ou fausses donnent un modèle médiocre. C’est pourquoi on commence toujours par regarder ce que vous avez, avant de promettre quoi que ce soit.",
    example:
      "Exemple : un service commercial qui veut prioriser ses demandes entrantes. À partir de l’historique des affaires gagnées et perdues, un modèle apprend à repérer les demandes qui ressemblent à vos bons clients, et remonte les plus prometteuses en tête de liste.",
    relatedTerms: ["ia-generative", "fine-tuning", "llm"],
    relatedCasUsage: ["qualification-leads"],
    relatedSecteurs: [],
  },
  {
    slug: "prompt",
    name: "Prompt",
    h1: "Le prompt : l’art de bien demander à l’IA",
    metaTitle: "Prompt : définition simple pour dirigeant | Coucou IA",
    metaDescription:
      "Prompt : l’instruction que vous donnez à l’IA, qui décide en grande partie de la qualité de la réponse. Définition simple pour dirigeant, l’image et un exemple.",
    definition:
      "Un prompt est l’instruction que vous donnez à l’IA : la question, la consigne et le contexte à partir desquels elle produit sa réponse. La précision du prompt décide en grande partie de la qualité du résultat.",
    explanation:
      "C’est un brief à un prestataire. Un brief vague (« fais-moi un truc bien ») donne un résultat vague. Un brief précis (le ton, le format, un exemple, ce qu’il faut éviter) donne un résultat exploitable. Même IA, brief différent, résultat différent.",
    whatItChanges:
      "En interne, bricoler des consignes dans ChatGPT fait la démo, mais ne tient pas à l’échelle : le résultat dépend de qui tape et de son humeur. Dans un vrai système, les prompts sont écrits, testés et figés, pour que la réponse soit fiable chaque jour, pas une bonne surprise de temps en temps.",
    example:
      "Exemple : un assistant support. Sans consigne cadrée, il répond parfois trop long, parfois hors sujet. Avec un prompt qui fixe le ton de la maison, la longueur et la règle « en cas de doute, transférer à un conseiller », il répond juste, à chaque fois.",
    relatedTerms: ["llm", "hallucination", "agent-ia"],
    relatedCasUsage: ["assistant-support-client"],
    relatedSecteurs: [],
  },
  {
    slug: "hallucination",
    name: "Hallucination",
    h1: "L’hallucination : quand l’IA se trompe avec aplomb",
    metaTitle: "Hallucination IA : la définition simple | Coucou IA",
    metaDescription:
      "Hallucination : quand l’IA produit une réponse fausse mais formulée avec assurance. Définition simple pour dirigeant, comment la maîtriser, et un exemple PME.",
    definition:
      "Une hallucination, c’est quand l’IA produit une réponse fausse mais formulée avec assurance, comme si elle était vraie. Le modèle ne ment pas volontairement : il comble un manque d’information par ce qui lui semble le plus probable.",
    explanation:
      "Voyez un stagiaire brillant qui déteste dire « je ne sais pas » et invente une réponse plausible pour ne pas rester coincé. Le problème n’est pas qu’il se trompe de temps en temps. C’est qu’il se trompe avec aplomb, sans prévenir.",
    whatItChanges:
      "C’est LE risque à connaître avant de déployer. On ne le supprime pas à 100 %, on le maîtrise : brancher l’IA sur vos documents (RAG), lui faire citer ses sources, et garder un humain qui valide les décisions qui engagent. Une IA qui répond « je ne trouve pas » vaut mieux qu’une IA qui invente.",
    example:
      "Exemple : un assistant interne à qui l’on demande une clause de contrat qui n’existe pas chez vous. Mal conçu, il en invente une, crédible. Bien conçu, il répond qu’il ne la trouve pas dans vos documents, et renvoie vers la personne qui saura.",
    relatedTerms: ["rag", "llm", "mise-en-production"],
    relatedCasUsage: ["recherche-interne"],
    relatedSecteurs: [],
  },
  {
    slug: "fine-tuning",
    name: "Fine-tuning",
    h1: "Le fine-tuning : spécialiser un modèle d’IA",
    metaTitle: "Fine-tuning : la définition simple | Coucou IA",
    metaDescription:
      "Fine-tuning : réentraîner un modèle existant sur vos exemples pour qu’il colle à votre métier. Définition simple pour dirigeant, quand c’est utile, quand ça ne l’est pas.",
    definition:
      "Le fine-tuning consiste à spécialiser un modèle existant en le réentraînant sur vos propres exemples, pour qu’il colle à votre ton, votre format ou votre métier. On ne repart pas de zéro : on ajuste un modèle déjà entraîné.",
    explanation:
      "C’est prendre un excellent généraliste et lui faire suivre une formation maison, pour qu’il adopte vos habitudes et votre vocabulaire. Utile quand le style ou le format comptent beaucoup et reviennent tout le temps de la même manière.",
    whatItChanges:
      "Point clé pour votre budget : le fine-tuning n’est presque jamais la première réponse. Le plus souvent, brancher l’IA sur vos documents (RAG) suffit et coûte bien moins cher. Le fine-tuning se justifie quand le RAG ne suffit plus, pas par principe. Méfiez-vous de qui le vend d’emblée.",
    example:
      "Exemple : un cabinet qui traite des documents à un format maison très particulier, que le modèle générique lit mal. Après avoir montré au modèle quelques centaines d’exemples annotés, il apprend ce gabarit précis et l’extraction devient fiable.",
    relatedTerms: ["rag", "machine-learning", "llm"],
    relatedCasUsage: ["traitement-documents"],
    relatedSecteurs: [],
  },
  {
    slug: "automatisation-vs-ia",
    name: "Automatisation ou IA ?",
    h1: "Automatisation ou IA : quelle différence ?",
    metaTitle: "Automatisation ou IA : la différence | Coucou IA",
    metaDescription:
      "Automatisation ou IA : l’automatisation suit des règles fixes, l’IA gère les cas variés et ambigus. La distinction que tout dirigeant confond, expliquée simplement.",
    definition:
      "L’automatisation exécute des règles fixes que vous avez définies (« si facture reçue, alors classer ici »). L’IA, elle, gère les cas variés et ambigus où aucune règle simple ne suffit. La bonne solution combine souvent les deux.",
    explanation:
      "L’automatisation, c’est un bon rail : parfait tant que le train reste sur la voie. L’IA, c’est le conducteur qui gère l’imprévu. Pour classer des factures toutes identiques, une règle suffit. Pour lire des documents tous différents, il faut de l’IA.",
    whatItChanges:
      "C’est la confusion la plus coûteuse. Mettre de l’IA (plus chère, plus complexe) là où une simple règle suffisait, c’est gaspiller. L’inverse aussi : forcer des règles rigides sur un problème flou, et ça casse au premier cas particulier. Le bon réflexe : la règle d’abord, l’IA là où la règle cale.",
    example:
      "Exemple : le traitement de factures. Une règle range les factures d’un fournisseur connu au bon endroit, sans IA. C’est quand une facture arrive dans un format inhabituel, illisible ou d’un nouveau fournisseur que l’IA prend le relais. Chacune fait ce qu’elle sait faire.",
    relatedTerms: ["agent-ia", "machine-learning", "poc"],
    relatedCasUsage: ["traitement-documents", "qualification-leads"],
    relatedSecteurs: [],
  },
  {
    slug: "poc",
    name: "POC",
    h1: "Le POC : pourquoi tant de projets IA meurent au labo",
    metaTitle: "POC IA : définition et pourquoi ils meurent | Coucou IA",
    metaDescription:
      "POC (preuve de concept) : un prototype qui montre qu’une idée d’IA est faisable. Utile pour tester, dangereux quand il ne devient jamais un vrai système. Pourquoi.",
    definition:
      "Un POC (proof of concept, preuve de concept) est un prototype qui montre qu’une idée d’IA est faisable. Utile pour tester vite, dangereux quand il ne devient jamais un vrai système : la démo impressionne, la production ne suit pas.",
    explanation:
      "C’est un plat réussi une fois, un soir, pour un ami, sans contrainte. Le refaire chaque jour pour cent couverts, avec des ingrédients qui varient et un service qui n’attend pas, c’est un autre métier. La plupart des POC d’IA meurent exactement à ce passage.",
    whatItChanges:
      "Beaucoup de budgets IA ont été enterrés dans des POC séduisants restés au labo. Un POC n’est pas un livrable, c’est une étape. Avant même de lancer un test, la vraie question est : « si ça marche, qu’est-ce qu’il faut pour le mettre en production ? ». Sans cette réponse, c’est un échec facturé d’avance.",
    example:
      "Exemple : une PME industrielle teste une IA sur une ligne, la démo est bluffante, puis le projet s’arrête faute d’intégration aux outils existants. Un an plus tard, il ne reste qu’une facture et une déception. Le POC avait marché, personne n’avait prévu la suite.",
    relatedTerms: ["mise-en-production", "automatisation-vs-ia", "agent-ia"],
    relatedCasUsage: [],
    relatedSecteurs: ["industrie"],
  },
  {
    slug: "mise-en-production",
    name: "Mise en production",
    h1: "La mise en production : là où l’IA rapporte vraiment",
    metaTitle: "Mise en production IA : la définition | Coucou IA",
    metaDescription:
      "Mise en production : le moment où un système d’IA passe de la démo à l’usage quotidien réel. C’est là que la valeur se crée, et là que la plupart des projets calent.",
    definition:
      "La mise en production, c’est le moment où un système d’IA passe de la démonstration à l’usage quotidien réel, par vos équipes, sur vos vraies données. C’est là que la valeur se crée, et là que la plupart des projets calent.",
    explanation:
      "C’est la différence entre un prototype de voiture au salon et une voiture qui démarre chaque matin, par tous les temps, pendant des années. Le prototype se montre sous les projecteurs. La voiture de série se conduit sous la pluie. En production, ce qui compte, c’est la fiabilité, pas l’effet de démonstration.",
    whatItChanges:
      "C’est le seul jalon qui compte pour votre retour sur investissement : tant qu’un système n’est pas en production, il ne vous rapporte rien. Un projet sérieux se juge là-dessus : intégration à vos outils, gestion des cas d’erreur, adoption par les équipes, résultats mesurés. Le reste, ce sont des promesses.",
    example:
      "Exemple : un système de réponse aux appels d’offres. En production, il repère le nouvel appel, prépare un premier dossier à partir de vos références, et vos équipes valident. Il tourne chaque semaine, il est mesuré, il fait gagner du temps. Ce n’est plus une démo, c’est un outil de travail.",
    relatedTerms: ["poc", "agent-ia", "hallucination"],
    relatedCasUsage: ["reponse-appels-offres"],
    relatedSecteurs: [],
  },
  {
    slug: "ai-act",
    name: "AI Act",
    h1: "L’AI Act : la règle du jeu de l’IA en Europe",
    metaTitle: "AI Act : la définition simple pour dirigeant | Coucou IA",
    metaDescription:
      "AI Act : le règlement européen sur l’IA, qui classe les usages par niveau de risque. Définition simple pour dirigeant de PME, et ce que ça change pour vos projets.",
    definition:
      "L’AI Act est le règlement européen sur l’intelligence artificielle, en application par étapes depuis 2024. Il classe les usages de l’IA par niveau de risque et impose des obligations croissantes à mesure que le risque augmente.",
    explanation:
      "Voyez-le comme le code de la route de l’IA en Europe : certains usages sont libres, d’autres encadrés, quelques-uns interdits. Le but n’est pas de bloquer, mais de fixer des règles claires selon ce que l’IA touche. Un chatbot marketing et une IA qui trie des CV ne jouent pas dans la même catégorie.",
    whatItChanges:
      "Pour une PME, ce n’est pas un mur, mais un cadre à connaître dès la conception, pas après coup. Selon votre usage (ressources humaines, santé, crédit, biométrie), les obligations changent. Pensé dès le départ, c’est un simple cadre. Découvert trop tard, c’est un frein. On conçoit dans ce cadre par défaut.",
    example:
      "Exemple : une mutuelle veut une IA pour pré-instruire des dossiers. Bien conçue, l’IA prépare le dossier et la décision reste au gestionnaire, ce qui la maintient dans une catégorie de risque maîtrisée. Le cadre est pensé au début du projet, pas rattrapé à la fin.",
    relatedTerms: ["ia-souveraine", "machine-learning", "mise-en-production"],
    relatedCasUsage: [],
    relatedSecteurs: ["sante-medico-social", "assurance-mutuelle"],
  },
  {
    slug: "token",
    name: "Token",
    h1: "Le token : l’unité qui décide du coût de l’IA",
    metaTitle: "Token IA : la définition simple | Coucou IA",
    metaDescription:
      "Token : l’unité de texte que l’IA lit et écrit, et sur laquelle les fournisseurs facturent. Définition simple pour dirigeant, l’image du compteur, et ce que ça change.",
    definition:
      "Un token est l’unité de texte que l’IA lit et écrit : un petit morceau de mot, environ trois ou quatre caractères en français. Les fournisseurs facturent au nombre de tokens, et chaque modèle a une limite de tokens qu’il peut traiter d’un coup.",
    explanation:
      "C’est le compteur d’un taxi, mais qui tourne au nombre de mots plutôt qu’aux kilomètres. Plus le texte envoyé et reçu est long, plus la course coûte cher. La « limite de tokens » (la fenêtre de contexte), c’est la taille maximale du document que l’IA peut lire en une seule fois.",
    whatItChanges:
      "Deux conséquences concrètes. Le coût : envoyer des documents entiers à chaque requête chiffre vite, d’où l’intérêt du RAG, qui ne transmet que les passages utiles. La limite : un modèle ne peut pas avaler un classeur de mille pages d’un coup. Il faut une architecture qui découpe et sélectionne, sinon la facture et les erreurs grimpent ensemble.",
    example:
      "Exemple : un assistant support qui traite des milliers de questions par mois. En lui envoyant toute la documentation à chaque question, la facture s’envole. En ne lui envoyant que les deux ou trois passages utiles, le coût reste tenu et la réponse est plus précise.",
    relatedTerms: ["llm", "prompt", "rag"],
    relatedCasUsage: ["assistant-support-client"],
    relatedSecteurs: [],
  },
  {
    slug: "ia-souveraine",
    name: "IA souveraine",
    h1: "L’IA souveraine : garder vos données sous contrôle",
    metaTitle: "IA souveraine : la définition simple | Coucou IA",
    metaDescription:
      "IA souveraine : une IA conçue pour que vos données restent sous votre contrôle, hébergées en Europe, sans fuite vers des modèles publics. Définition et exemple PME.",
    definition:
      "Une IA souveraine, c’est une IA conçue pour que vos données restent sous votre contrôle : hébergement maîtrisé (souvent en France ou en Europe) et aucune fuite vers des modèles publics sans votre accord. Vous gardez la main sur l’endroit où vont vos données et sur qui peut les lire.",
    explanation:
      "C’est la différence entre confier vos dossiers sensibles à un coffre dont vous avez la clé, et les déposer chez un prestataire sans savoir qui y accède ni où c’est stocké. La souveraineté, ce n’est pas un slogan : c’est savoir, et décider.",
    whatItChanges:
      "Pour beaucoup de dirigeants, c’est le premier réflexe, et il est légitime : « mes données ne doivent pas partir n’importe où ». C’est un choix d’architecture, pas une option de dernière minute : modèles hébergés en Europe, données qui ne servent pas à entraîner le modèle d’un tiers, accès cloisonné. Un point de départ, pas une case à cocher.",
    example:
      "Exemple : un cabinet comptable tenu au secret professionnel. Une architecture souveraine garde les pièces clients sur un hébergement adapté, sans qu’aucune facture ne parte vers un modèle public. Le cabinet profite de l’IA sans transiger sur la confidentialité.",
    relatedTerms: ["ai-act", "rag", "llm"],
    relatedCasUsage: [],
    relatedSecteurs: ["sante-medico-social", "expertise-comptable"],
  },
];

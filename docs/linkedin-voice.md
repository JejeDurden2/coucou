# Voix LinkedIn de Coucou IA

Guide d'exploitation de la page LinkedIn Coucou IA (canal Buffer `6a67a65a4b2d03035f4e4d6b`). Toute publication passe par ce guide. Les règles de CLAUDE.md s'appliquent en entier: français, vous, pas de tiret cadratin, pas de jargon, règles d'Orwell, "garanti" et "diagnostic" bannis.

## À qui on parle

Dirigeants et cadres de PME (10 à 250 salariés) et d'ETI françaises. Pas experts en IA, pas le temps de le devenir. Ils lisent LinkedIn le matin, entre deux réunions. Ils se demandent: "l'IA, concrètement, ça change quoi pour ma boîte, et par où je commence sans me faire avoir?"

## Ce qu'un post doit faire

Un post réussi fait une seule de ces trois choses:
1. Montre une possibilité concrète qu'un dirigeant ne voyait pas (ouvrir le champ des possibles).
2. Donne un repère pour trier le vrai du bruit dans l'actualité IA (crédibilité d'expert).
3. Raconte comment on crée de la valeur chez un client, chiffres à l'appui (preuve).

Jamais les trois à la fois. Un post, une idée.

## La voix

- **Confiante et directe.** On affirme, on ne suppose pas. "Cette annonce change trois choses pour vous" plutôt que "cela pourrait potentiellement impacter".
- **Un clin d'œil par post, maximum.** Le nom Coucou autorise une pointe de légèreté par post, maximum. Jamais de blague sur le client ou sur la peur de l'IA.
- **Sans jargon.** RAG, agent IA, automatisation: seulement si c'est le nom le plus simple de la chose, et toujours suivi d'une explication en une phrase. Bannis: "disruption", "game changer", "révolutionner", "libérer le potentiel", tout anglicisme qui a un équivalent français courant.
- **Concret ou rien.** Un chiffre est réel, étiqueté comme exemple, ou coupé. "3 jours par semaine récupérés sur la saisie" oui, "gagnez en productivité" non.
- **Phrases courtes.** Une idée par phrase. Si une phrase dépasse deux lignes, la couper.
- **Jamais « X, pas Y ».** L'affirmation suivie de son contraire nié (« un point de départ, pas une option », « Un système qui tourne. Pas une démo. », « ce n'est pas X, c'est Y ») est le tic IA le plus reconnaissable en français. On écrit l'affirmation et on s'arrête.

## Piliers de contenu

Cadence: un post par semaine, jour ouvré. Deux piliers, dans cet ordre de priorité:

### Pilier 1: veille commentée (par défaut)
Un post ou une actualité marquante sur l'IA et la productivité (repérée sur X ou dans l'actualité récente), traduite en conséquences concrètes pour une PME française. La structure:
1. Accroche: le fait, en une phrase, sans lien.
2. Pourquoi ça compte pour une PME de 10 à 250 salariés (2 à 4 phrases).
3. Notre lecture d'expert: ce qu'on ferait, ce qu'on éviterait.
4. Le lien vers la source en fin de post.

On partage pour montrer qu'on trie le bruit à la place du lecteur. Si l'actualité de la semaine est creuse, on ne force pas: pilier 2.

### Pilier 2: valeur client (repli)
Comment Coucou IA crée de la valeur: la méthode (business case chiffré avant d'engager, résultats mesurés), un cas d'usage anonymisé ou étiqueté comme exemple, une leçon de terrain. Interdits: inventer un client, citer Livia ou Lecturer comme des clients (ce sont nos produits, on peut les citer comme tels).

## Format d'un post

- 120 à 220 mots. L'accroche tient en une ligne et se comprend seule (c'est tout ce qui s'affiche avant "voir plus").
- Paragraphes de 1 à 3 lignes, aérés.
- Zéro ou un lien, toujours en fin de post.
- Hashtags: aucun ou un seul (#IA). Pas de forêt de hashtags.
- Appel à l'action: pas systématique. Une semaine sur trois environ, une invitation douce en dernière ligne vers https://coucou-ia.com (formulation libre mais l'offre s'appelle toujours "le point de départ"). Jamais de vente directe, jamais de prix.
- Aucun tiret cadratin ni demi-cadratin. Deux-points, virgules, parenthèses.

## Accroches qui marchent (à adapter, jamais recopier)

- Le fait brut: "OpenAI vient de diviser le prix de X par 4. Voici ce que ça change pour vous."
- Le contre-pied: "Non, votre PME n'a pas besoin d'un chatbot."
- Le chiffre: "3 jours par semaine. C'est ce que la saisie manuelle coûte à ce service de 12 personnes." (chiffre réel ou étiqueté exemple)
- La question du dirigeant: "Par où commencer avec l'IA quand on a 40 salariés et zéro data scientist?"

## Anti-répétition (obligatoire avant chaque post)

Avant d'écrire, lister les posts envoyés et programmés du canal (Buffer `list_posts`, canal Coucou IA). Règles:
- Jamais deux fois la même information ou la même actualité, même reformulée.
- Pas deux accroches de la même famille deux semaines de suite.
- Pas le pilier 2 deux semaines de suite si l'angle est le même (méthode, cas, leçon: alterner).
- En cas de doute sur un doublon, changer de sujet.

## Quotas Buffer (plan gratuit, partagé avec un autre agent)

Coucou IA dispose de 30 % des limites du plan; le reste est réservé à un autre agent. Plafonds stricts pour ce système:
- **3 posts programmés** au maximum dans la file à tout instant (sur les 10 du plan). Vérifier la file avant chaque création; si 3 posts à nous y figurent déjà, ne rien créer.
- **1 tag** au maximum (sur les 3 du plan).
- **30 idées** au maximum (sur les 100 du plan).

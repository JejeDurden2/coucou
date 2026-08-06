# Blog : un article par semaine

**Version :** v1 (2026-08-03)
**Dépend de :** `CLAUDE.md` (règles d'écriture, mots bannis), `docs/design-system.md`, `docs/linkedin-voice.md` (même voix, format long)
**Règles :** français, « je » (jamais « notre équipe »), aucun tiret cadratin, « garanti » et « diagnostic » bannis, chiffres réels ou étiquetés illustration, jamais de prix.

## 1. La mission

Un article par semaine. Chaque article fait au moins une de ces quatre choses, jamais les quatre à la fois :
1. **Trafic** : répond à une vraie question que tape un dirigeant de PME (requête identifiable, titre qui la reprend).
2. **Crédibilité** : montre une expertise que les concurrents survolent (méthode, chiffrage, production).
3. **Leads** : amène naturellement vers le point de départ ou le kit de démarrage, sans forcer.
4. **Preuve de savoir-faire produit** : raconte ce que construire Livia et Lecturer apprend sur l'IA en production.

## 2. À qui on parle

Dirigeants et cadres de PME (10 à 250 salariés) et d'ETI françaises. Pas experts en IA, pas le temps de le devenir. Ils lisent en diagonale, décident vite, détestent le blabla. Un article réussi leur donne un repère actionnable qu'ils n'avaient pas avant.

## 3. La voix (format long)

Tout `docs/linkedin-voice.md` s'applique, plus :
- **Une thèse par article.** Annoncée dans le chapô, tenue jusqu'au bout.
- **Concret dès le deuxième paragraphe.** Un exemple chiffré, un cas, une situation vécue. Jamais trois paragraphes de contexte.
- **Phrases courtes, paragraphes courts.** Trois à cinq phrases par paragraphe, maximum.
- **Le clin d'œil : une pointe par article**, dans un titre ou une transition, jamais dans un chiffre.
- **Référence de style :** les meilleurs blogs tech français (Alan, Doctolib engineering, Malt) : direct, précis, zéro remplissage, on sent quelqu'un qui a fait le travail.
- Interdits en plus des mots bannis : « dans cet article nous verrons », « il est important de noter », « en conclusion », toute phrase qui annonce au lieu de dire.

## 4. Ne pas cannibaliser les pages existantes

Le blog complète, il ne double pas. Avant de choisir un sujet, vérifier qu'il n'est pas déjà le sujet principal :
- `/secteurs/*` : l'IA par secteur → le blog peut creuser UN cas précis, pas refaire la page secteur.
- `/cas-usage/*` : les cas d'usage → le blog raconte le comment et les pièges, pas le quoi.
- `/comparaison/*` : choisir son partenaire IA → ne pas refaire.
- `/glossaire/*` : définitions → le blog lie vers le glossaire au lieu de redéfinir.
- `/outils/*` : kit et quiz → le blog y renvoie comme prochaine étape.

## 5. Le backlog de sujets

Prendre le premier sujet non traité, sauf actualité forte qui justifie un décryptage. Cocher ici une fois publié.

- [x] Business case IA : comment chiffrer un projet avant d'engager un euro (méthode) — `business-case-ia`
- [x] AI Act : ce qui s'applique vraiment à une PME depuis le 2 août 2026 (décryptage, actualité) — `ai-act-pme-obligations`
- [ ] Ce que 18 mois à construire Livia m'ont appris sur les agents IA en production (coulisses)
- [ ] POC IA : pourquoi le vôtre dort dans un tiroir, et comment le suivant finit en production (méthode)
- [ ] Combien de temps prend vraiment un projet IA dans une PME (décryptage)
- [ ] RAG : brancher l'IA sur les documents de l'entreprise, expliqué à un dirigeant pressé (décryptage)
- [ ] Vos équipes utilisent déjà ChatGPT en cachette : ce que ça dit, ce que ça risque (décryptage)
- [ ] Les 3 questions qui tuent 80 % des idées de projet IA (et c'est tant mieux) (méthode)
- [ ] Automatiser sans casser : intégrer l'IA aux outils que vos équipes utilisent déjà (méthode)
- [ ] IA et données clients : ce qu'un dirigeant de PME doit exiger avant de signer (décryptage)
- [ ] Agent IA, assistant, automatisation : trois mots, trois budgets, trois résultats (décryptage)
- [ ] Ce que la facture d'un projet IA contient vraiment (sans donner de prix : les postes de coût) (décryptage)
- [ ] Mesurer un projet IA après la mise en production : les chiffres qui comptent (méthode)

Backlog vide ou sujet daté : en proposer trois nouveaux dans le même esprit, en choisir un, l'ajouter ici.

## 6. La structure d'un article

Le modèle de contenu vit dans `content/blog.ts` (types) et `content/blog/<slug>.ts` (un fichier par article). Chaque article :
- **1 200 à 2 000 mots.** En dessous c'est un post LinkedIn, au dessus personne ne finit.
- **metaTitle** ≤ 60 caractères avec la requête visée en tête, suffixe « | Coucou IA ». **metaDescription** ~150 caractères, promesse concrète.
- **keyTakeaways** : 3 à 5 phrases autoportantes, citables telles quelles par un moteur IA. C'est le bloc « À retenir ».
- **Corps** : h2 avec id stables (sommaire), un `stat` ou un `callout` toutes les 3 à 4 sections pour rythmer, une `quote` seulement si elle est réelle.
- **faq** : 2 à 4 questions que la cible tape vraiment (People Also Ask), réponses en 2 à 4 phrases.
- **Maillage interne, obligatoire** : 3 à 6 liens internes dans le corps (glossaire, cas d'usage, secteurs, outils, articles précédents) + les champs related remplis. Ajouter aussi, dans UN article existant qui s'y prête, un lien vers le nouvel article (le maillage va dans les deux sens).
- **Chiffres** : réels et sourcés, ou étiquetés « illustration ». Un chiffre non étiqueté et non sourcé est coupé.

## 7. La checklist technique (dans l'ordre)

1. Créer `content/blog/<slug>.ts` sur le modèle des articles existants.
2. L'enregistrer dans `articles` (`content/blog.ts`), trié du plus récent au plus ancien. Sitemap et RSS en dérivent tout seuls.
3. Ajouter l'article dans `public/llms.txt`, section « ## Blog » (une ligne, même format).
4. Ajouter le lien retour dans un article ou une page existante qui s'y prête.
5. Cocher le sujet dans le backlog ci-dessus (section 5).
6. `pnpm typecheck && pnpm lint && pnpm build` : zéro erreur.
7. Relire l'article entier une dernière fois avec la grille de la section 8.
8. Commit (`feat(blog): <titre court>`) et push sur main.

## 8. La grille de relecture (être sévère)

Rejeter et réécrire si UN de ces points échoue :
- Un tiret cadratin, un « garanti », un « diagnostic », un anglicisme évitable, un « nous » d'équipe.
- Le premier paragraphe pourrait ouvrir n'importe quel article du web (générique = poubelle).
- Une phrase annonce ce que l'article va dire au lieu de le dire.
- Un chiffre invérifiable et non étiqueté.
- Moins de 3 liens internes dans le corps.
- Les keyTakeaways ne tiennent pas debout hors contexte.
- On ne sent pas quelqu'un qui a construit des systèmes IA : si un rédacteur généraliste aurait pu l'écrire, c'est raté.

## Changelog
- v1 (2026-08-03) : mission, voix, backlog 12 sujets, structure, checklist technique, grille de relecture.

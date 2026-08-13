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

**Priorité depuis 2026-08-12 : les requêtes outillées.** Les décideurs des niches cherchent des outils, pas des concepts : comparatifs (« n8n ou Make »), coûts et délais, « outil métier + IA » (Apimo, Smoobu, Obat...). Au moins un article outillé sur deux. Un article outillé montre une manipulation réelle, pas une revue de fonctionnalités.

## 2. À qui on parle

Dirigeants de petits business à décision rapide, d'abord dans les niches prioritaires (immobilier, location saisonnière et conciergeries, hôtellerie indépendante, artisans du bâtiment, yachting), et plus largement les PME françaises. Pas experts en IA, pas le temps de le devenir. Ils lisent en diagonale, décident vite, détestent le blabla. Un article réussi leur donne un repère actionnable qu'ils n'avaient pas avant.

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

Prendre le premier sujet non traité, sauf actualité forte qui justifie un décryptage. Cocher ici une fois publié. Exception : un sujet daté (« → JJ/MM ») se traite à sa date, avant tout le reste. Les deux guides datés d'août suspendent la règle « un article outillé sur deux » ; la cadence reprend le 3 septembre.

- [ ] → 20/08 : Charte IA d'entreprise : le guide et le modèle à télécharger (méthode, guide de référence ; angle vide confirmé par la recherche SEO du 2026-08-10). Requêtes visées : « charte IA entreprise », « modèle charte IA ». Définition extractible dès le chapô. L'article 4 de l'AI Act en appui (lier `ai-act-pme-obligations`). Les 8 à 10 clauses qu'une charte de PME doit trancher : usages autorisés, données interdites de saisie, validation humaine, outils approuvés, confidentialité client, formation. Le modèle complet livré en fichier `public/charte-ia-modele.md`, téléchargeable librement, jamais derrière un formulaire (les moteurs IA ne citent pas ce qu'ils ne peuvent pas lire), lié depuis l'article et ajouté à `public/llms.txt`. FAQ : « Une charte IA est-elle obligatoire ? », « Qui doit la signer ? », « Que risque une PME sans cadre d'usage de l'IA ? ». Fin d'article : renvoi vers le kit de démarrage.
- [ ] → 27/08 : Audit IA d'une PME : la méthode complète et la grille d'auto-évaluation (méthode, guide de référence ; angle vide confirmé par la recherche SEO du 2026-08-10). Requêtes visées : « audit IA », « audit IA PME ». Angle : auditez vous-même votre potentiel IA. Les quatre étapes : cartographier les tâches répétitives, croiser volume, données et douleur, chiffrer le gain, décider. La grille d'auto-évaluation livrée en `public/grille-audit-ia.csv` (s'ouvre dans Excel), liée depuis l'article et ajoutée à `public/llms.txt`. Maillage obligatoire vers `business-case-ia`, `prix-projet-ia`, `diag-data-ia-bpifrance` et `/outils/par-ou-commencer` : l'article devient le pivot de ce cluster. FAQ : « Peut-on faire un audit IA soi-même ? », « Combien de temps prend un audit IA ? », « Quelles aides financent un audit IA ? » (Diag Data IA, pris en charge à 40 %). Rappel : « diagnostic » reste banni partout, « Diag Data IA » passe (nom propre Bpifrance).
Les sujets « coulisses » ci-dessous embarquent toute leur matière : les repos livia et lecturerjobsapp ne sont pas accessibles depuis le cloud. Ne rien inventer au-delà des faits notés.

- [ ] Un copilote IA branché sur 130 fonctions du logiciel métier : ce que coûte chaque message, et le réglage qui divise la facture (requête outillée, coulisses Lecturer). Matière : les définitions d'outils pèsent ~100 Ko envoyés à chaque tour ; le prompt caching les fait facturer à environ 0,1 fois le plein tarif en lecture de cache ; garde-fous réels posés en dur : 100 messages par jour, 30 appels d'outils par minute, 8 boucles d'outils maximum par tour. Angle dirigeant : le coût d'un assistant IA branché sur un logiciel métier dépend de réglages que personne ne montre avant le devis. Lier `prix-projet-ia`.
- [ ] Le jour où notre compteur aurait pu facturer deux fois (coulisses Livia, crédibilité par la transparence). Matière : un journal d'écritures de consommation dont la clé d'idempotence était générée au vidage du lot au lieu de son ouverture ; en cas de rejeu, double débit possible ; corrigé par fichier temporaire et renommage atomique. Sur un quota de 1 100 crédits par mois, un double débit peut priver une organisation d'IA jusqu'à la fin du mois. Angle : un compteur fiable est un sujet de confiance, voilà comment on le teste et le corrige.
- [ ] WhatsApp pour piloter un planning : on l'a construit, puis rangé (requête outillée, cible conciergeries et artisans, coulisses Lecturer). Matière : prototype réel Twilio (WhatsApp puis SMS en secours, réponses lues par mots-clés « oui »/« non ») ; fragile dès que la réponse sort du mot-clé, contraintes fortes du compte d'essai ; remplacé par des notifications dans l'application et un copilote. L'article raconte pourquoi le canal « évident » tient mal la production et ce qui marche à la place, sans décourager.
- [ ] Quand le client ne paie plus, que fait l'agent IA ? (coulisses Livia). Matière : blocage de dépense à deux couches, sans rien écrire en base, qui se lève seul en 60 secondes maximum après paiement ; une carte en attente 3DS peut laisser l'agent actif jusqu'à 23 h, un prélèvement SEPA plusieurs jours. Angle : la peur « l'IA continue de consommer sur ma carte » traitée par le concret.
- [ ] Brancher une IA sur 31 logiciels métier : le jour où une API a menti (requête outillée, coulisses Livia). Matière : registre de 31 connecteurs (HubSpot, Salesforce, Moodle, Hyperplanning, Dendreo, Yparéo, Wedof, Digiforma...) ; Moodle répond HTTP 200 avec l'erreur dans le corps quand le jeton est invalide ; balayage de santé en parallèle, 5 fournisseurs à la fois, 8 secondes de délai maximum chacun. Angle : le coût caché des intégrations, cœur du positionnement « le travail vit dans les outils métier ».
- [ ] Ce que fait un bon logiciel quand le planning ne rentre pas (cible conciergeries, artisans, yachting, coulisses Lecturer). Matière : moteur de contraintes classique (CP-SAT, Google OR-Tools), toute séance peut rester « non placée » au lieu de faire échouer l'ensemble, pénalités pondérées en entiers. Clarté honnête : l'optimisation combinatoire n'est pas de l'IA générative, lier `/glossaire/automatisation-vs-ia`. Transposition : ménages entre deux séjours, tournées de chantier, rotations d'équipage.
- [x] Business case IA : comment chiffrer un projet avant d'engager un euro (méthode) — `business-case-ia`
- [x] AI Act : ce qui s'applique vraiment à une PME depuis le 2 août 2026 (décryptage, actualité) — `ai-act-pme-obligations`
- [x] Ce que construire Livia m'a appris sur les agents IA en production (coulisses) — `agent-ia-production-lecons`
- [ ] POC IA : pourquoi le vôtre dort dans un tiroir, et comment le suivant finit en production (méthode)
- [ ] Combien de temps prend vraiment un projet IA dans une PME (décryptage)
- [ ] RAG : brancher l'IA sur les documents de l'entreprise, expliqué à un dirigeant pressé (décryptage)
- [ ] Vos équipes utilisent déjà ChatGPT en cachette : ce que ça dit, ce que ça risque (décryptage)
- [ ] Les 3 questions qui tuent 80 % des idées de projet IA (et c'est tant mieux) (méthode)
- [ ] Automatiser sans casser : intégrer l'IA aux outils que vos équipes utilisent déjà (méthode)
- [ ] IA et données clients : ce qu'un dirigeant de PME doit exiger avant de signer (décryptage). Matière Livia : purge automatique 30 jours après résiliation confirmée, en cascade sur une trentaine de tables, jetons d'accès Google et Microsoft compris ; un serveur dédié par client, hébergé dans l'UE, plutôt qu'une base mutualisée.
- [ ] Agent IA, assistant, automatisation : trois mots, trois budgets, trois résultats (décryptage)
- [x] Ce que la facture d'un projet IA contient vraiment (sans donner de prix : les postes de coût) (décryptage) — `prix-projet-ia`
- [x] Diag Data IA : l'aide publique qui finance 40 % d'un état des lieux (décryptage, actualité) — `diag-data-ia-bpifrance`
- [ ] Mesurer un projet IA après la mise en production : les chiffres qui comptent (méthode). Matière Livia : le battement de cœur qui disait que tout allait bien pendant que la passerelle IA était en panne ; seuils réels : 15 minutes sans signal valide, bandeau côté client, 30 minutes, alerte interne ; la sonde vise l'adresse HTTPS publique, le réseau interne mentait.
- [ ] Vous triez des CV avec de l'IA ? La CNIL contrôle ce sujet en 2026 (décryptage, source : cnil.fr contrôles prioritaires 2026 ; haut risque annexe III au 2 déc. 2027)
- [ ] Facturation électronique au 1er septembre 2026 : vos données seront enfin structurées, voilà ce que ça ouvre (décryptage, cible DAF et cabinets comptables)
- [ ] n8n ou Make pour une PME : le comparatif de quelqu'un qui a livré avec les deux (décryptage, requête outillée)
- [ ] Un agent IA branché sur Apimo ou Hektor : ce que ça change dans une agence immobilière (décryptage, cible immobilier)
- [ ] Répondre aux voyageurs à 3 h du matin sans se lever : l'IA d'une conciergerie, outil par outil (décryptage, cible location saisonnière)
- [ ] De la visite au devis en 24 h : l'IA côté artisan, de la note vocale au devis à valider (méthode, cible artisans du bâtiment)
- [ ] Défendre la réservation directe face aux OTA : ce qu'un agent IA change pour un hôtel indépendant (décryptage, cible hôtellerie)
- [ ] Qualifier une demande de charter en 10 minutes : l'IA dans le yachting (décryptage, cible yachting)

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
- v1.3 (2026-08-13) : six sujets « coulisses produit » tirés de l'exploration des repos Livia et Lecturer, matière factuelle embarquée dans chaque ligne (les repos sont hors de portée du cloud) ; deux sujets existants enrichis de la même matière (mesure post-production, données clients).
- v1.2 (2026-08-13) : deux guides de référence datés en tête de backlog (charte IA le 20/08, audit IA le 27/08) avec spec détaillée et livrable téléchargeable chacun ; l'ancienne ligne charte IA fusionnée dans l'entrée datée ; règle des sujets datés ajoutée.
- v1.1 (2026-08-12) : cible resserrée sur les niches à décision rapide (immobilier, location saisonnière, hôtellerie, artisans, yachting), priorité aux requêtes outillées (un article outillé sur deux), 6 sujets niche ajoutés au backlog.
- v1 (2026-08-03) : mission, voix, backlog 12 sujets, structure, checklist technique, grille de relecture.

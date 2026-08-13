# Playbook outbound : Coucou IA

**Version :** v2.0
**Date :** 2026-08-04
**Auteur / interlocuteur unique :** Jérôme (Coucou IA, Nice)

**Changement de v1.3 (2026-07-20, exécution Lemlist) :** décision fondateur du 2026-08-04, bascule de l'exécution vers Brevo. **Conséquence directe : l'outbound perd le volet LinkedIn.** Brevo n'a aucune fonction d'invitation ni de message LinkedIn ; la séquence devient un cold email pur, 3 touches. Ce n'est pas qu'un changement d'outil, c'est un changement de canal pour toute la prospection.

**Deux blocages à lever avant le premier envoi :**
1. **La liste industrie (74 entreprises, `prospects-industrie-v1.csv`) n'a aucune adresse email.** Elle a été sourcée pour du LinkedIn (nom du dirigeant, URL LinkedIn, site web), pas pour de l'email : c'était le bon choix pour Lemlist, ça ne l'est plus pour Brevo. Il faut trouver ou vérifier un email par prospect avant tout import (voir section 1, sourcing).
2. **Le domaine `coucou-ia.com` n'est pas authentifié côté Brevo.** L'authentification déjà faite pour Lemlist (SPF/DKIM Google Workspace, checklist semaine 1) couvre l'envoi via Gmail, pas l'envoi via les serveurs Brevo : ce sont deux authentifications séparées, à ajouter en plus, pas à la place. Sans ça, les emails partent en indésirables. Voir checklist-semaine-1.md.

**Ce qui ne change pas :** le ciblage, les deux secteurs, l'objectif (10 premiers points de départ), le pitch, les principes d'écriture, le lien de réservation.

**À savoir avant de se lancer :** Brevo est un outil d'emailing marketing, pas un outil de cold email dédié comme l'était Lemlist (qui envoie depuis une vraie boîte Gmail, ce qui rassure les filtres antispam). Un envoi de prospection à froid depuis une plateforme marketing est plus surveillé par les filtres antispam qu'un envoi depuis une boîte humaine. Démarrer prudemment (section 5), surveiller le taux de rebond dès les premiers envois, et ne jamais charger un email non vérifié dans la liste.

## En-tête

**Objectif :** décrocher les 10 premiers points de départ (call gratuit de 30 min).
**Canal :** cold email, 3 touches. Le site (https://coucou-ia.com) sert de validation quand le prospect va vérifier, pas de source de leads.
**Lien de réservation (jamais avant une réponse positive) :** https://cal.com/jerome-desmares-izhobq/30min
**Cartes des possibles (lead magnet, par secteur) :** https://coucou-ia.com/ressources/carte-expertise-comptable (compta), https://coucou-ia.com/ressources/carte-industrie (industrie). Le lien envoyé au prospect est toujours celui de la landing, jamais le lien direct vers le PDF : c'est la landing qui capture l'email.
**Tête de pont :** secteur 1 = expertise comptable, secteur 2 = PME industrielles. Fallback si un secteur ne répond pas : services B2B. Ordre d'exécution été 2026 : industrie d'abord, compta à la rentrée (décision du 2026-07-20, inchangée).
**Pitch de référence (verrouillé) :** « Vous savez que l'IA compte, personne ne vous dit par où commencer chez vous. Moi si, en 30 min, sans jargon. »

### Rappel des principes (à relire avant chaque envoi)

- Écrire comme un pair, pas comme un vendeur. Lu à voix haute, ça doit sonner humain. Zéro pattern IA, zéro jargon (« synergie », « levier », « j'espère que ce message vous trouve bien »).
- La personnalisation doit être connectée au problème : si on la retire et que le message tient encore, elle ne sert à rien.
- Parler de LEUR monde : « vous / votre » domine « je / nous ». Ne jamais ouvrir sur qui je suis.
- Un seul ask par message. Premier contact : CTA d'intérêt (« Ça vous parle ? »), jamais une demande de call. Le lien Cal.com n'apparaît qu'APRÈS un « oui ».
- Chaque message tient seul : le prospect n'a peut-être rien lu avant.
- Français, « vous », entreprise unipersonnelle (« je », jamais « notre équipe »). Aucun tiret cadratin ni demi-cadratin. Aucun client inventé, aucun chiffre inventé : les illustrations chiffrées sont toujours étiquetées « illustration, sans nom de client ».
- **Jamais « X, pas Y ».** L'affirmation suivie de son contraire nié (« un point de départ, pas une option », « Un système qui tourne. Pas une démo. », « ce n'est pas X, c'est Y ») est le tic IA le plus reconnaissable en français. On écrit l'affirmation et on s'arrête.
- **Test avant envoi :** est-ce que moi, dirigeant, je répondrais à ce message si je le recevais ?

---

## 1. Ciblage

### Expertise comptable

- **Taille de cabinet :** 5 à 40 collaborateurs (cœur de cible 8 à 25). Assez gros pour avoir de la volumétrie de saisie et un vrai pic de période fiscale, assez petit pour que le dirigeant décide et signe seul.
- **Rôle du décideur :** expert-comptable associé, gérant, dirigeant du cabinet. En cabinet, c'est l'associé qui signe.
- **Où le trouver et trouver son email :** titres « Expert-comptable », « Expert-comptable associé », « Dirigeant / Gérant » + « cabinet d'expertise comptable » sur LinkedIn, géo Nice / PACA d'abord, puis élargir. LinkedIn sert à identifier la bonne personne et à repérer les signaux, pas à la contacter : une fois le nom trouvé, chercher l'email professionnel (page « contact » ou « équipe » du site du cabinet, format standard prénom.nom@cabinet.fr à vérifier avant tout envoi).
- **Signaux de personnalisation à chercher :**
  - Offre d'emploi « collaborateur comptable » récente : signe de surcharge, donc de saisie qui déborde.
  - Timing période fiscale : les liasses se concentrent au printemps, un message qui tombe juste avant le pic résonne.
  - Croissance : nouveau bureau, nouvel associé, rachat de portefeuille.
  - Posts sur la difficulté à recruter ou sur « la profession et l'IA ».

### Industrie (PME industrielles)

- **Taille :** 30 à 250 salariés (cœur de cible 40 à 150). Établie, rentable, avec un flux réel de DCE / chiffrage.
- **Rôle du décideur :** dirigeant / DG / gérant, directeur industriel, directeur commercial, responsable bureau d'études ou chiffrage. En PME industrielle, le dirigeant décide.
- **Où le trouver et trouver son email :** titres « Dirigeant », « PDG », « Directeur général », « Directeur industriel », « Responsable chiffrage / bureau d'études », dans les secteurs mécanique, métallurgie, plasturgie, usinage, sous-traitance industrielle. Géo Sud / PACA d'abord. Sources de signaux hors LinkedIn : marchés publics (BOAMP) pour repérer qui répond à des AO, salons (Global Industrie), certifications ISO 9001. L'email professionnel se trouve sur le site de l'entreprise (page contact) ou par le format standard de l'entreprise, à vérifier avant tout envoi.
- **Signaux de personnalisation à chercher :**
  - Attribution ou dépôt de marchés / réponses à des AO : la douleur DCE est réelle et actuelle.
  - Recrutement « chargé d'affaires », « deviseur », « technico-commercial », « responsable QSE » : surcharge chiffrage ou qualité.
  - Croissance : nouvel atelier, investissement machine, embauches.
  - Mention d'un ERP / MES (Clipper, Sylob, Silog) ou posts sur la difficulté à répondre à temps aux appels d'offres.

**Sur la liste industrie déjà sourcée (`prospects-industrie-v1.csv`, 74 entreprises) :** utilisable pour le ciblage et les signaux tels quels. Aucune n'a d'email : compléter la colonne avant import dans Brevo, en vérifiant chaque adresse (un email qui rebondit abîme la réputation du domaine plus vite qu'un lead perdu n'en coûte).

---

## 2. Séquence type (cadence sur 12 jours)

Trois touches email, écarts croissants. Chaque relance apporte un angle NOUVEAU. Dernier message = breakup courtois et définitif.

| Jour | Action |
|------|--------|
| J0 | Email 1, angle « douleur n°1 » |
| J5 | Email 2, angle NOUVEAU (autre douleur + illustration chiffrée étiquetée) |
| J12 | Email 3, breakup |

**Règle de bascule :** si l'email 1 reste sans réponse à J5, l'email 2 prend le relais avec un angle différent. Une réponse à n'importe quelle étape sort le prospect de la séquence (voir section 4) et passe en conversation manuelle, priorité absolue.

---

## 3. Messages complets, prêts à copier

Variables entre crochets réduites au minimum. Chacune est suivie d'un exemple rempli.
[Prénom] = le prénom du décideur (ex. « Claire »).

### Expertise comptable

**Email 1 (J0), objet : `la saisie`**

> Bonjour [Prénom],
>
> Dans beaucoup de cabinets, la ressaisie des pièces une par une revient comme le premier poste de temps perdu, surtout quand le nombre de dossiers augmente sans que l'équipe grandisse au même rythme.
>
> L'IA sait aujourd'hui lire une facture ou un relevé et proposer l'imputation : le collaborateur valide au lieu de saisir de zéro. Reste à savoir si, chez vous, ça vaut le coup, et par où commencer.
>
> C'est exactement ce que je fais : en 30 min, je vous montre où l'IA rapporte dans votre cabinet, et où elle ne sert à rien. Sans jargon.
>
> Ça vaut le coup d'en parler ?
>
> Jérôme, Coucou IA

**Email 2 (J5), objet : `période fiscale`**

> Bonjour [Prénom],
>
> Autre angle : la période fiscale. Chaque année, bilans, liasses et déclarations se concentrent sur quelques semaines, et l'équipe encaisse le pic sans renfort durable.
>
> Un exemple pour situer l'ordre de grandeur (illustration, sans nom de client) : sur un cabinet d'une douzaine de collaborateurs, pré-remplir les éléments récurrents des liasses et laisser l'expert relire peut récupérer plusieurs jours de collaborateur sur le mois le plus chargé.
>
> La vraie question, c'est si ça se transpose chez vous. C'est tout l'objet des 30 min. Je vous montre ?
>
> Jérôme, Coucou IA

**Email 3 (J12, breakup), objet : `je vous laisse`**

> Bonjour [Prénom],
>
> Promis, c'est mon dernier message : je ne veux pas encombrer votre boîte.
>
> Si un jour la saisie ou le pic de la période fiscale devient le sujet de trop, vous saurez où me trouver. Ce premier échange reste ouvert : 30 min, sans engagement, et je vous dis franchement si l'IA a sa place chez vous, y compris si la réponse est non.
>
> D'ici là, bon courage pour les échéances.
>
> Jérôme, Coucou IA

### Industrie

**Email 1 (J0), objet : `vos DCE`**

> Bonjour [Prénom],
>
> Dans l'industrie, constituer un dossier de réponse à un DCE mobilise souvent un ingénieur plusieurs jours : retrouver les bonnes pièces techniques, les fiches produits, les références passées, à chaque appel d'offres.
>
> L'IA sait aujourd'hui rassembler tout ça à partir de vos propres documents et produire un premier dossier que vos équipes valident et complètent. Reste à voir si, chez vous, le jeu en vaut la chandelle, et par où commencer.
>
> C'est ce que je fais en 30 min : je vous montre où l'IA rapporte dans votre activité, et où elle ne sert à rien. Sans jargon.
>
> Ça vaut le coup d'en parler ?
>
> Jérôme, Coucou IA

**Email 2 (J5), objet : `les délais`**

> Bonjour [Prénom],
>
> Pour situer l'ordre de grandeur sur les réponses aux appels d'offres (illustration, sans nom de client) : sur une PME industrielle qui traite plusieurs DCE par mois, faire produire le premier dossier de réponse par l'IA peut le ramener d'une semaine à une journée.
>
> Concrètement, ça veut dire répondre à plus d'appels d'offres sans mobiliser un ingénieur à temps plein sur la paperasse.
>
> La vraie question, c'est si ça tient chez vous. En 30 min, je vous le dis franchement, y compris si la réponse est non. Je vous montre ?
>
> Jérôme, Coucou IA

**Email 3 (J12, breakup), objet : `je vous laisse`**

> Bonjour [Prénom],
>
> Promis, c'est mon dernier message : je ne veux pas encombrer votre boîte.
>
> Si un jour les délais de réponse aux appels d'offres ou la doc éparpillée dans l'atelier deviennent le sujet de trop, vous savez où me trouver. Ce premier échange reste ouvert : 30 min, sans engagement, et je vous dis franchement si l'IA a sa place chez vous.
>
> Bonne continuation, et bon courage pour les prochains DCE.
>
> Jérôme, Coucou IA

### Variante optionnelle : email 2 avec l'angle carte

À utiliser à la place de l'email 2 ci-dessus une fois la carte du secteur en ligne, pour l'un ou l'autre secteur. [carte] = lien de la carte du secteur du prospect (voir section 4).

**Email 2, variante carte, objet : `la carte`**

> Bonjour [Prénom],
>
> Autre angle : je vous envoie la carte des cas d'usage IA pour [votre activité], les usages qui reviennent le plus dans le secteur, classés par impact [carte].
>
> Dites-moi si un des cas vous parle, on en discute ?
>
> Jérôme, Coucou IA

---

## 4. Réponses types

Règle d'or : le lien Cal.com n'apparaît qu'à partir d'une réponse engagée. Le lien vers la carte du secteur, lui, peut être envoyé à un prospect tiède : c'est justement son rôle, faire avancer avant que la conversation soit mûre pour un call. [lien] = https://cal.com/jerome-desmares-izhobq/30min. [carte] = lien de la carte du secteur du prospect (https://coucou-ia.com/ressources/carte-expertise-comptable pour la compta, https://coucou-ia.com/ressources/carte-industrie pour l'industrie). [votre activité] = « votre cabinet » (compta) ou « votre activité » (industrie).

**« Oui, dites-m'en plus »**
> Avec plaisir. Le plus simple, c'est 30 min où je vous montre concrètement où l'IA rapporte dans [votre activité], et où elle ne sert à rien. Vous choisissez un créneau ici : [lien]. Si après ça vous jugez que ce n'est pas pour vous, vous ne me devez rien.

**« Pas le temps »**
> Je comprends, c'est justement le problème que l'IA adresse. Aucune urgence : le lien reste ouvert quand vous voulez, même dans trois semaines [lien]. En attendant, je vous envoie la carte des cas d'usage IA pour [votre activité] : deux minutes de lecture, vous verrez tout de suite si un des cas vous parle [carte].

**« Envoyez une doc / une plaquette »**
> Une plaquette parlerait de moi. Ce qui est vraiment utile, c'est 30 min sur VOTRE cas, chiffres à l'appui : un créneau ici [lien]. En attendant, j'ai mieux qu'une plaquette : la carte des cas d'usage IA pour [votre activité], vous verrez si ça vous parle avant même qu'on en discute [carte].

**« Combien ça coûte ? »**
> Honnêtement, je ne peux pas vous donner un prix sérieux sans connaître le périmètre : ça n'aurait aucun sens de vous avancer un chiffre au hasard. C'est justement ce que le point de départ sert à cadrer. Il est gratuit, 30 min, et à la fin vous savez ce qui vaut le coup d'être chiffré, et ce qui ne vaut pas la peine. On en parle ? [lien]

---

## 5. Rythme hebdo solo (20 à 30 min / jour)

**Limites d'envoi :** contrairement à Lemlist (qui envoie depuis la vraie boîte Gmail), Brevo envoie depuis ses propres serveurs. Un domaine tout juste authentifié côté Brevo doit monter en charge progressivement, comme le lemwarm le faisait pour la boîte : commencer autour de **20 à 30 emails/jour** la première semaine, doubler la deuxième semaine si le taux de rebond reste sous 2 % et qu'aucune plainte spam n'est remontée dans Brevo, puis stabiliser. Ne jamais dépasser la capacité de la liste vérifiée du jour : mieux vaut envoyer moins que charger un email non vérifié.

**Découpage d'une journée type (20-30 min) :**
1. Traiter les réponses reçues d'abord (10 min). Priorité absolue : répondre dans l'heure si possible, dans la journée sinon.
2. Vérifier et ajouter 10 à 15 nouveaux emails à la liste du secteur en cours (10 min) : recherche + vérification de l'adresse avant tout envoi.
3. Laisser Brevo exécuter les relances dues du jour (l'automation gère J0 / J5 / J12, rien à envoyer à la main une fois le contact dans la liste).
4. Mettre à jour le tableau de suivi (5 min).

**Semaine type :**
- Lundi : constituer et vérifier la liste de la semaine, l'ajouter à Brevo.
- Mardi à jeudi : meilleurs jours en B2B pour un premier envoi, si le volume du jour le permet.
- Vendredi : rattrapage, réponses, mise à jour du tableau, préparation de la liste suivante. Pas d'envoi le vendredi après-midi ni le week-end.

**Ordre de grandeur réaliste :** avec une liste vérifiée et une montée en charge prudente, viser 20 à 30 nouveaux prospects/semaine dans la séquence. Moins rapide qu'un rythme LinkedIn + email, mais plus sûr pour la réputation d'un domaine qui démarre sur Brevo.

---

## 6. Suivi minimal

Une simple feuille de calcul (Google Sheets), une ligne par prospect. Pas d'outil à acheter en v1.

| Prospect | Entreprise | Secteur | Email vérifié | Dernière touche | Date | Statut | Prochaine action | Date | Signal / notes |
|----------|-----------|---------|---------------|-----------------|------|--------|------------------|------|----------------|
| Claire D. | Cabinet Martin | Compta | Oui | Email 1 | J0 | Email 1 envoyé | Email 2 | J5 | Annonce collab. comptable |
| Paul R. | Métalux | Industrie | Oui | Email 2 | J5 | Email 2 envoyé | Email 3 | J12 | Répond à des AO (BOAMP) |

**Valeurs de « Statut » :** À vérifier (email), À contacter, Email 1, Email 2, Carte envoyée, Breakup (email 3), Répondu (intéressé), RDV pris, Échange fait, Pas intéressé, Rebond (email invalide), Clos.

La colonne « Date » de prochaine action pilote la journée : chaque matin, on filtre sur les lignes dont la date est aujourd'hui ou avant.

---

## 7. Critères d'arrêt / pivot

Seuils concrets, à évaluer chaque semaine. Une « touche complète » = un prospect ayant reçu au moins l'email 1.

- **Taux de rebond > 3 % sur une semaine d'envoi :** arrêt immédiat des envois du secteur concerné. Le sourcing d'emails n'est pas assez fiable : revérifier la liste avant de reprendre, sous peine d'abîmer la réputation du domaine pour tous les envois (outbound et nurture).
- **Taux de réponse < 5 % après 50 touches complètes sur un secteur :** changer d'angle, en commençant par l'email 1 (pas la séquence entière).
- **2 angles d'email 1 testés (2 x 50 touches) toujours < 5 % sur un secteur :** basculer sur le secteur 2, puis sur le fallback services B2B.
- **5 réponses « intéressé » mais 0 RDV pris :** la friction est dans la transition vers le call. Revoir la réponse type et vérifier que le lien Cal.com fonctionne et propose des créneaux proches.
- **Contrôle de cap :** viser un taux de réponse global > 8 à 10 % et au moins 1 RDV pour ~15 à 20 conversations engagées. En dessous deux semaines de suite, recalibrer message ou ciblage.

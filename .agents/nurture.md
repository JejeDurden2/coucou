# Séquence nurture post-carte : Coucou IA

**Version :** v1.1 (2026-07-20)
**Dépend de :** `.agents/lead-magnets.md` v1, `.agents/product-marketing.md` v1.4
**Déclencheur :** téléchargement d'une carte. La server action du site (`app/ressources/actions.ts`) ajoute le lead à la campagne Lemlist de son secteur (`lemlistCampaignId` dans `content/ressources.ts`) : l'email J0 de livraison est l'étape 1 de la campagne, la séquence enchaîne.
**Règles :** français, vous, aucun tiret cadratin, un seul ask par email, aucune pression, chiffres toujours étiquetés illustration, désinscription en un clic, signature « Jérôme, Coucou IA ». Le lien Cal.com est celui du site avec UTM : `https://cal.com/jerome-desmares-izhobq/30min?utm_source=email&utm_medium=nurture&utm_content=jX-[secteur]`.
**Arrêt automatique :** la séquence s'interrompt si la personne réserve un point de départ (webhook Cal.com → lead marqué « intéressé » dans toutes ses campagnes Lemlist) ou répond à un email (Lemlist stoppe à la réponse ; toute réponse passe en conversation manuelle, priorité absolue).

## Montage dans Lemlist (fait le 2026-07-20 par l'API, une campagne par secteur)

| Campagne | ID | Étapes |
|---|---|---|
| Nurture carte expertise comptable | `cam_qnKzY6bXNxtSinjAF` | J0 livraison, J+3, J+10, J+21 |
| Nurture carte industrie | `cam_YLiMdN5H3wAW84wYs` | J0 livraison, J+3, J+10, J+21 |

La boîte `jerome@coucou-ia.com` (Google Workspace) est créée et connectée à Lemlist depuis le 2026-07-20. Reste côté fondateur avant activation : finir le DNS et la chauffe lemwarm (checklist semaine 1, étape 1), sélectionner la boîte comme expéditeur des 2 campagnes, vérifier que le lien de désinscription est actif, relire, lancer. En attendant, le site pousse déjà les leads dans les campagnes : la liste se construit, rien ne part, et la page de merci donne de toute façon l'accès direct à la carte.

## Email J0 (livraison, étape 1 de chaque campagne)

Objet : `votre carte des possibles`. Corps (variante compta ; l'industrie remplace « les cabinets d'expertise comptable » par « les PME industrielles » et « votre métier » par « votre activité ») :

> Bonjour,
>
> Comme promis, voici la carte des possibles pour les cabinets d'expertise comptable : les cas d'usage de l'IA dans votre métier, classés par impact et par faisabilité, avec une grille pour évaluer chacun chez vous.
>
> Parcourez-la, et dites-moi si un des cas vous parle. On en discute en 30 min quand vous voulez.
>
> Jérôme, Coucou IA
>
> [Consulter la carte](https://coucou-ia.com/ressources/carte-expertise-comptable/carte)

---

## Expertise comptable

### Email 1 (J+3), objet : `le cas n°1`

> Bonjour,
>
> Vous avez la carte sous les yeux, alors autant vous dire ce que je constate : le cas qui parle le plus aux cabinets, c'est la saisie des pièces.
>
> Pas parce que c'est le plus spectaculaire. Parce que c'est le seul qui revient tous les jours, sur tous les dossiers, et qu'il grossit à mesure que le cabinet grossit. L'IA sait aujourd'hui lire une facture ou un relevé et proposer l'imputation : le collaborateur valide au lieu de saisir. Sur la carte, il coche les trois cases : volumétrie, données déjà là, douleur ressentie.
>
> La question qui reste, c'est l'ordre de grandeur chez vous. Prenez la grille des 3 questions sur ce cas : deux minutes, et vous saurez s'il mérite d'aller plus loin.
>
> Si un autre cas de la carte vous a davantage parlé, répondez-moi, je vous dis franchement ce que j'en pense.
>
> Jérôme, Coucou IA

### Email 2 (J+10), objet : `3 questions`

> Bonjour,
>
> La carte que vous avez téléchargée finit souvent en PDF ouvert une fois, et je préfère le dire que faire semblant du contraire.
>
> Alors je vous propose la version courte : prenez UN cas, celui qui vous a fait lever un sourcil, et posez-vous les 3 questions de sa grille. Le volume est-il là ? Les données existent-elles quelque part ? Est-ce que ça fait mal en période de pointe ?
>
> Trois oui : ce cas mérite un vrai chiffrage chez vous. Un ou deux oui : ça se regarde, sans urgence. Zéro : la carte vous aura au moins évité d'investir au mauvais endroit, c'est déjà ça.
>
> Et si vous voulez faire l'exercice à deux voix, c'est exactement ce qu'on fait pendant ce premier échange : 30 minutes, gratuit, et je vous dis aussi ce qui ne vaut PAS le coup : [lien Cal.com]
>
> Jérôme, Coucou IA

### Email 3 (J+21), objet : `dernier email`

> Bonjour,
>
> Promis, c'est le dernier de cette série : votre boîte mail a assez à faire, surtout à l'approche des échéances.
>
> Ce que je retiens pour vous : la carte reste accessible, votre point de départ reste ouvert, et il n'y a aucune date limite. Le bon moment, c'est celui où la saisie ou le pic fiscal devient le sujet de trop. Ce jour-là, 30 minutes suffisent pour savoir par où commencer chez vous, y compris si la réponse est « pas encore » : [lien Cal.com]
>
> D'ici là, bon courage pour la suite, et bonne route à votre cabinet.
>
> Jérôme, Coucou IA

---

## Industrie

### Email 1 (J+3), objet : `le cas n°1`

> Bonjour,
>
> Vous avez la carte sous les yeux, alors autant vous dire ce que je constate : le cas qui parle le plus aux dirigeants industriels, c'est la réponse aux appels d'offres.
>
> Pas un hasard : chaque DCE mobilise un ingénieur plusieurs jours pour rassembler des pièces qui existent déjà quelque part dans vos documents. L'IA sait aujourd'hui produire un premier dossier complet que vos équipes valident et complètent. Pour situer l'ordre de grandeur (illustration, pas une référence client) : passer d'une semaine à une journée par dossier, c'est répondre à plus d'appels d'offres sans embaucher.
>
> La question qui reste, c'est si ça tient chez vous. Prenez la grille des 3 questions sur ce cas : deux minutes, et vous saurez s'il mérite d'aller plus loin.
>
> Si un autre cas de la carte vous a davantage parlé, répondez-moi, je vous dis franchement ce que j'en pense.
>
> Jérôme, Coucou IA

### Email 2 (J+10), objet : `3 questions`

> Bonjour,
>
> La carte que vous avez téléchargée finit souvent en PDF ouvert une fois, et je préfère le dire que faire semblant du contraire.
>
> Alors je vous propose la version courte : prenez UN cas, celui qui vous a fait lever un sourcil, et posez-vous les 3 questions de sa grille. Le flux est-il régulier (DCE, non-conformités, reporting) ? Les documents existent-ils déjà quelque part ? Est-ce que ça bloque de la production ou du commerce ?
>
> Trois oui : ce cas mérite un vrai chiffrage chez vous. Un ou deux oui : ça se regarde, sans urgence. Zéro : la carte vous aura au moins évité d'investir au mauvais endroit, c'est déjà ça.
>
> Et si vous voulez faire l'exercice à deux voix, c'est exactement ce qu'on fait pendant ce premier échange : 30 minutes, gratuit, et je vous dis aussi ce qui ne vaut PAS le coup : [lien Cal.com]
>
> Jérôme, Coucou IA

### Email 3 (J+21), objet : `dernier email`

> Bonjour,
>
> Promis, c'est le dernier de cette série : votre boîte mail a assez à faire.
>
> Ce que je retiens pour vous : la carte reste accessible, votre point de départ reste ouvert, et il n'y a aucune date limite. Le bon moment, c'est celui où les délais de réponse aux appels d'offres ou la doc éparpillée devient le sujet de trop. Ce jour-là, 30 minutes suffisent pour savoir par où commencer chez vous, y compris si la réponse est « pas encore » : [lien Cal.com]
>
> D'ici là, bonne continuation, et bon courage pour les prochains DCE.
>
> Jérôme, Coucou IA

---

## Mesure

| Métrique | Cible | Alerte |
|---|---|---|
| Ouverture email 1 | > 40 % (liste tiède, opt-in réel) | < 25 % : vérifier la délivrabilité (DKIM/DMARC, checklist semaine 1) avant de toucher aux objets |
| Clic Cal.com sur la séquence | 5-10 % | 0 clic après 20 contacts entrés : revoir les emails 2-3 |
| Désinscription | < 2 % par email | > 5 % : le rythme est trop dense, espacer |

## Changelog
- v1.1 (2026-07-20) : bascule Brevo → Lemlist. Les 2 campagnes sont montées par l'API (IDs ci-dessus), l'email J0 de livraison devient l'étape 1 (il quitte `content/ressources.ts`), l'arrêt automatique à la réservation est branché sur le webhook Cal.com.
- v1 (2026-07-19) : première séquence, 3 emails x 2 secteurs, à monter dans Brevo (2 automatisations).

# Plan lead magnet : Coucou IA

**Version :** v1
**Date :** 2026-07-19
**Dépend de :** `.agents/product-marketing.md` (v1.2), `.agents/outbound.md` (v1)

## Décision

**Un seul format, décliné par secteur : « La carte des possibles » + grille d'auto-évaluation.**
Un PDF court (8 à 12 pages) par secteur de tête de pont, qui montre au dirigeant les cas d'usage IA concrets de SON métier, classés par impact et faisabilité, avec pour chaque cas 3 questions d'auto-évaluation (« est-ce que ça vaut le coup chez vous ? »). Dernière page : le point de départ gratuit comme suite logique.

**Deux déclinaisons v1, alignées sur l'outbound :**
1. `La carte des possibles : cabinet d'expertise comptable` (saisie, liasses, période fiscale, lettrage)
2. `La carte des possibles : PME industrielle` (DCE, doc technique, non-conformités, reporting)

### Pourquoi ce format et pas un autre

- **C'est la version gratuite du produit.** Le métier de Coucou IA est littéralement « cartographier les opportunités ». Le lead magnet fait la démo de la méthode sur des cas génériques du secteur ; le point de départ la fait sur l'entreprise du prospect. Le chemin vers la conversion est le produit lui-même.
- **La matière existe déjà.** `content/secteurs.ts` et `content/cas-usage-pages.ts` contiennent les cas d'usage rédigés par secteur (impact, faisabilité, conformité). Effort de création : 1 à 2 jours par secteur, mise en page comprise, pas 3 semaines.
- **Zéro dépendance à des preuves clients.** Interdiction de fabriquer des références : un format éducatif à base de cas d'usage et d'auto-évaluation n'a besoin d'aucun logo ni témoignage. Tout chiffre est étiqueté « illustration, pas une référence client », comme dans l'outbound.
- **Il sert l'outbound immédiatement.** Réponse « envoyez une doc » ou « pas le temps » : au lieu des « 3 lignes par mail » improvisées du playbook, on envoie la carte. Ce n'est pas une plaquette qui parle de nous, c'est un document qui parle d'eux.

**Écarté (et pourquoi) :** ebook long (trop d'effort, stade trop précoce), webinar (audience inexistante en phase outbound solo), calculateur ROI interactif (bon candidat v2 une fois le flux prouvé, voir skill free-tools), mini-cours email (pas de séquence nurture en place).

---

## Contenu type d'une carte (8 à 12 pages)

1. **Page 1 : le constat.** « Vous savez que l'IA va compter. Personne ne vous dit par où commencer chez vous. » Une page, ton du site.
2. **Pages 2-3 : la méthode de lecture.** Les deux axes (impact, faisabilité), comment lire la carte, ce qu'on entend par « en production ».
3. **Pages 4-9 : 4 à 6 cas d'usage du secteur.** Par cas : le problème en langage métier, ce que l'IA sait faire aujourd'hui, l'ordre de grandeur chiffré (étiqueté illustration), et la mini-grille « 3 questions pour savoir si c'est chez vous » (volumétrie, données disponibles, douleur ressentie).
4. **Page 10 : la carte de synthèse.** Les cas positionnés sur la matrice impact × faisabilité. Le visuel signature, celui qu'on a envie de partager.
5. **Page 11 : conformité.** RGPD, AI Act, secret professionnel (compta) ou propriété industrielle (industrie). Reprend le bloc `compliance` de `secteurs.ts`.
6. **Page 12 : la suite.** « Cette carte est générique. La vôtre ne l'est pas. » CTA unique : Trouver mon point de départ.

**Règles de rédaction :** français, vous, aucun tiret cadratin, aucun client inventé, chiffres toujours étiquetés illustration, jargon traduit (glossaire du product-marketing). Le « Coucou » vit en ouverture et en transition, jamais dans les chiffres.

---

## Capture et livraison

- **Gating : email seul.** Chaque champ en plus coûte 5 à 10 % de conversion ; en solo, le tri se fait au point de départ, pas au formulaire. Le secteur est donné par la page de destination, inutile de le demander.
- **Landing : une page par secteur**, `/ressources/carte-expertise-comptable` et `/ressources/carte-industrie`. Structure : titre bénéfice, aperçu visuel de la matrice, 3 puces « ce que vous y trouverez », formulaire email, mention « Pas de spam. Un email, la carte, c'est tout. » (RGPD : finalité claire, désinscription en un clic).
- **Livraison : par email** (vérifie l'adresse et ouvre la relation), page de merci qui propose directement de trouver son point de départ pour les pressés. Outil : un service email RGPD-friendly type Brevo (français) ; pas de stack marketing automation en v1.
- **Cohérence avec le contrat du site :** le CTA `Trouver mon point de départ` reste le seul CTA du site. Le CTA de téléchargement n'existe que sur les pages `/ressources/*` et comme lien secondaire discret en bas des pages secteurs correspondantes (content upgrade contextuel). Il ne concurrence jamais le CTA principal sur la home ou le hero.

---

## Diffusion (dans l'ordre d'impact, phase actuelle)

1. **Outbound (canal n°1).** La carte devient la réponse type aux objections « envoyez une doc » et « pas le temps ». Elle peut aussi servir d'angle NOUVEAU pour l'email 2 de la séquence (« je vous envoie la carte du secteur, dites-moi si un des cas vous parle »). Le lien Cal.com garde sa règle : jamais avant une réponse positive.
2. **LinkedIn organique.** Chaque cas d'usage de la carte = un post (le problème, ce que l'IA sait faire, l'ordre de grandeur illustré). La carte en commentaire ou en lien de profil. 4 à 6 posts par secteur, réutilisables.
3. **Content upgrade sur les pages secteurs.** Bloc en fin de `/secteurs/expertise-comptable` et `/secteurs/industrie` : « Emportez la carte ». Convertit le trafic SEO programmatique quand il arrivera.
4. **Pas de paid en v1.** Le volume outbound (75 invitations/semaine) suffit à tester la valeur du magnet avant de payer pour l'amplifier.

---

## Mesure

| Métrique | Cible v1 | Signal d'alerte |
|----------|----------|-----------------|
| Conversion landing (trafic outbound, tiède) | 20 à 40 % | < 15 % : revoir titre et aperçu |
| Téléchargement → point de départ trouvé sous 30 j | 5 à 10 % | 0 RDV après 20 téléchargements : revoir la page de merci et l'email de livraison |
| Réponses outbound quand la carte est proposée | > taux actuel du secteur | Si la carte ne bouge pas le taux de réponse, elle ne vaut pas sa maintenance |

**Premier A/B quand il y aura du volume :** titre de landing (bénéfice « par où commencer » vs curiosité « les 5 cas d'usage ») ; avant ça, le volume ne permettra pas de conclure, on ne teste pas.

## Prochaines étapes

1. Rédiger la carte expertise comptable (matière : `secteurs.ts` + emails outbound). ~1 jour.
2. Monter `/ressources/carte-expertise-comptable` + envoi email (Brevo ou équivalent). ~0,5 jour.
3. Brancher la carte dans les réponses types outbound. Immédiat.
4. Dupliquer pour l'industrie une fois le premier téléchargement → RDV observé.

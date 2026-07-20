# Checklist semaine 1 : les actions que seul le fondateur peut faire

**Version :** v1.2 (2026-07-20 soir : boîte Workspace créée, emailing rétabli, industrie avant compta pour l'été). Tout le reste (code, copy, séquences) est déjà prêt dans le repo, les docs `.agents/` et les 4 campagnes Lemlist. Cette liste ne contient que ce qui demande tes accès. Ordre = ordre d'exécution recommandé.

## 1. Finir la délivrabilité de la boîte. Presque terminée

~~Créer la boîte `jerome@coucou-ia.com` (Google Workspace)~~ **FAIT (2026-07-20).** ~~La connecter dans Lemlist (Settings → Senders)~~ **FAIT (2026-07-20).** ~~Désactiver Email Routing, MX `smtp.google.com`, SPF Google, DMARC `p=none`~~ **FAIT (2026-07-20 au soir, via l'API Cloudflare, vérifié sur résolveurs Google et Cloudflare).** La réception arrive désormais dans la boîte Workspace : l'ancien transfert Cloudflare vers le Gmail perso ne fonctionne plus.

~~Publier la clé DKIM~~ **FAIT (2026-07-20 au soir, TXT `google._domainkey` publié via l'API Cloudflare et vérifié complet sur les résolveurs publics).** ~~Domaine de tracking Lemlist~~ **FAIT (même soir : CNAME `alpha.coucou-ia.com` → `custom.lemlist.com` en DNS only + TXT `lemlist-verif`, publiés et vérifiés ; les liens trackés porteront le domaine plutôt que celui, partagé, de lemlist).**

Reste, dans l'ordre :
1. Dans l'admin Google (Gmail → Authentifier les e-mails) : cliquer **« Lancer l'authentification »** maintenant que l'enregistrement est publié. Google peut mettre jusqu'à 48 h à le voir, en pratique quelques minutes.
2. Dans Lemlist : activer **lemwarm** sur la boîte : 2 à 3 semaines de chauffe avant tout volume (le creux d'août tombe bien pour ça). Les invitations LinkedIn, elles, peuvent démarrer sans attendre.
3. Vérifier avec le check de délivrabilité intégré à Lemlist avant le premier envoi réel.

## 2. Search Console (~10 min)

Bonne nouvelle : un TXT `google-site-verification` existe déjà sur le domaine, la vérification devrait être immédiate.
1. https://search.google.com/search-console → Ajouter la propriété « Domaine » `coucou-ia.com`.
2. Sitemaps → soumettre `https://coucou-ia.com/sitemap.xml`.
3. Noter dans un coin : d'ici 2-4 semaines, vérifier « Pages » (indexation des 16 URLs) et « Performances » (premières impressions).

## 3. Cal.com (~30 min)

**a) La page de réservation** (Event type « 30min ») :
- **Titre :** `Le point de départ : 30 minutes`
- **Description :**
  > 30 minutes pour voir ce que l'IA rend possible chez vous. Je vous dis franchement où elle rapporte dans votre activité, et où elle ne sert à rien, y compris si la réponse est non. Sans jargon, sans engagement, sans préparation nécessaire de votre côté.
- **Questions à la réservation** (en plus du nom/email) :
  1. Votre secteur d'activité ? (texte court, obligatoire)
  2. La taille de l'entreprise, en gros ? (texte court, obligatoire)
  3. Qu'est-ce qui vous amène ? (texte long, facultatif)
- **Langue / notifications :** passer l'interface et les emails de confirmation + rappel en français ; activer le rappel à J-1 (réduit les no-show).

**b) Le webhook** (trace chaque réservation dans les logs et stoppe les séquences Lemlist du prospect qui réserve ; Cal.com te notifie déjà par email) :
1. Générer un secret (une longue chaîne aléatoire), l'ajouter dans Vercel → Settings → Environment Variables : `CAL_WEBHOOK_SECRET`.
2. Cal.com → Settings → Developer → Webhooks → New : URL `https://coucou-ia.com/api/cal-webhook`, événement « Booking created », secret = le même.
3. Tester avec une fausse réservation : la ligne `[rdv]` doit apparaître dans les logs Vercel. (Le code est déjà en place : `app/api/cal-webhook/route.ts`.)

## 4. Profil LinkedIn (~30 min)

Appliquer `.agents/linkedin.md` section 1 (photo, titre, bannière, infos, lien). **Aucune invitation ne part avant ça** : le profil fait la crédibilité, l'invitation est sans note.

## 5. Google Business Profile (~15 min)

https://business.google.com → créer la fiche COUCOU IA (adresse du siège, catégorie « Consultant », site coucou-ia.com, description reprise du hero). Sert le SEO local Nice/PACA et recevra les futurs avis clients réels.

## 6. Lemlist : activer les 4 campagnes déjà montées (~30 min)

Les campagnes existent (montées par l'API le 2026-07-20, contenus depuis `.agents/outbound.md` et `.agents/nurture.md`) : Outbound expertise comptable, Outbound industrie, Nurture carte expertise comptable (`cam_qnKzY6bXNxtSinjAF`), Nurture carte industrie (`cam_YLiMdN5H3wAW84wYs`).
1. ~~Installer l'extension Chrome Lemlist et connecter ton compte LinkedIn.~~ **FAIT (2026-07-20).**
2. Les 2 campagnes **outbound** ont retrouvé leur séquence multicanal le 2026-07-20 au soir (invitation J0, ouverture J2, emails J6 / J11 / J18) : relire les 5 étapes dans Lemlist, sélectionner la boîte `jerome@coucou-ia.com` comme expéditeur de la campagne, vérifier le planning (mardi-jeudi en cœur, jamais le week-end). **On lance l'industrie d'abord** (décision du 2026-07-20 : l'été est le pire moment pour démarcher les comptables) ; la campagne compta attend la rentrée.
3. Les 2 campagnes **nurture** s'activent quand la chauffe lemwarm est finie (étape 1). Le site pousse déjà les leads dedans : la liste se construit, et la séquence complète (livraison + relances) démarrera à l'activation.

## 7. Lancer la semaine 1 du playbook outbound

Une fois 1, 4 et 6 faits : construire la liste (50-75 PME industrielles Sud/PACA, critères dans `.agents/outbound.md` §1 « Industrie »), l'importer dans la campagne « Outbound industrie », et démarrer à 10-15 invitations/jour (compte récent oblige). Attention aux fermetures d'août : les invitations envoyées à des dirigeants en congés dorment, prévoir la pleine cadence pour la rentrée. La liste compta (50-75 cabinets Nice/PACA) se construit fin août pour un lancement de rentrée.

## Optionnel mais utile
- **Ré-authentifier les connecteurs claude.ai** (Gmail, Google Drive, HubSpot) dans les réglages claude.ai → Connecteurs : utile pour les revues hebdo semi-automatiques (les réponses outbound, elles, sont désormais suivies via l'API Lemlist).
- ~~**Vercel → poser `LEMLIST_API_KEY` en production.**~~ **FAIT (2026-07-20).** Supprimer `BREVO_API_KEY` si elle existe encore.

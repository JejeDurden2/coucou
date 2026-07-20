# Checklist semaine 1 : les actions que seul le fondateur peut faire

**Version :** v1.1 (2026-07-20, bascule Brevo → Lemlist). Tout le reste (code, copy, séquences) est déjà prêt dans le repo, les docs `.agents/` et les 4 campagnes Lemlist. Cette liste ne contient que ce qui demande tes accès. Ordre = ordre d'exécution recommandé. Temps total estimé : 2 à 3 heures (+ le délai de chauffe email).

## 1. Boîte d'envoi et délivrabilité (avant toute prospection, ~45 min)

État constaté au 2026-07-19 (vérification DNS réelle) :
- SPF : `v=spf1 include:_spf.mx.cloudflare.net ~all` : Cloudflare uniquement.
- DKIM : **absent**. DMARC : **absent**. MX : Cloudflare Email Routing (réception seule).

**L'alias Cloudflare ne suffit pas.** Cloudflare Email Routing reçoit et transfère, il n'envoie pas : `jerome@coucou-ia.com` n'a pas de boîte. Envoyer « en tant que » cet alias depuis un Gmail perso signe les emails en `gmail.com` : authentification non alignée avec `coucou-ia.com`, exactement ce que Gmail et Yahoo filtrent le plus durement sur le cold email. Le Gmail perso connecté à Lemlist sert aux tests, jamais à la prospection.

À faire :
1. Créer une vraie boîte `jerome@coucou-ia.com` : Google Workspace Starter (~7 €/mois). Suivre l'assistant : les MX passent chez Google (la réception quitte Cloudflare Routing, l'alias devient inutile), SPF devient `v=spf1 include:_spf.google.com ~all`, activer DKIM dans l'admin Google.
2. Créer DMARC : TXT sur `_dmarc.coucou-ia.com` : `v=DMARC1; p=none; rua=mailto:jerome@coucou-ia.com` (observation d'abord, on durcira plus tard).
3. Connecter cette boîte dans Lemlist (Settings → Senders) et activer **lemwarm** : 2 à 3 semaines de chauffe avant tout volume. Les invitations LinkedIn, elles, peuvent démarrer sans attendre.
4. Vérifier avec le check de délivrabilité intégré à Lemlist avant le premier envoi réel.

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
1. Installer l'extension Chrome Lemlist et connecter ton compte LinkedIn (nécessaire aux étapes invitation + message des 2 campagnes outbound).
2. Sur chaque campagne : associer la boîte d'envoi (étape 1 de cette checklist), relire les étapes, vérifier le planning (mardi-jeudi en cœur, jamais le week-end) et, sur les 2 nurture, le lien de désinscription.
3. Lancer les 2 campagnes **nurture** dès que la boîte est chauffée : le site pousse déjà les leads dedans.
4. Les 2 campagnes **outbound** ne se lancent qu'avec la liste de prospects (étape 7) et après validation de ton profil LinkedIn (étape 4).

## 7. Lancer la semaine 1 du playbook outbound

Une fois 1, 4 et 6 faits : construire la liste (50-75 cabinets compta Nice/PACA, critères dans `.agents/outbound.md` §1), l'importer dans la campagne « Outbound expertise comptable », et démarrer à 10-15 invitations/jour (compte récent oblige).

## Optionnel mais utile
- **Ré-authentifier les connecteurs claude.ai** (Gmail, Google Drive, HubSpot) dans les réglages claude.ai → Connecteurs : utile pour les revues hebdo semi-automatiques (les réponses outbound, elles, sont désormais suivies via l'API Lemlist).
- **Vercel → poser `LEMLIST_API_KEY` en production** (sinon les leads des cartes partent en logs avec le marqueur `[lead-alerte]`, jamais chez Lemlist). Supprimer `BREVO_API_KEY` si elle existe.

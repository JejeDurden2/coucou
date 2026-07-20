# Checklist semaine 1 : les actions que seul le fondateur peut faire

**Version :** v1 (2026-07-19). Tout le reste (code, copy, séquences) est déjà prêt dans le repo et les docs `.agents/`. Cette liste ne contient que ce qui demande tes accès. Ordre = ordre d'exécution recommandé. Temps total estimé : 2 à 3 heures.

## 1. Délivrabilité email (avant toute prospection, ~30 min)

État constaté au 2026-07-19 (vérification DNS réelle) :
- SPF : `v=spf1 include:_spf.mx.cloudflare.net ~all` : Cloudflare uniquement, **Brevo absent**.
- DKIM Brevo : **absent**. DMARC : **absent**. MX : Cloudflare Email Routing (réception OK).

À faire dans Brevo puis dans la zone DNS (Cloudflare) :
1. Brevo → Réglages → Expéditeurs, domaines et IP → Authentifier le domaine `coucou-ia.com`. Brevo affiche 2-3 enregistrements exacts (DKIM `mail._domainkey`, code de vérification, et la valeur SPF à inclure). Les copier tels quels dans Cloudflare DNS.
2. Ajouter le SPF Brevo à l'enregistrement existant (un seul enregistrement SPF par domaine) : remplacer par `v=spf1 include:_spf.mx.cloudflare.net include:spf.brevo.com ~all` (vérifier le nom exact affiché par Brevo).
3. Créer DMARC : TXT sur `_dmarc.coucou-ia.com` : `v=DMARC1; p=none; rua=mailto:jerome@coucou-ia.com` (mode observation d'abord, on durcira plus tard).
4. Dans Brevo, re-cliquer « Vérifier » jusqu'au vert.

Sans ça, l'email de livraison de la carte et la future séquence nurture risquent le spam. Les emails outbound envoyés depuis Gmail passent, mais garde un volume faible et progressif (le playbook le prévoit).

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

**b) Le webhook** (rend chaque réservation visible dans les logs + par email) :
1. Générer un secret (une longue chaîne aléatoire), l'ajouter dans Vercel → Settings → Environment Variables : `CAL_WEBHOOK_SECRET`.
2. Cal.com → Settings → Developer → Webhooks → New : URL `https://coucou-ia.com/api/cal-webhook`, événement « Booking created », secret = le même.
3. Tester avec une fausse réservation : tu dois recevoir l'email `[rdv]` et voir la ligne `[rdv]` dans les logs Vercel. (Le code est déjà en place : `app/api/cal-webhook/route.ts`.)

## 4. Profil LinkedIn (~30 min)

Appliquer `.agents/linkedin.md` section 1 (photo, titre, bannière, infos, lien). **Aucune invitation ne part avant ça** : le profil fait la crédibilité, l'invitation est sans note.

## 5. Google Business Profile (~15 min)

https://business.google.com → créer la fiche COUCOU IA (adresse du siège, catégorie « Consultant », site coucou-ia.com, description reprise du hero). Sert le SEO local Nice/PACA et recevra les futurs avis clients réels.

## 6. Brevo : monter les 2 automatisations nurture (~30 min)

Suivre `.agents/nurture.md` : 2 automatisations (compta, industrie), 3 emails chacune, textes prêts à coller. À faire après l'étape 1 (délivrabilité), sinon les emails partiront mal armés.

## 7. Lancer la semaine 1 du playbook outbound

Une fois 1 et 4 faits : construire la liste (50-75 cabinets compta Nice/PACA, critères dans `.agents/outbound.md` §1) et envoyer le premier lot d'invitations (10-15/jour pour commencer, compte récent oblige).

## Optionnel mais utile
- **Ré-authentifier les connecteurs claude.ai** (Gmail, Google Drive, HubSpot) dans les réglages claude.ai → Connecteurs : ça me permettra de suivre les réponses outbound et préparer les revues hebdo automatiquement.
- **Vercel → vérifier que `BREVO_API_KEY` est bien posée en production** (sinon les leads partent en logs avec le marqueur `[lead-alerte]`, jamais chez Brevo).

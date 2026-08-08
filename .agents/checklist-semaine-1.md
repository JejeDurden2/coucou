# Checklist semaine 1 : les actions que seul le fondateur peut faire

**Version :** v1.3 (2026-08-04 : bascule Lemlist → Brevo, voir `.agents/outbound.md` v2.0 et `.agents/nurture.md` v2.0 pour le contexte complet). Tout le reste (code, copy, séquences) est déjà prêt dans le repo et les docs `.agents/`. Ce qui manque encore côté Brevo, c'est ce que l'API ne peut pas faire à ta place (créer les automations) et ce qui n'existe que dans ton compte (clé API, authentification du domaine). Cette liste ne contient que ce qui demande tes accès. Ordre = ordre d'exécution recommandé.

## 1. Finir la délivrabilité de la boîte. Presque terminée

~~Créer la boîte `jerome@coucou-ia.com` (Google Workspace)~~ **FAIT (2026-07-20).** ~~La connecter dans Lemlist (Settings → Senders)~~ **FAIT (2026-07-20).** ~~Désactiver Email Routing, MX `smtp.google.com`, SPF Google, DMARC `p=none`~~ **FAIT (2026-07-20 au soir, via l'API Cloudflare, vérifié sur résolveurs Google et Cloudflare).** La réception arrive désormais dans la boîte Workspace : l'ancien transfert Cloudflare vers le Gmail perso ne fonctionne plus.

~~Publier la clé DKIM~~ **FAIT (2026-07-20 au soir, TXT `google._domainkey` publié via l'API Cloudflare et vérifié complet sur les résolveurs publics).** ~~Domaine de tracking Lemlist~~ **FAIT (même soir : CNAME `alpha.coucou-ia.com` → `custom.lemlist.com` en DNS only + TXT `lemlist-verif`, publiés et vérifiés ; les liens trackés porteront le domaine plutôt que celui, partagé, de lemlist).**

~~Lancer l'authentification DKIM côté Google, activer lemwarm~~ **FAIT (2026-07-20 au soir), mais ne sert plus à rien seul depuis la bascule Brevo.** Cette authentification couvrait l'envoi Lemlist, qui passait par la vraie boîte Gmail. Brevo envoie depuis ses propres serveurs : il faut une authentification séparée, en plus de celle-ci (elle reste utile pour la réception et pour tout email envoyé directement depuis Gmail).

**Nouveau : authentifier `coucou-ia.com` côté Brevo (~20 min, avant tout envoi).**
1. Brevo → Settings → Senders, Domains & Dedicated IPs → Domains → ajouter `coucou-ia.com`.
2. Brevo donne 3 enregistrements DNS à ajouter chez Cloudflare : un TXT de vérification de propriété, un TXT/CNAME DKIM (sélecteur propre à Brevo, différent de celui de Google), et une ligne SPF. **Pour le SPF : ne pas remplacer l'enregistrement existant**, ajouter l'`include` Brevo à la suite de celui de Google dans le même TXT (un domaine n'a qu'un seul enregistrement SPF, avec plusieurs `include` possibles).
3. Attendre la vérification (quelques minutes à quelques heures), confirmée dans Brevo.
4. Ajouter `jerome@coucou-ia.com` comme expéditeur vérifié (Senders → Add a sender), depuis le domaine authentifié.
5. Pas d'équivalent lemwarm automatique côté Brevo : la montée en charge se fait à la main, en respectant les volumes de `.agents/outbound.md` section 5 (20-30 emails/jour pour démarrer).

Dernier geste avant le premier envoi réel : vérifier le statut du domaine dans Brevo (doit afficher « vérifié », pas juste « en attente »).

**Nettoyage optionnel :** le domaine de tracking Lemlist (`alpha.coucou-ia.com` → `custom.lemlist.com`) ne sert plus à rien une fois Lemlist arrêté ; peut être supprimé du DNS Cloudflare sans urgence. Si Lemlist n'est plus utilisé du tout, penser aussi à mettre l'abonnement en pause côté compte Lemlist (économie, action côté facturation uniquement).

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

**b) Le webhook** (trace chaque réservation dans les logs et stoppe les automations Brevo du prospect qui réserve ; Cal.com te notifie déjà par email) :
1. ~~Générer un secret~~ **FAIT (2026-08-08, Claude) : le secret est généré, sa valeur est dans la conversation.** L'ajouter dans Vercel : `vercel env add CAL_WEBHOOK_SECRET production` (le CLI est maintenant lié au projet `coucou`), ou Vercel → Settings → Environment Variables.
2. Cal.com → Settings → Developer → Webhooks → New : URL `https://coucou-ia.com/api/cal-webhook`, événement « Booking created », secret = le même.
3. Tester avec une fausse réservation : la ligne `[rdv]` doit apparaître dans les logs Vercel. (Le code est déjà en place : `app/api/cal-webhook/route.ts`.)

## 4. Profil LinkedIn (~30 min)

Appliquer `.agents/linkedin.md` section 1 (photo, titre, bannière, infos, lien). L'outbound n'envoie plus d'invitation LinkedIn (bascule Brevo, email seul), mais un prospect qui reçoit un email à froid va souvent chercher l'expéditeur sur LinkedIn avant de répondre : le profil reste la première vérification de crédibilité, à faire avant le premier envoi.

## 5. Google Business Profile (~15 min)

https://business.google.com → créer la fiche COUCOU IA (adresse du siège, catégorie « Consultant », site coucou-ia.com, description reprise du hero). Sert le SEO local Nice/PACA et recevra les futurs avis clients réels.

## 6. Brevo : créer les automations (~1 h 30 ; listes et attributs FAITS le 2026-08-08 par API)

L'API Brevo ne crée pas les automations (étapes, délais, contenu) : cette partie se fait à la main dans l'interface. Tout le reste est fait (2026-08-08, Claude, la restriction IP ayant été levée) :

1. ~~**Attributs de contact** `PRENOM` et `NOTES`~~ **FAIT (2026-08-08, par API).**
2. ~~**5 listes** et report des IDs dans le code~~ **FAIT (2026-08-08, par API) : 3 Nurture carte expertise comptable, 4 Nurture carte industrie, 5 Nurture kit de démarrage, 6 Outbound expertise comptable, 7 Outbound industrie.** IDs posés dans `content/ressources.ts`, `content/kit.ts` et `app/api/cal-webhook/route.ts`.
3. **3 automations nurture** (Automation → Create a workflow → démarrer d'un workflow vide, déclencheur « contact added to a list ») : une par liste nurture (compta, industrie, kit), contenu dans `.agents/nurture.md` (email J0 livraison + relances J+3 / J+10 / J+21 ; la séquence kit est écrite depuis le 2026-08-08). **Condition de sortie à régler sur « contact retiré de la liste » : indispensable**, c'est ce qui fait fonctionner l'arrêt automatique du webhook Cal.com.
4. **2 automations outbound** (même principe) : contenu dans `.agents/outbound.md` section 3 (email J0 / J5 / J12, par secteur). Même condition de sortie.
5. Sélectionner `jerome@coucou-ia.com` comme expéditeur de chaque automation (une fois le domaine authentifié, étape 1), vérifier que le lien de désinscription est visible dans chaque email, relire, activer.
6. ~~Poser `BREVO_API_KEY` en production~~ **FAIT (2026-08-08 : Production + Preview via `vercel env add`, le repo est maintenant lié au projet Vercel `coucou`).** `LEMLIST_API_KEY` n'existait pas, rien à supprimer.

## 7. Lancer la semaine 1 du playbook outbound

~~Construire la liste de PME industrielles Sud/PACA~~ **FAIT (2026-07-21) : 74 entreprises sourcées et priorisées dans `~/marketing-plans/coucou-ia/materials/prospects-industrie-v1.csv`** (priorité A = 06, B = 83, C = 13, D = 84/04/05 ; colonnes signal, dirigeant, LinkedIn quand trouvé, note de prudence quand il y en a une).

~~Importer les prospects dans la campagne Lemlist « Outbound industrie »~~ **FAIT (2026-07-21) mais reste sur Lemlist, pas migré.** Les 74 leads n'ont jamais quitté Lemlist : depuis la bascule Brevo, ils sont à réimporter dans la nouvelle liste Brevo « Outbound industrie » (étape 6). **Nouveau blocage : le CSV source n'a aucune colonne email**, il a été sourcé pour du LinkedIn (nom, URL LinkedIn), pas pour de l'email. Avant tout import Brevo :
1. Trouver l'email professionnel de chacun des 74 dirigeants (page contact du site, format standard de l'entreprise) et l'ajouter au CSV.
2. Vérifier chaque adresse (un vérificateur d'email, ou a minima un envoi de test) avant import : un taux de rebond élevé dès le premier envoi abîme la réputation du domaine pour tous les envois Brevo, outbound comme nurture.
3. Compléter au passage les profils encore marqués « ? » ou les 2 URLs LinkedIn douteuses (Gravic, Ragni), utiles pour la personnalisation même sans invitation à envoyer.

Reste ensuite : une fois 4 et 6 faits, démarrer à 20-30 emails/jour (`.agents/outbound.md` section 5). **Ne pas lancer avant que le domaine soit vérifié dans Brevo** (étape 1) : sans authentification, les emails partent en indésirables dès le premier envoi. Fermetures d'août obligent, la pleine cadence se joue de toute façon à la rentrée. La liste compta (50-75 cabinets Nice/PACA) se construit fin août pour un lancement de rentrée, email compris dès le sourcing cette fois.

## Optionnel mais utile
- **Ré-authentifier les connecteurs claude.ai** (Gmail, Google Drive, HubSpot) dans les réglages claude.ai → Connecteurs : utile pour les revues hebdo semi-automatiques (les réponses outbound se suivent maintenant à l'œil dans la boîte mail, Brevo n'a pas d'inbox unifiée comme Lemlist).
- **Vercel → `BREVO_API_KEY` et suppression de `LEMLIST_API_KEY`** : voir section 6, étape 7, c'est là que ça se fait.

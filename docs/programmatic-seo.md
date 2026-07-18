# SEO programmatique : stratégie Coucou IA

Version v1 (2026-07-18). Périmètre validé par recherche SERP le 2026-07-18.
S'appuie sur `.agents/product-marketing.md`. Les secteurs cibles y sont marqués [À VALIDER] : **valider la liste avec le fondateur avant de produire les pages.**

## 1. Diagnostic honnête

Le site part de zéro : domaine neuf, aucune autorité, aucune référence client publiable, une seule page. Générer des centaines de pages serait contre-productif (contenu mince, budget crawl gaspillé, crédibilité entamée). La bonne échelle au lancement : **une douzaine de pages à forte valeur unique**, extensibles ensuite.

Deux playbooks retenus, un écarté :

| Playbook | Verdict | Pourquoi |
|----------|---------|----------|
| **Personas** (« IA pour [secteur] ») | ✅ Phase 1 | SERP tenues par des éditeurs SaaS (Cegid, Sage) et des blogs, pas par des cabinets de conseil. Intention forte, concurrence battable, colle au positionnement. |
| **Cas d'usage** (« automatiser [tâche] avec l'IA ») | ✅ Phase 1 | SERP tenues par des outils SaaS (Tenderbolt, Parseur, Rossum). Angle différenciant naturel : le système sur mesure branché sur VOS données, contre l'outil générique. |
| **Locations** (« agence IA [ville] ») | ❌ Écarté | Pattern saturé (Poller, Plug-Tech, Sortlist ont déjà des pages ville templatisées) et Coucou n'a pas de présence locale : ce serait des doorway pages. À reconsidérer seulement avec une vraie implantation locale. |

Glossaire : pas en phase 1. Faible intention, à traiter plus tard comme socle d'autorité topique (et pour l'AI SEO) une fois les pages commerciales indexées.

## 2. Phase 1 : périmètre

**13 pages** : 2 hubs + 6 pages secteurs + 5 pages cas d'usage.

### Pages secteurs (`/secteurs/[slug]`)

Hub : `/secteurs`. Secteurs issus du contexte marketing [À VALIDER] :

| Slug | Requête principale visée |
|------|--------------------------|
| `expertise-comptable` | IA cabinet comptable, IA pour experts-comptables |
| `cabinets-juridiques` | IA cabinet avocat, IA juridique PME |
| `industrie` | IA industrie PME, IA usine |
| `services-b2b` | IA services entreprise, automatisation services B2B |
| `assurance-mutuelle` | IA assurance, IA mutuelle |
| `sante-medico-social` | IA santé, IA médico-social |

E-commerce et distribution : en réserve, à ajouter si validés.

### Pages cas d'usage (`/cas-usage/[slug]`)

Hub : `/cas-usage`. Reprend les 5 cas de `content/use-cases.ts`, chacun développé en page complète :

| Slug | Requête principale visée |
|------|--------------------------|
| `reponse-appels-offres` | répondre aux appels d'offres avec l'IA |
| `assistant-support-client` | assistant IA support client, chatbot support entreprise |
| `traitement-documents` | automatisation traitement factures, IA traitement documents |
| `recherche-interne` | recherche documentaire interne IA |
| `qualification-leads` | qualification automatique des leads |

La section « cas d'usage » de la home pointe vers ces pages (maillage descendant naturel).

## 3. Anti-contenu-mince : la barre de qualité

Chaque page doit contenir **au moins 60 % de contenu impossible à transposer à une autre page** du même gabarit. Une page qui n'atteint pas la barre n'est pas publiée.

Contenu unique exigé par page secteur :

- 3 ou 4 cas d'usage reformulés dans le vocabulaire métier du secteur (pas les 5 génériques recopiés).
- La contrainte réglementaire propre au secteur : secret professionnel (compta, juridique), HDS et données de santé (médico-social), ACPR (assurance), RGPD et AI Act partout.
- Les objections du secteur, dans les mots du secteur.
- Un mini business case chiffré, toujours étiqueté « Exemple » (règle existante de `use-cases.ts`).
- FAQ de 4 ou 5 questions spécifiques (alimente le schema FAQPage).

Contenu unique exigé par page cas d'usage :

- Le processus avant / après, concret, outil par outil.
- Pourquoi un outil SaaS générique ne suffit pas ici (c'est notre angle contre les SERP actuelles, sans dénigrer de marque nommée).
- Prérequis côté client (données, outils, volumétrie).
- Chiffres illustratifs étiquetés « Exemple », jamais présentés comme des références.

## 4. Gabarit de page

### Title et meta

- Title secteur : `IA pour [secteur] : cas d'usage et ROI | Coucou IA` (≤ 60 caractères, ajuster par secteur).
- Title cas d'usage : `[Bénéfice actif] avec l'IA : le guide PME | Coucou IA` (ex. « Répondre aux appels d'offres avec l'IA »).
- Meta description : 150 caractères, mots-clés en tête, se termine par la promesse diagnostic gratuit.

### Structure (H2 dans l'ordre)

1. Hero : H1 avec la requête cible, sous-titre orienté douleur du persona, CTA `Réserver un diagnostic`.
2. Le problème dans ce secteur / sur cette tâche (verbatim client).
3. Cas d'usage concrets (secteur) ou avant / après (cas d'usage).
4. Business case exemple (metric-block, étiqueté « Exemple »).
5. Conformité et données (RGPD, AI Act, spécificité sectorielle).
6. Méthode en bref, lien vers `/#methode` et `/#garantie`.
7. FAQ.
8. CTA final : bloc diagnostic gratuit.

### Maillage interne

- Hub → spokes, spokes → hub (breadcrumb), et 2 ou 3 liens croisés pertinents secteur ↔ cas d'usage (ex. `expertise-comptable` ↔ `traitement-documents`).
- Entrée « Secteurs » dans la nav ou le footer : aucune page orpheline.
- Toutes les pages dans `app/sitemap.ts` (sans lastModified, règle existante).

### JSON-LD

- `Service` (provider : Coucou IA) + `FAQPage` + `BreadcrumbList` sur chaque page.
- Réutiliser le pattern JSON-LD existant du layout, pas de nouvelle dépendance.

## 5. Implémentation (stack existante)

Pas de CMS, pas de MDX, pas de nouvelle dépendance : le contenu reste des modules TS typés dans `content/`, conformément au contrat du repo.

- `content/secteurs.ts` : `type SecteurPage` (slug, title, metaDescription, h1, douleurs, cas d'usage sectoriels, conformité, faq, businessCaseExemple).
- `content/cas-usage-pages.ts` : idem pour les cas d'usage, référence les entrées de `use-cases.ts` pour ne rien dupliquer.
- `app/secteurs/[slug]/page.tsx` et `app/cas-usage/[slug]/page.tsx` : Server Components, `generateStaticParams` depuis le module de contenu, `generateMetadata` typé, `notFound()` si slug inconnu.
- Un composant de gabarit par playbook dans `components/sections/`, composé des primitives existantes (metric-block, sections). Aucun `"use client"` au niveau page.
- Hubs : `app/secteurs/page.tsx` et `app/cas-usage/page.tsx`, liste de cartes vers les spokes.

Règles de copie inchangées et non négociables : français, vous, aucun em-dash, CTA unique `Réserver un diagnostic`, jamais de prix, chiffres réels ou étiquetés « Exemple ».

## 6. Phase 2 : déclencheurs, pas de calendrier

| Déclencheur | Extension |
|-------------|-----------|
| Pages phase 1 indexées et impressions dans Search Console | Croisements secteur × cas d'usage à la demande (« traitement de factures pour cabinet comptable »), uniquement si la SERP montre une demande distincte |
| Premières références clients validées | Injection de preuves réelles dans les pages, remplacement progressif des « Exemple » |
| Autorité de domaine qui monte | Glossaire (`/glossaire/[terme]`) : agent IA, RAG, AI Act pour les PME |
| Implantation locale réelle | Reconsidérer les pages villes, sinon jamais |

## 7. Mesure

Avant publication : Search Console branchée, suivi indexation par sous-dossier (`/secteurs/`, `/cas-usage/`). À surveiller : taux d'indexation, impressions par pattern, prises de RDV attribuées (le seul KPI final). Une page sans impression après 3 mois : améliorer ou fusionner, pas multiplier.

# Plan d'Amélioration du PDF d'Audit

**Date de création**: 14 février 2026
**Référence**: [PDF Review Executive Summary](./pdf-review-executive-summary.md)

Ce document contient les tasks exécutables pour améliorer le système de génération de PDF d'audit, séquencées par phase avec estimations d'effort.

---

## 📊 Vue d'Ensemble

| Phase | Tasks | Effort Total | Impact | Priorité |
|-------|-------|--------------|--------|----------|
| Phase 1: Quick Wins | 5 | < 1 jour | 🔥 Élevé | P0 |
| Phase 2: Migration Legacy | 3 | 2-3 jours | 🔥 Élevé | P0 |
| Phase 3: Extraction Composants | 4 | 1 semaine | 🟡 Moyen | P1 |
| Phase 4: Edge Cases | 5 | 1 semaine | 🟡 Moyen | P1 |
| Phase 5: Performance | 3 | 3-4 jours | 🟢 Faible | P2 |
| Phase 6: Documentation | 2 | 2-3 jours | 🟢 Faible | P2 |

**Total estimé**: 3-4 semaines (si tout est fait)
**Recommandé minimum**: Phases 1-2 (3-4 jours)

---

## Phase 1: Quick Wins (< 1 jour)

**Objectif**: Corrections rapides avec fort impact pour éliminer dette technique critique.

### ✅ [QW-1] Supprimer styles.ts legacy

**Priorité**: P0 (Critique)
**Effort**: 5 min
**Impact**: Élimine confusion entre deux systèmes de theme

**Steps**:
1. Vérifier qu'aucun fichier n'importe `styles.ts`:
   ```bash
   grep -r "from.*styles" apps/api/src/modules/audit/infrastructure/pdf/
   ```
2. Si aucun usage trouvé, supprimer:
   ```bash
   git rm apps/api/src/modules/audit/infrastructure/pdf/styles.ts
   ```
3. Commit:
   ```bash
   git commit -m "refactor(audit): remove legacy styles.ts theme system"
   ```

**Vérification**:
- ✅ File `styles.ts` n'existe plus
- ✅ Aucun import de `styles.ts` dans le codebase
- ✅ PDF se génère sans erreur

---

### ✅ [QW-2] Fixer CategoryBadge borderRadius

**Priorité**: P1 (Important)
**Effort**: 2 min
**Impact**: Respecte principe brutalist "no rounded corners"

**Fichier**: `apps/api/src/modules/audit/infrastructure/pdf/components/category-badge.tsx`

**Changes**:
```diff
  <View
    style={{
      backgroundColor: theme.colors.bgCard,
      borderWidth: 1,
      borderColor: theme.colors.border,
-     borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 3,
    }}
  >
```

**Commit**:
```bash
git commit -m "fix(audit): remove borderRadius from CategoryBadge for brutalist consistency"
```

**Vérification**:
- ✅ CategoryBadge a des coins angulaires (no borderRadius)
- ✅ PDF se génère correctement

---

### ✅ [QW-3] Renommer LogoSvg → CoucouLogo

**Priorité**: P1 (Important)
**Effort**: 5 min
**Impact**: Cohérence naming (filename = export name)

**Fichiers**:
- Renommer: `assets/logo-svg.tsx` → `assets/coucou-logo.tsx`
- Ou: Renommer export `LogoSvg` → `CoucouLogo` dans `logo-svg.tsx`

**Recommandation**: Garder fichier `logo-svg.tsx` mais renommer export

**Changes** dans `apps/api/src/modules/audit/infrastructure/pdf/assets/logo-svg.tsx`:
```diff
- export function LogoSvg({ width = 120 }: LogoSvgProps): React.JSX.Element {
+ export function CoucouLogo({ width = 120 }: CoucouLogoProps): React.JSX.Element {
```

**Commit**:
```bash
git commit -m "refactor(audit): rename LogoSvg to CoucouLogo for consistency"
```

**Vérification**:
- ✅ Tous les imports utilisent `CoucouLogo`
- ✅ Export s'appelle `CoucouLogo`
- ✅ PDF affiche le logo correctement

---

### ✅ [QW-4] Standardiser footers avec PageFooter component

**Priorité**: P1 (Important)
**Effort**: 30 min
**Impact**: Élimine duplication, assure cohérence visuelle

**Steps**:

1. **Créer composant PageFooter**:

Fichier: `apps/api/src/modules/audit/infrastructure/pdf/components/page-footer.tsx`

```tsx
import { View, Text } from '@react-pdf/renderer';

import { theme, baseStyles } from '../theme';

interface PageFooterProps {
  left: string;
  right: string;
}

/**
 * PageFooter - Footer standardisé pour toutes les pages
 *
 * Affiche un footer fixe en bas avec texte left/right aligné.
 * Utilise mono font et tiny size pour cohérence brutalist.
 */
export function PageFooter({
  left,
  right,
}: PageFooterProps): React.JSX.Element {
  return (
    <View style={baseStyles.footer} fixed>
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.tiny,
        }}
      >
        {left}
      </Text>
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.tiny,
        }}
      >
        {right}
      </Text>
    </View>
  );
}
```

2. **Remplacer tous les footers**:

Pages à modifier (8):
- `executive-summary.tsx:187-194` → `<PageFooter left="COUCOU IA" right="02" />`
- `geo-score-detail.tsx:176-183` → `<PageFooter left="COUCOU IA" right="03" />`
- `site-audit.tsx:326-333` → `<PageFooter left="COUCOU IA" right="AUDIT TECHNIQUE" />`
- `external-presence.tsx:172-175` → `<PageFooter left="Coucou IA" right="Présence Externe" />`
- `competitor-benchmark.tsx:417-420` → `<PageFooter left="Coucou IA" right="Benchmark Concurrentiel" />`
- `action-plan.tsx:181-188` → `<PageFooter left="COUCOU IA" right="PLAN D'ACTION" />`
- Cover et CTA n'ont pas de footer → OK

3. **Exporter PageFooter**:

Ajouter dans un fichier index si nécessaire, ou importer directement.

**Commit**:
```bash
git commit -m "refactor(audit): standardize page footers with PageFooter component"
```

**Vérification**:
- ✅ Tous les footers utilisent PageFooter component
- ✅ Footers ont style cohérent (mono font, tiny size)
- ✅ PDF se génère correctement

---

### ✅ [QW-5] Ajouter edge case pour totalActions === 0

**Priorité**: P1 (Important)
**Effort**: 10 min
**Impact**: Améliore UX pour sites déjà optimisés

**Fichier**: `apps/api/src/modules/audit/infrastructure/pdf/components/action-plan.tsx`

**Changes** (après MetricHero):
```diff
  <MetricHero
    value={actionPlan.totalActions}
    label="OPTIMISATIONS"
    variant="accent"
  />

+ {/* Message positif si aucune action */}
+ {actionPlan.totalActions === 0 && (
+   <View
+     style={{
+       backgroundColor: theme.colors.success,
+       padding: 20,
+       marginVertical: 20,
+     }}
+   >
+     <Text
+       style={{
+         fontFamily: theme.fonts.mono,
+         fontSize: theme.fontSize.base,
+         color: theme.colors.brutalWhite,
+         lineHeight: 1.5,
+       }}
+     >
+       ✅ Excellent ! Votre site est déjà bien optimisé pour la visibilité IA.
+       Aucune action critique identifiée.
+     </Text>
+   </View>
+ )}

  {/* Quick Wins */}
  <ActionSection
```

**Commit**:
```bash
git commit -m "feat(audit): add positive message when no actions required"
```

**Vérification**:
- ✅ Si totalActions === 0, message positif affiché
- ✅ Si totalActions > 0, sections normales affichées
- ✅ PDF se génère correctement

---

## Phase 2: Migration Legacy Complète (2-3 jours)

**Objectif**: Éliminer complètement le système legacy et standardiser sur theme.ts.

### ✅ [LEG-1] Migrer couleurs hardcodées vers theme tokens

**Priorité**: P0 (Critique)
**Effort**: 3-4 heures
**Impact**: Assure cohérence et évolutivité du theme

**Fichiers à modifier**:

1. **logo-svg.tsx** (hardcoded colors):

```diff
  <Path
    d="M8 20C8 12.268 14.268 6 22 6h4c7.732 0 14 6.268 14 14v4c0 7.732-6.268 14-14 14h-2l-6 6v-6.17C11.058 35.93 8 30.374 8 24v-4z"
-   fill="#8B5CF6"
+   fill={theme.colors.accent}
  />

  {/* Eye */}
- <Circle cx="28" cy="20" r="4" fill="#09090B" />
- <Circle cx="29.5" cy="18.5" r="1.5" fill="#FFFFFF" />
+ <Circle cx="28" cy="20" r="4" fill={theme.colors.bgPrimary} />
+ <Circle cx="29.5" cy="18.5" r="1.5" fill={theme.colors.brutalWhite} />

  {/* Beak */}
- <Path d="M36 22l6 2-6 2v-4z" fill="#8B5CF6" />
+ <Path d="M36 22l6 2-6 2v-4z" fill={theme.colors.accent} />

  {/* Wing */}
  <Path
    d="M14 22c2-4 6-6 10-6"
-   stroke="#09090B"
+   stroke={theme.colors.bgPrimary}
```

**Note**: Ajouter import `import { theme } from '../theme';` en haut du fichier.

2. **Vérifier autres hardcoded colors**:

```bash
grep -r "#[0-9A-Fa-f]\{6\}" apps/api/src/modules/audit/infrastructure/pdf/components/
```

Remplacer tous les hex codes par theme tokens appropriés.

**Commit**:
```bash
git commit -m "refactor(audit): migrate hardcoded colors to theme tokens"
```

**Vérification**:
- ✅ Aucun hardcoded hex color dans components/
- ✅ Tous utilisent theme.colors.*
- ✅ Logo s'affiche correctement avec theme colors

---

### ✅ [LEG-2] Créer SectionHeader component

**Priorité**: P1 (Important)
**Effort**: 1 heure
**Impact**: Élimine duplication sur 7 pages

**Steps**:

1. **Créer composant SectionHeader**:

Fichier: `apps/api/src/modules/audit/infrastructure/pdf/components/section-header.tsx`

```tsx
import { View, Text } from '@react-pdf/renderer';

import { theme } from '../theme';

interface SectionHeaderProps {
  title: string;
  align?: 'left' | 'right';
}

/**
 * SectionHeader - En-tête de section standardisé
 *
 * Petit titre uppercase monospace, aligné à droite par défaut (brutalist convention).
 */
export function SectionHeader({
  title,
  align = 'right',
}: SectionHeaderProps): React.JSX.Element {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        marginBottom: 24,
      }}
    >
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.sm,
          fontWeight: 700,
          color: theme.colors.textMuted,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Text>
    </View>
  );
}
```

2. **Remplacer dans toutes les pages**:

- `executive-summary.tsx:39-58` → `<SectionHeader title="RÉSUMÉ EXÉCUTIF" />`
- `geo-score-detail.tsx:100-113` → `<SectionHeader title="DÉTAIL SCORES" />`
- `site-audit.tsx:145-160` → `<SectionHeader title="AUDIT TECHNIQUE" />`
- `external-presence.tsx:27-40` → `<SectionHeader title="PRÉSENCE EXTERNE" />`
- `competitor-benchmark.tsx:268-281` → `<SectionHeader title="BENCHMARK CONCURRENTIEL" />`
- `action-plan.tsx:134-147` → `<SectionHeader title="PLAN D'ACTION" />`

**Commit**:
```bash
git commit -m "refactor(audit): extract SectionHeader component to eliminate duplication"
```

**Vérification**:
- ✅ Toutes les pages utilisent SectionHeader
- ✅ Style cohérent sur toutes les sections
- ✅ PDF se génère correctement

---

### ✅ [LEG-3] Documenter theme.ts comme source unique de vérité

**Priorité**: P2 (Nice to have)
**Effort**: 30 min
**Impact**: Facilite onboarding et maintenance

**Fichier**: `apps/api/src/modules/audit/infrastructure/pdf/theme.ts`

**Changes** (ajouter en haut du fichier):
```tsx
/**
 * Theme System - PDF Audit
 *
 * ⚠️ SOURCE UNIQUE DE VÉRITÉ pour le design system du PDF d'audit.
 *
 * Ce fichier définit:
 * - Fonts: Fraunces (display), Bricolage Grotesque (body/mono)
 * - Colors: Palette brutalist dark (bgPrimary, accent, semantic colors)
 * - Font sizes: 8-scale de tiny (6pt) à 7xl (96pt) pour typographie architecturale
 * - Spacing: 8px grid system
 * - Base styles: page, card, footer, brutal styles
 *
 * IMPORTANT:
 * - ✅ Toujours utiliser theme.colors.* au lieu de hardcoded hex
 * - ✅ Toujours utiliser theme.fontSize.* au lieu de numbers
 * - ✅ Toujours utiliser theme.fonts.* au lieu de font names directs
 * - ❌ NE JAMAIS créer de système parallèle (styles.ts a été supprimé)
 *
 * @example
 * ```tsx
 * import { theme } from '../theme';
 *
 * <Text style={{
 *   fontFamily: theme.fonts.mono,
 *   fontSize: theme.fontSize.base,
 *   color: theme.colors.accent,
 * }}>
 *   Hello World
 * </Text>
 * ```
 */
```

**Commit**:
```bash
git commit -m "docs(audit): document theme.ts as single source of truth"
```

**Vérification**:
- ✅ Documentation claire en haut de theme.ts
- ✅ Examples d'usage fournis

---

## Phase 3: Extraction Composants (1 semaine)

**Objectif**: Extraire les composants internes en primitives réutilisables.

### ✅ [EXT-1] Extraire FindingCard component

**Priorité**: P1 (Important)
**Effort**: 1-2 heures
**Impact**: Améliore réutilisabilité et testabilité

**Source**: `apps/api/src/modules/audit/infrastructure/pdf/components/site-audit.tsx:49-122`

**Nouveau fichier**: `apps/api/src/modules/audit/infrastructure/pdf/components/finding-card.tsx`

```tsx
import { View, Text } from '@react-pdf/renderer';
import type { AnalysisFinding } from '@coucou-ia/shared';

import { theme } from '../theme';

const SEVERITY_COLORS: Record<AnalysisFinding['severity'], string> = {
  critical: theme.colors.destructive,
  warning: theme.colors.warning,
  info: theme.colors.accent,
};

const SEVERITY_LABELS: Record<AnalysisFinding['severity'], string> = {
  critical: 'CRITIQUE',
  warning: 'ATTENTION',
  info: 'INFO',
};

interface FindingCardProps {
  finding: AnalysisFinding;
}

/**
 * FindingCard - Carte de constat technique
 *
 * Affiche un finding avec severity, title, detail, recommendation.
 * Utilise color-coding pour severity (critical=red, warning=amber, info=purple).
 */
export function FindingCard({
  finding,
}: FindingCardProps): React.JSX.Element {
  const severityColor = SEVERITY_COLORS[finding.severity];

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgCard,
        padding: 10,
        marginBottom: 8,
        borderLeftWidth: 5,
        borderLeftColor: severityColor,
      }}
      wrap={false}
    >
      {/* Severity label */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.tiny,
          fontWeight: 700,
          color: severityColor,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {SEVERITY_LABELS[finding.severity]}
      </Text>

      {/* Title */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.sm,
          fontWeight: 700,
          color: theme.colors.textPrimary,
          marginBottom: 4,
          lineHeight: 1.3,
        }}
      >
        {finding.title}
      </Text>

      {/* Detail */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.tiny,
          color: theme.colors.textMuted,
          lineHeight: 1.4,
          marginBottom: 4,
        }}
      >
        {finding.detail}
      </Text>

      {/* Recommendation */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.tiny,
          color: theme.colors.accent,
          lineHeight: 1.4,
        }}
      >
        → {finding.recommendation}
      </Text>
    </View>
  );
}
```

**Modifier site-audit.tsx**:
```diff
+ import { FindingCard } from './finding-card';

- function FindingCard({ finding }: { finding: AnalysisFinding }): React.JSX.Element {
-   // ... tout le code
- }
```

**Commit**:
```bash
git commit -m "refactor(audit): extract FindingCard as reusable primitive component"
```

**Vérification**:
- ✅ FindingCard existe dans components/finding-card.tsx
- ✅ site-audit.tsx importe et utilise FindingCard
- ✅ PDF se génère correctement

---

### ✅ [EXT-2] Extraire ActionCard component

**Priorité**: P1 (Important)
**Effort**: 1-2 heures

**Source**: `action-plan.tsx:14-70`
**Destination**: `components/action-card.tsx`

(Même process que EXT-1)

---

### ✅ [EXT-3] Extraire CompetitorCard component

**Priorité**: P1 (Important)
**Effort**: 2-3 heures

**Source**: `competitor-benchmark.tsx:129-253`
**Destination**: `components/competitor-card.tsx`

(Même process que EXT-1)

---

### ✅ [EXT-4] Créer composants index barrel export

**Priorité**: P2 (Nice to have)
**Effort**: 30 min
**Impact**: Simplifie les imports

**Créer**: `apps/api/src/modules/audit/infrastructure/pdf/components/index.ts`

```tsx
// Page components
export { CoverPage } from './cover-page';
export { ExecutiveSummary } from './executive-summary';
export { GeoScoreDetail } from './geo-score-detail';
export { SiteAudit } from './site-audit';
export { ExternalPresence } from './external-presence';
export { CompetitorBenchmarkSection } from './competitor-benchmark';
export { ActionPlanSection } from './action-plan';
export { CtaPage } from './cta-page';

// Primitive components
export { BrutalGrid } from './brutal-grid';
export { TypeSlab } from './type-slab';
export { DataSlab } from './data-slab';
export { MetricHero } from './metric-hero';
export { ScoreCircle } from './score-circle';
export { ProgressBar } from './progress-bar';
export { ImpactDots } from './impact-dots';
export { CategoryBadge } from './category-badge';
export { PlatformRow } from './platform-row';
export { FindingCard } from './finding-card';
export { ActionCard } from './action-card';
export { CompetitorCard } from './competitor-card';

// Helpers
export { PageFooter } from './page-footer';
export { SectionHeader } from './section-header';
```

**Permet d'importer**:
```tsx
import { CoverPage, ExecutiveSummary, ScoreCircle } from './components';
```

Au lieu de:
```tsx
import { CoverPage } from './components/cover-page';
import { ExecutiveSummary } from './components/executive-summary';
import { ScoreCircle } from './components/score-circle';
```

**Commit**:
```bash
git commit -m "refactor(audit): add barrel export for cleaner component imports"
```

---

## Phase 4: Edge Cases & Robustness (1 semaine)

**Objectif**: Améliorer la gestion des cas limites et la robustesse.

### ✅ [EDGE-1] Ajouter warning pour impact values inconnus

**Priorité**: P1 (Important)
**Effort**: 15 min

**Fichier**: `components/platform-row.tsx`

```diff
+ import { LoggerService } from '../../../../common/logger';

  const IMPACT_VALUE: Record<string, 1 | 2 | 3 | 4 | 5> = {
    high: 5,
    medium: 3,
    low: 1,
  };

  export function PlatformRow({ platform }: PlatformRowProps): React.JSX.Element {
+   const impactValue = IMPACT_VALUE[platform.impact];
+   if (!impactValue) {
+     console.warn(
+       `[PlatformRow] Unknown impact value: "${platform.impact}" for platform "${platform.platform}". Defaulting to 3.`
+     );
+   }

    return (
      // ...
-     <ImpactDots value={IMPACT_VALUE[platform.impact] ?? 3} label="Impact" />
+     <ImpactDots value={impactValue ?? 3} label="Impact" />
```

---

### ✅ [EDGE-2] Gérer CompetitorBenchmark avec 3+ competitors

**Priorité**: P2 (Nice to have)
**Effort**: 1 heure

**Fichier**: `competitor-benchmark.tsx`

**Option 1**: Logger warning si > 2 competitors
```tsx
if (benchmark.competitors.length > 2) {
  console.warn(
    `[CompetitorBenchmark] ${benchmark.competitors.length} competitors found, but only 2 will be displayed in comparison table.`
  );
}
```

**Option 2**: Rendre la table dynamique (plus complexe)

---

### ✅ [EDGE-3] Ajouter wrap={false} sur cards critiques

**Priorité**: P2 (Nice to have)
**Effort**: 30 min

Ajouter `wrap={false}` sur:
- `BrutalScoreBlock` (geo-score-detail.tsx)
- `FindingCard` (✅ déjà fait)
- `ActionCard` (à faire)
- `CompetitorCard` (à faire)

---

### ✅ [EDGE-4] Gérer brandName très long

**Priorité**: P2 (Nice to have)
**Effort**: 30 min

**Fichier**: `cover-page.tsx`

Si brandName > 30 caractères, réduire fontSize ou tronquer:

```diff
  <Text
    style={{
      fontFamily: theme.fonts.mono,
-     fontSize: theme.fontSize['4xl'],
+     fontSize: brandName.length > 30 ? theme.fontSize['3xl'] : theme.fontSize['4xl'],
      fontWeight: 700,
      color: theme.colors.accent,
      lineHeight: 1.1,
      letterSpacing: -1,
    }}
+   numberOfLines={2}
  >
    {brandName}
  </Text>
```

---

### ✅ [EDGE-5] Tester avec datasets extrêmes

**Priorité**: P1 (Important)
**Effort**: 3-4 heures

Créer fixtures de test avec:
- **Empty dataset**: 0 actions, 0 findings, 0 competitors, 0 gaps
- **Minimal dataset**: 1 action, 1 finding, 1 competitor
- **Maximal dataset**: 50 actions, 100 findings, 5 competitors, 20 gaps
- **Edge values**: score=0, score=100, brandName très long, URLs très longues

Générer PDF avec chaque fixture et vérifier:
- ✅ Pas de crash
- ✅ Rendering correct
- ✅ Pas de page breaks mal placés
- ✅ Taille < 5 MB

---

## Phase 5: Performance (3-4 jours)

**Objectif**: Optimiser le rendering et réduire la taille du PDF.

### ✅ [PERF-1] Profiler rendering time

**Priorité**: P2 (Nice to have)
**Effort**: 1-2 heures

**Fichier**: `react-pdf.adapter.ts`

Ajouter logging détaillé par section:

```tsx
const start = Date.now();

const pdfBuffer = await renderToBuffer(
  <AuditReportDocument analysis={analysis} brand={brand} />,
);

const renderMs = Date.now() - start;

this.logger.info('PDF rendered', {
  auditOrderId: auditOrder.id,
  sizeBytes: pdfBuffer.length,
  renderMs,
  avgPerPage: renderMs / 8, // 8 pages environ
});
```

**Identifier**:
- Quelle section prend le plus de temps ?
- BrutalGrid a quel impact ?

---

### ✅ [PERF-2] Optimiser BrutalGrid

**Priorité**: P2 (Nice to have)
**Effort**: 2-3 heures

**Options**:

**Option 1**: Réduire nombre de lignes
```diff
- columns = 12,
- rows = 20,
+ columns = 6,
+ rows = 10,
```

**Option 2**: Utiliser SVG pattern au lieu de lignes individuelles
```tsx
<Svg>
  <Defs>
    <Pattern id="grid" width={columnWidth} height={rowHeight}>
      <Line ... />
    </Pattern>
  </Defs>
  <Rect fill="url(#grid)" width={pageWidth} height={pageHeight} />
</Svg>
```

**Option 3**: Rendre optionnel avec env variable
```tsx
const showGrid = process.env.PDF_DEBUG_GRID === 'true';

{showGrid && <BrutalGrid variant="subtle" />}
```

**Tester l'impact**:
- Mesurer renderMs avant/après
- Si gain < 10%, ne pas optimiser (premature optimization)

---

### ✅ [PERF-3] Auditer font weights utilisés

**Priorité**: P2 (Nice to have)
**Effort**: 1-2 heures

**Steps**:

1. Grep tous les fontWeight utilisés:
```bash
grep -r "fontWeight" apps/api/src/modules/audit/infrastructure/pdf/components/
```

2. Identifier quels poids sont réellement utilisés:
- 400 (normal) → Utilisé ?
- 500 (medium) → Utilisé ?
- 600 (semibold) → Utilisé ?
- 700 (bold) → Utilisé ?

3. Supprimer poids inutilisés de theme.ts

**Example**: Si seulement 400 et 700 utilisés, supprimer 500 et 600:
```diff
  Font.register({
    family: 'Bricolage Grotesque',
    fonts: [
      {
        src: path.join(bricolageBase, 'files/bricolage-grotesque-latin-400-normal.woff'),
        fontWeight: 400,
      },
-     {
-       src: path.join(bricolageBase, 'files/bricolage-grotesque-latin-500-normal.woff'),
-       fontWeight: 500,
-     },
-     {
-       src: path.join(bricolageBase, 'files/bricolage-grotesque-latin-600-normal.woff'),
-       fontWeight: 600,
-     },
      {
        src: path.join(bricolageBase, 'files/bricolage-grotesque-latin-700-normal.woff'),
        fontWeight: 700,
      },
    ],
  });
```

**Économie estimée**: ~100-200 KB si 2 poids supprimés

---

## Phase 6: Documentation & Polish (2-3 jours)

**Objectif**: Améliorer la documentation et la developer experience.

### ✅ [DOC-1] Ajouter JSDoc sur tous les primitives

**Priorité**: P2 (Nice to have)
**Effort**: 2-3 heures

Composants à documenter (17):
- ✅ BrutalGrid (déjà fait)
- ✅ TypeSlab (déjà fait)
- ✅ DataSlab (déjà fait)
- ✅ MetricHero (à faire)
- ScoreCircle (à faire)
- ProgressBar (à faire)
- ImpactDots (à faire)
- CategoryBadge (à faire)
- PlatformRow (à faire)
- FindingCard (à faire)
- ActionCard (à faire)
- CompetitorCard (à faire)
- PageFooter (à faire)
- SectionHeader (à faire)

**Template JSDoc**:
```tsx
/**
 * [ComponentName] - [One-line description]
 *
 * [Longer description explaining purpose and usage]
 *
 * @param prop1 - Description of prop1
 * @param prop2 - Description of prop2
 *
 * @example
 * ```tsx
 * <ComponentName prop1="value" prop2={42} />
 * ```
 */
```

---

### ✅ [DOC-2] Créer CONTRIBUTING.md pour PDF

**Priorité**: P2 (Nice to have)
**Effort**: 2-3 heures

**Créer**: `apps/api/src/modules/audit/infrastructure/pdf/CONTRIBUTING.md`

**Contenu**:
```markdown
# Contributing to PDF Audit System

## Architecture Overview
[Expliquer structure: pages, primitives, theme]

## Design Principles
- Brutalism: Angular, no border-radius, high contrast
- Typography: Massive type (7xl), mono for data
- Asymmetric layouts: 70/30, 60/40 splits
- Intentional overflow: Elements can break margins

## Code Standards
- Always use theme.colors.*, never hardcoded hex
- Always use theme.fontSize.*, never numbers
- TypeScript strict mode
- JSDoc on all components

## Adding a New Section
1. Create page component in components/[name].tsx
2. Import in audit-report.document.tsx
3. Use SectionHeader, PageFooter for consistency
4. Test with edge cases (empty data, long strings)

## Testing
[Guide pour tester PDF avec fixtures]

## Performance
- Keep SVG complexity low
- Use wrap={false} on cards
- Monitor renderMs in logs
```

---

## 📝 Checklist de Vérification Finale

Après avoir complété toutes les phases, vérifier:

### Code Quality
- [ ] Aucun import de `styles.ts` (legacy supprimé)
- [ ] Aucun hardcoded hex color (tous utilisent theme.colors.*)
- [ ] Tous les composants primitifs sont extraits (no internal components)
- [ ] Tous les composants ont JSDoc
- [ ] Footer et SectionHeader standardisés

### Functionality
- [ ] PDF se génère sans erreur avec datasets vides
- [ ] PDF se génère sans erreur avec datasets maximaux
- [ ] Edge cases gérés (totalActions=0, competitors>2, etc.)
- [ ] Warnings logged pour valeurs inconnues

### Performance
- [ ] renderMs < 5000ms pour PDF moyen
- [ ] PDF size < 3 MB pour rapport moyen (marge pour 5 MB limit)
- [ ] Font weights inutilisés supprimés

### Documentation
- [ ] theme.ts documenté comme source unique de vérité
- [ ] CONTRIBUTING.md créé
- [ ] JSDoc sur tous les primitives

---

## 🎯 Prochaines Étapes Recommandées

**Minimum viable (3-4 jours)**:
1. ✅ Phase 1: Quick Wins
2. ✅ Phase 2: Migration Legacy

**Recommandé (2-3 semaines)**:
1. ✅ Phase 1: Quick Wins
2. ✅ Phase 2: Migration Legacy
3. ✅ Phase 3: Extraction Composants
4. ✅ Phase 4: Edge Cases

**Complet (3-4 semaines)**:
- Toutes les phases

---

**Questions ou blocages ?**
- Review cette doc avec l'équipe
- Prioriser selon business needs
- Itérer par phase (ship early, ship often)

*Plan créé le 14 février 2026 par Claude Sonnet 4.5*

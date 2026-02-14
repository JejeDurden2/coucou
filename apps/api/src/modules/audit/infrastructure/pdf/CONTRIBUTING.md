# Contributing to PDF Audit System

This guide helps you understand and contribute to the PDF generation system for Coucou IA audit reports.

---

## 📐 Architecture Overview

The PDF system uses `@react-pdf/renderer` with a **brutalist design approach**. It's organized into 3 layers:

### 1. **Pages** (8 components)
Full-page sections that compose the final PDF:
- `cover-page.tsx` - Hero avec score GEO
- `executive-summary.tsx` - Résumé exécutif
- `geo-score-detail.tsx` - Décomposition des scores
- `site-audit.tsx` - Constats techniques
- `external-presence.tsx` - Présence sur plateformes externes
- `competitor-benchmark.tsx` - Analyse concurrentielle
- `action-plan.tsx` - Plan d'actions prioritaires
- `cta-page.tsx` - Closing CTA

### 2. **Primitives** (17+ components)
Composants réutilisables pour construire les pages:

**Layout & Structure**:
- `BrutalGrid` - Grille technique visible
- `DataSlab` - Bloc de données dense
- `MetricHero` - Métrique full-width massive
- `PageFooter` - Footer standardisé
- `SectionHeader` - Header de section
- `TypeSlab` - Typographie architecturale

**Cards**:
- `FindingCard` - Carte de constat technique
- `ActionCard` - Carte d'optimisation
- `CompetitorCard` - Carte de concurrent

**Indicators**:
- `ScoreCircle` - Indicateur circulaire de score
- `ProgressBar` - Barre de progression massive
- `ImpactDots` - Indicateur 1-5 dots
- `CategoryBadge` - Badge de catégorie
- `SeverityBadge` - Badge de sévérité
- `PlatformRow` - Ligne de tableau

### 3. **Theme System** (`theme.ts`)
Source unique de vérité pour:
- Colors (brutalist dark palette)
- Fonts (Fraunces display, Bricolage Grotesque body/mono)
- Font sizes (8-scale de `tiny` à `7xl`)
- Spacing (8px grid system)
- Base styles (page, card, footer, brutal styles)

---

## 🎨 Design Principles

### Brutalism Core

**Angular, Not Rounded**:
- ❌ NO `borderRadius` (sauf si explicitement demandé)
- ✅ Coins angulaires, géométrie stricte
- ✅ Bordures épaisses (`borderLeftWidth: 5`)

**Massive Typography**:
- Titres en `fontSize['4xl']` à `['7xl']` (48-96pt)
- Mono font pour données et chiffres
- `letterSpacing: -1` ou `-2` pour titres massifs
- `lineHeight: 0.9` à `1.1` pour typographie dense

**High Contrast**:
- Fond sombre (`bgPrimary: #09090B`)
- Texte blanc pur (`brutalWhite: #FFFFFF`)
- Couleurs accent saturées (`accent: #8B5CF6`)

**Asymmetric Layouts**:
- Layouts 70/30, 60/40 (jamais 50/50)
- Grille 6-colonnes (optimisée performance, anciennement 12)
- Full bleed effects (`marginHorizontal: -40`)

**Intentional Overflow**:
- Éléments peuvent déborder des marges
- Grille technique visible en arrière-plan
- Éléments cassent intentionnellement la grille

---

## 💻 Code Standards

### Always Use Theme Tokens

✅ **DO**:
```tsx
<Text style={{
  fontFamily: theme.fonts.mono,
  fontSize: theme.fontSize.base,
  color: theme.colors.accent,
}}>
```

❌ **DON'T**:
```tsx
<Text style={{
  fontFamily: 'Bricolage Grotesque',
  fontSize: 16,
  color: '#8B5CF6',
}}>
```

### TypeScript Strict Mode

- Explicit return types on functions
- No `any` (use `unknown` + type guards)
- Import types from `@coucou-ia/shared`

### JSDoc on All Components

```tsx
/**
 * ComponentName - One-line description
 *
 * Longer description explaining purpose and usage.
 *
 * @param prop1 - Description of prop1
 * @param prop2 - Description of prop2
 *
 * @example
 * ```tsx
 * <ComponentName prop1="value" prop2={42} />
 * ```
 */
export function ComponentName({ ... }) { ... }
```

### File Naming

- Kebab-case: `competitor-card.tsx`
- Component name = PascalCase: `CompetitorCard`
- One component per file

---

## 🛠️ Adding a New Section

### 1. Create Page Component

```tsx
// apps/api/src/modules/audit/infrastructure/pdf/components/my-new-section.tsx
import { Page, View, Text } from '@react-pdf/renderer';
import type { AuditAnalysis } from '@coucou-ia/shared';

import { theme, baseStyles } from '../theme';
import { BrutalGrid } from './brutal-grid';
import { PageFooter } from './page-footer';
import { SectionHeader } from './section-header';

interface MyNewSectionProps {
  data: AuditAnalysis['someData'];
}

export function MyNewSection({ data }: MyNewSectionProps): React.JSX.Element {
  return (
    <Page size="A4" style={baseStyles.page} wrap>
      <BrutalGrid variant="subtle" />
      <SectionHeader title="MA NOUVELLE SECTION" />

      {/* Your content here */}

      <PageFooter left="COUCOU IA" right="MA SECTION" />
    </Page>
  );
}
```

### 2. Import in Main Document

```tsx
// apps/api/src/modules/audit/infrastructure/pdf/audit-report.document.tsx
import { MyNewSection } from './components/my-new-section';

function AuditReportDocument({ analysis, brand }: AuditReportProps) {
  return (
    <Document>
      {/* ... existing pages ... */}
      <MyNewSection data={analysis.someData} />
    </Document>
  );
}
```

### 3. Test with Edge Cases

- ✅ Empty data (`data.items.length === 0`)
- ✅ Very long strings (titles > 100 chars)
- ✅ Maximum data (50+ items)
- ✅ Missing optional fields

---

## 🧪 Testing

### Manual Testing

Generate test PDF:
```bash
# Via API endpoint (requires running server)
curl -X POST http://localhost:3001/api/audits/:id/report

# Check logs for performance metrics
# Look for: "PDF rendered successfully" with renderMs and sizeMb
```

### Edge Case Fixtures

Create test fixtures in `apps/api/src/modules/audit/__tests__/fixtures/`:

```ts
export const emptyAuditAnalysis: AuditAnalysis = {
  geoScore: { overall: 0, structure: 0, content: 0, technical: 0, externalPresence: 0 },
  siteAudit: { pages: [], globalFindings: [] },
  actionPlan: { totalActions: 0, quickWins: [], shortTerm: [], mediumTerm: [] },
  // ... minimal data
};

export const maximalAuditAnalysis: AuditAnalysis = {
  // ... 50+ actions, 100+ findings, 5 competitors
};
```

### Performance Benchmarks

Monitor these metrics in logs:
- **renderMs** < 5000ms (for average PDF)
- **sizeMb** < 3 MB (leaves margin for 5 MB limit)
- **avgMsPerPage** < 625ms (5000ms / 8 pages)

---

## ⚡ Performance Best Practices

### SVG Complexity

❌ **Avoid**:
```tsx
// 100+ individual Line elements
{Array.from({ length: 100 }).map((_, i) => <Line ... />)}
```

✅ **Prefer**:
```tsx
// Reduced grid density
<BrutalGrid columns={6} rows={10} /> // Default optimized values
```

### Page Breaks

Use `wrap={false}` on cards to prevent mid-card page breaks:

```tsx
<View style={{ ... }} wrap={false}>
  {/* Card content */}
</View>
```

### Font Loading

Only load font weights you use:
- ✅ Currently: Only `700` (bold) is used and loaded
- ❌ Don't register unused weights (400, 500, 600 removed for performance)

---

## 🐛 Common Pitfalls

### 1. Hardcoded Colors

❌ **Wrong**:
```tsx
fill="#8B5CF6"
```

✅ **Correct**:
```tsx
fill={theme.colors.accent}
```

### 2. Missing wrap={false}

Cards without `wrap={false}` can break mid-content across pages.

### 3. Forgetting Edge Cases

Always handle:
- Empty arrays (`items.length === 0`)
- Missing optional fields (`platform.status ?? 'N/A'`)
- Very long strings (use responsive font sizing)

### 4. Not Using Barrel Export

❌ **Wrong**:
```tsx
import { ScoreCircle } from './components/score-circle';
import { ProgressBar } from './components/progress-bar';
```

✅ **Correct**:
```tsx
import { ScoreCircle, ProgressBar } from './components';
```

---

## 📊 Performance Monitoring

Check logs after each PDF generation:

```json
{
  "message": "PDF rendered successfully",
  "auditOrderId": "uuid",
  "sizeBytes": 2456789,
  "sizeMb": "2.34 MB",
  "renderMs": 3421,
  "avgMsPerPage": 427,
  "estimatedPages": 8
}
```

**Red flags**:
- `renderMs` > 10000ms → Investigate complex components
- `sizeMb` > 4 MB → Check for unnecessary assets
- Warnings about unknown values → Update mappings

---

## 🎯 Checklist for Pull Requests

Before submitting:

- [ ] No hardcoded colors (use `theme.colors.*`)
- [ ] No hardcoded font sizes (use `theme.fontSize.*`)
- [ ] JSDoc added to new components
- [ ] Edge cases handled (empty data, long strings)
- [ ] `wrap={false}` on cards
- [ ] Tested with extreme datasets
- [ ] Performance metrics acceptable (< 5000ms, < 3 MB)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] Follows brutalist design principles

---

## 🤝 Getting Help

- **Theme questions**: Check `theme.ts` JSDoc
- **Component examples**: See existing primitives in `components/`
- **Performance issues**: Check logs, reduce SVG complexity
- **Design questions**: Review brutalist design principles above

---

**Happy coding! 🚀**

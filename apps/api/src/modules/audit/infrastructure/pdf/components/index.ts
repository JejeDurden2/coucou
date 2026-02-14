/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PDF COMPONENTS - BARREL EXPORT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Exports centralisés pour tous les composants PDF réutilisables.
 * Permet des imports propres et maintenables.
 *
 * @example
 * ```tsx
 * // Avant (imports multiples)
 * import { FindingCard } from './components/finding-card';
 * import { ActionCard } from './components/action-card';
 * import { BrutalGrid } from './components/brutal-grid';
 *
 * // Après (import groupé)
 * import { FindingCard, ActionCard, BrutalGrid } from './components';
 * ```
 */

// ═══════════════════════════════════════════════════════════════════════════
// PAGE COMPONENTS (8) - Sections complètes du PDF
// ═══════════════════════════════════════════════════════════════════════════
export { ActionPlanSection } from './action-plan';
export { CompetitorBenchmarkSection } from './competitor-benchmark';
export { CoverPage } from './cover-page';
export { CtaPage } from './cta-page';
export { ExecutiveSummary } from './executive-summary';
export { ExternalPresence } from './external-presence';
export { GeoScoreDetail } from './geo-score-detail';
export { SiteAudit } from './site-audit';

// ═══════════════════════════════════════════════════════════════════════════
// PRIMITIVE COMPONENTS (17+) - Blocs réutilisables
// ═══════════════════════════════════════════════════════════════════════════

// Cards
export { ActionCard } from './action-card';
export { CompetitorCard } from './competitor-card';
export { FindingCard } from './finding-card';

// Layout & Structure
export { BrutalGrid } from './brutal-grid';
export { DataSlab } from './data-slab';
export { MetricHero } from './metric-hero';
export { PageFooter } from './page-footer';
export { SectionHeader } from './section-header';
export { TypeSlab } from './type-slab';

// Indicators & Badges
export { CategoryBadge } from './category-badge';
export { ImpactDots } from './impact-dots';
export { ProgressBar } from './progress-bar';
export { ScoreCircle } from './score-circle';

// Assets
export { CoucouLogo } from '../assets/logo-svg';

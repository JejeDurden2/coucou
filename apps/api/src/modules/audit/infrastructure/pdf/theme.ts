import path from 'path';

import { Font, StyleSheet } from '@react-pdf/renderer';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THEME SYSTEM - PDF AUDIT (Source Unique de Vérité)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ⚠️  IMPORTANT : Ce fichier est la SOURCE UNIQUE DE VÉRITÉ pour le design system
 *     du PDF d'audit. Toute modification du style visuel doit passer par ici.
 *
 * Ce fichier définit :
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ • Fonts        : Fraunces (display), Bricolage Grotesque (body/mono)    │
 * │ • Colors       : Palette brutalist dark (bgPrimary, accent, semantic)   │
 * │ • Font Sizes   : Échelle de tiny (6pt) à 7xl (96pt) pour typo massive  │
 * │ • Spacing      : Système de grille 8px                                  │
 * │ • Base Styles  : Page, card, footer, styles brutalist                   │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * 📋 RÈGLES D'UTILISATION :
 *
 *   ✅ TOUJOURS utiliser theme.colors.*     (jamais de hardcoded hex #8B5CF6)
 *   ✅ TOUJOURS utiliser theme.fontSize.*   (jamais de numbers directs)
 *   ✅ TOUJOURS utiliser theme.fonts.*      (jamais de font names directs)
 *   ✅ TOUJOURS utiliser theme.spacing.*    (pour cohérence du grid 8px)
 *   ❌ NE JAMAIS créer de système parallèle (styles.ts a été supprimé)
 *   ❌ NE JAMAIS hardcoder des valeurs de style
 *
 * 📖 EXEMPLE D'USAGE :
 *
 *   ```tsx
 *   import { theme } from '../theme';
 *
 *   <Text style={{
 *     fontFamily: theme.fonts.mono,
 *     fontSize: theme.fontSize.base,
 *     color: theme.colors.accent,
 *     marginBottom: theme.spacing.gridUnit * 2, // 16px
 *   }}>
 *     Hello World
 *   </Text>
 *   ```
 *
 * 🎨 DIRECTION ESTHÉTIQUE : BRUTALIST MODERNE
 *
 *   • Typographie massive architecturale (sizes 7xl = 96pt)
 *   • Grilles techniques visibles en arrière-plan
 *   • Layouts asymétriques intentionnels (70/30, 60/40)
 *   • High contrast dark theme (bgPrimary #09090B)
 *   • No border-radius (coins angulaires brutaux)
 *   • Mono font pour toutes les données (Bricolage Grotesque)
 *
 * 🔧 MAINTENANCE :
 *
 *   Pour modifier le theme :
 *   1. Mettre à jour ce fichier uniquement
 *   2. Les changements se propagent automatiquement à tous les composants
 *   3. Tester avec `pnpm dev` pour vérifier le rendu PDF
 *
 * 📚 DOCUMENTATION COMPLÈTE :
 *   - Review : tasks/pdf-review-executive-summary.md
 *   - Plan d'action : tasks/pdf-improvements.md
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─── Font Registration ───────────────────────────────────────────────

const bricolageBase = path.dirname(
  require.resolve('@fontsource/bricolage-grotesque/package.json'),
);
const frauncesBase = path.dirname(
  require.resolve('@fontsource/fraunces/package.json'),
);

Font.register({
  family: 'Bricolage Grotesque',
  fonts: [
    {
      src: path.join(
        bricolageBase,
        'files/bricolage-grotesque-latin-400-normal.woff',
      ),
      fontWeight: 400,
    },
    {
      src: path.join(
        bricolageBase,
        'files/bricolage-grotesque-latin-500-normal.woff',
      ),
      fontWeight: 500,
    },
    {
      src: path.join(
        bricolageBase,
        'files/bricolage-grotesque-latin-600-normal.woff',
      ),
      fontWeight: 600,
    },
    {
      src: path.join(
        bricolageBase,
        'files/bricolage-grotesque-latin-700-normal.woff',
      ),
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: 'Fraunces',
  fonts: [
    {
      src: path.join(frauncesBase, 'files/fraunces-latin-500-normal.woff'),
      fontWeight: 500,
    },
    {
      src: path.join(frauncesBase, 'files/fraunces-latin-700-normal.woff'),
      fontWeight: 700,
    },
  ],
});

// ─── Theme Constants ─────────────────────────────────────────────────

export const theme = {
  colors: {
    // Backgrounds - Palette actuelle conservée
    bgPrimary: '#09090B',
    bgCard: '#18181B',
    bgCardHover: '#27272A',

    // Text - Palette actuelle conservée
    textPrimary: '#FAFAFA',
    textMuted: '#A1A1AA',

    // Accent - Palette actuelle conservée
    accent: '#8B5CF6',

    // Sémantiques - Palette actuelle conservée
    success: '#22C55E',
    destructive: '#EF4444',
    warning: '#FBBF24',

    // Bordures - Palette actuelle conservée
    border: '#27272A',

    // Nouveaux tokens brutalist
    brutalBlack: '#000000', // Noir pur pour contraste max
    brutalWhite: '#FFFFFF', // Blanc pur pour contraste max

    // Grilles techniques
    gridLine: '#27272A', // Lignes de grille subtiles
    gridLineHeavy: '#52525B', // Lignes de grille proéminentes
  },
  fonts: {
    display: 'Fraunces',
    body: 'Bricolage Grotesque',
    mono: 'Bricolage Grotesque', // Utiliser Bricolage pour data monospace-style
  },
  fontSize: {
    // Échelle étendue pour brutalisme (8pt → 96pt)
    tiny: 6, // Métadonnées ultra-small
    xs: 8,
    sm: 9,
    base: 11,
    lg: 14,
    xl: 18,
    '2xl': 24,
    '3xl': 28,
    '4xl': 36,
    '5xl': 48, // Headlines massifs
    '6xl': 64, // Titres brutaux
    '7xl': 96, // Typographie architecturale
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  spacing: {
    // Grid system pour brutalisme
    gridUnit: 8, // Unité de base 8px
    gridColumn: 60, // Largeur colonne dans grille 12-col
    gridGutter: 16, // Gouttière entre colonnes
  },
} as const;

// ─── Score Color Helper ──────────────────────────────────────────────

export function getScoreColor(score: number): string {
  if (score < 30) return theme.colors.destructive;
  if (score < 50) return theme.colors.warning;
  if (score < 70) return theme.colors.accent;
  return theme.colors.success;
}

// ─── Severity / Category Maps ────────────────────────────────────────

export const SEVERITY_COLORS: Record<string, string> = {
  critical: theme.colors.destructive,
  warning: theme.colors.warning,
  info: theme.colors.textMuted,
};

export const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Critique',
  warning: 'Attention',
  info: 'Info',
};

export const CATEGORY_LABELS: Record<string, string> = {
  structure: 'Structure',
  content: 'Contenu',
  technical: 'Technique',
  external_presence: 'Présence ext.',
};

// ─── Base Styles ─────────────────────────────────────────────────────

export const baseStyles = StyleSheet.create({
  page: {
    backgroundColor: theme.colors.bgPrimary,
    padding: 40,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.base,
    lineHeight: 1.6,
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize['2xl'],
    fontWeight: 700,
    marginBottom: 16,
    color: theme.colors.textPrimary,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginVertical: 12,
  },
  accentDivider: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.accent,
    marginVertical: 16,
    width: 60,
  },
  textMuted: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },

  // ─── Brutalist Styles ────────────────────────────────────────────────

  // Typographie massive pour titres brutaux
  brutalTitle: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize['7xl'],
    fontWeight: 700,
    lineHeight: 0.9,
    color: theme.colors.brutalWhite,
    letterSpacing: -2,
  },

  // Headline massif pour sections
  brutalHeadline: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSize['5xl'],
    fontWeight: 700,
    lineHeight: 1.1,
    color: theme.colors.textPrimary,
  },

  // Data monospace technique
  brutalData: {
    fontFamily: theme.fonts.mono,
    fontWeight: 700,
    letterSpacing: 0,
  },

  // Card sans border radius (angulaire)
  brutalCard: {
    backgroundColor: theme.colors.bgCard,
    padding: 16,
    marginBottom: 12,
  },

  // Grille technique visible
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

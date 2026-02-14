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
 * Affiche un finding d'audit avec severity, title, detail, et recommendation.
 * Utilise color-coding pour severity (critical=red, warning=amber, info=purple).
 * Bordure gauche épaisse (5px) colorée selon severity.
 *
 * @param finding - Constat technique avec severity, title, detail, recommendation
 *
 * @example
 * ```tsx
 * <FindingCard finding={{
 *   severity: 'critical',
 *   title: 'Balises meta manquantes',
 *   detail: 'La page n\'a pas de meta description',
 *   recommendation: 'Ajouter une meta description de 150-160 caractères'
 * }} />
 * ```
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
      {/* Severity label - monospace caps */}
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

      {/* Title - monospace bold */}
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

      {/* Detail - dense */}
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

      {/* Recommendation - arrow + monospace */}
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

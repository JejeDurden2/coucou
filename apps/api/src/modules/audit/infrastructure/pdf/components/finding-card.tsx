import { View, Text, Svg, Circle } from '@react-pdf/renderer';
import type { AnalysisFinding } from '@coucou-ia/shared';

import { theme, SEVERITY_COLORS, SEVERITY_LABELS } from '../theme';

interface FindingCardProps {
  finding: AnalysisFinding;
}

export function FindingCard({
  finding,
}: FindingCardProps): React.JSX.Element {
  const severityColor =
    SEVERITY_COLORS[finding.severity] ?? theme.colors.textMuted;
  const severityLabel =
    SEVERITY_LABELS[finding.severity] ?? finding.severity;

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgCard,
        padding: 10,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: severityColor,
      }}
      wrap={false}
    >
      {/* Severity label with dot prefix */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginBottom: 4,
        }}
      >
        <Svg width={6} height={6} viewBox="0 0 6 6">
          <Circle cx={3} cy={3} r={3} fill={severityColor} />
        </Svg>
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.xs,
            fontWeight: 700,
            color: severityColor,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {severityLabel}
        </Text>
      </View>

      {/* Title */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.base,
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
          fontSize: theme.fontSize.sm,
          color: theme.colors.textMuted,
          lineHeight: 1.4,
          marginBottom: 6,
        }}
      >
        {finding.detail}
      </Text>

      {/* Recommendation sub-block */}
      <View
        style={{
          backgroundColor: theme.colors.bgCardHover,
          padding: 8,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.xs,
            fontWeight: 700,
            color: theme.colors.textMuted,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 3,
          }}
        >
          RECOMMANDATION
        </Text>
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.sm,
            color: theme.colors.textPrimary,
            lineHeight: 1.4,
          }}
        >
          {finding.recommendation}
        </Text>
      </View>
    </View>
  );
}

import { View, Text } from '@react-pdf/renderer';
import type { AnalysisCompetitor } from '@coucou-ia/shared';

import { theme, baseStyles, getScoreColor } from '../theme';
import { ProgressBar } from './progress-bar';

interface CompetitorCardProps {
  competitor: AnalysisCompetitor;
}

const sectionLabel = {
  fontFamily: theme.fonts.mono,
  fontSize: theme.fontSize.xs,
  fontWeight: 700 as const,
  color: theme.colors.textMuted,
  textTransform: 'uppercase' as const,
  marginBottom: 4,
};

export function CompetitorCard({
  competitor,
}: CompetitorCardProps): React.JSX.Element {
  const scoreColor = getScoreColor(competitor.estimatedGeoScore);

  return (
    <View style={baseStyles.card} wrap={false}>
      {/* Header: name + score */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 4,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: theme.fonts.display,
              fontSize: theme.fontSize.lg,
              fontWeight: 700,
              color: theme.colors.textPrimary,
              marginBottom: 2,
            }}
          >
            {competitor.name}
          </Text>
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSize.sm,
              color: theme.colors.textMuted,
            }}
          >
            {competitor.domain}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.base,
            fontWeight: 700,
            color: scoreColor,
          }}
        >
          {`${competitor.estimatedGeoScore}/100`}
        </Text>
      </View>

      {/* Score progress bar */}
      <View style={{ marginBottom: 12 }}>
        <ProgressBar
          score={competitor.estimatedGeoScore}
          label=""
          size="slim"
          scoreFormat="raw"
        />
      </View>

      {/* Divider */}
      <View
        style={{
          borderBottomWidth: 0.5,
          borderBottomColor: theme.colors.border,
          marginBottom: 10,
        }}
      />

      {/* Forces */}
      {competitor.strengths.length > 0 && (
        <View style={{ marginBottom: 10 }}>
          <Text style={sectionLabel}>Forces</Text>
          {competitor.strengths.map((s, i) => (
            <Text
              key={`s-${i}`}
              style={{
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSize.sm,
                color: theme.colors.textPrimary,
                marginBottom: 2,
              }}
            >
              <Text style={{ color: theme.colors.accent }}>{'> '}</Text>
              {s}
            </Text>
          ))}
        </View>
      )}

      {/* Ce que vous pouvez exploiter */}
      {competitor.clientGaps.length > 0 && (
        <View style={{ marginBottom: 10 }}>
          <Text style={sectionLabel}>Ce que vous pouvez exploiter</Text>
          {competitor.clientGaps.map((g, i) => (
            <Text
              key={`g-${i}`}
              style={{
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSize.sm,
                color: theme.colors.textPrimary,
                marginBottom: 2,
              }}
            >
              <Text style={{ color: theme.colors.success }}>{'> '}</Text>
              {g}
            </Text>
          ))}
        </View>
      )}

      {/* Avantages présence externe */}
      {competitor.externalPresenceAdvantage.length > 0 && (
        <View>
          <Text style={sectionLabel}>Avantages pr{'\u00e9'}sence externe</Text>
          {competitor.externalPresenceAdvantage.map((a, i) => (
            <Text
              key={`a-${i}`}
              style={{
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSize.sm,
                color: theme.colors.textPrimary,
                marginBottom: 2,
              }}
            >
              <Text style={{ color: theme.colors.warning }}>{'! '}</Text>
              {a}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

import { Page, View, Text } from '@react-pdf/renderer';
import type { AuditAnalysis } from '@coucou-ia/shared';

import { theme, baseStyles, getScoreColor } from '../theme';
import { PageFooter } from './page-footer';
import { ScoreCircle } from './score-circle';
import { SectionHeader } from './section-header';

interface GeoScoreDetailProps {
  geoScore: AuditAnalysis['geoScore'];
}

interface ScoreCardProps {
  name: string;
  score: number;
  explanation: string;
}

function ScoreCard({
  name,
  score,
  explanation,
}: ScoreCardProps): React.JSX.Element {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = getScoreColor(clampedScore);

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgCard,
        borderRadius: 8,
        padding: 16,
      }}
      wrap={false}
    >
      {/* Header: dimension name + score */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 12,
            fontWeight: 700,
            color: theme.colors.textPrimary,
            textTransform: 'uppercase',
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 12,
            fontWeight: 700,
            color,
          }}
        >
          {clampedScore}/100
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 8,
          flexDirection: 'row',
          marginBottom: 10,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {clampedScore > 0 && (
          <View
            style={{
              flex: clampedScore,
              backgroundColor: color,
            }}
          />
        )}
        {clampedScore < 100 && (
          <View
            style={{
              flex: 100 - clampedScore,
              backgroundColor: theme.colors.bgCardHover,
            }}
          />
        )}
      </View>

      {/* Explanation text */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.sm,
          color: theme.colors.textMuted,
          lineHeight: 1.4,
        }}
      >
        {explanation}
      </Text>
    </View>
  );
}

export function GeoScoreDetail({
  geoScore,
}: GeoScoreDetailProps): React.JSX.Element {
  return (
    <Page size="A4" style={baseStyles.page} wrap>
      {/* Section Title */}
      <SectionHeader title="Score GEO Détaillé" />

      {/* Overall Score - centered, medium */}
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <ScoreCircle score={geoScore.overall} size="medium" label="GLOBAL" />
      </View>

      {/* 2x2 Grid — Row 1 */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <ScoreCard
            name="Structure"
            score={geoScore.structure}
            explanation={geoScore.structureExplanation}
          />
        </View>
        <View style={{ flex: 1 }}>
          <ScoreCard
            name="Contenu"
            score={geoScore.content}
            explanation={geoScore.contentExplanation}
          />
        </View>
      </View>

      {/* 2x2 Grid — Row 2 */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <View style={{ flex: 1 }}>
          <ScoreCard
            name="Technique"
            score={geoScore.technical}
            explanation={geoScore.technicalExplanation}
          />
        </View>
        <View style={{ flex: 1 }}>
          <ScoreCard
            name="Présence ext."
            score={geoScore.externalPresence}
            explanation={geoScore.externalPresenceExplanation}
          />
        </View>
      </View>

      {/* Footer */}
      <PageFooter section="Score GEO Détaillé" />
    </Page>
  );
}

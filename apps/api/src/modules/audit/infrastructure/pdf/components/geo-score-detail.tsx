import { Page, View, Text } from '@react-pdf/renderer';
import type { AuditAnalysis } from '@coucou-ia/shared';

import { theme, baseStyles } from '../theme';
import { ScoreCircle } from './score-circle';
import { ProgressBar } from './progress-bar';

interface GeoScoreDetailProps {
  geoScore: AuditAnalysis['geoScore'];
}

interface SubScoreCardProps {
  name: string;
  score: number;
  explanation: string;
}

function SubScoreCard({
  name,
  score,
  explanation,
}: SubScoreCardProps): React.JSX.Element {
  return (
    <View style={{ ...baseStyles.card, width: '48%' }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.display,
            fontSize: theme.fontSize.lg,
            fontWeight: 700,
            color: theme.colors.textPrimary,
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.sm,
            color: theme.colors.textMuted,
          }}
        >
          {score}/100
        </Text>
      </View>

      <ProgressBar score={score} label="" />

      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.sm,
          color: theme.colors.textMuted,
          lineHeight: 1.5,
          marginTop: 6,
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
      <Text style={baseStyles.sectionTitle}>Score GEO Détaillé</Text>

      {/* Overall Score */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <ScoreCircle score={geoScore.overall} size="medium" />
      </View>

      {/* 2x2 Grid — Row 1 */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <SubScoreCard
          name="Structure"
          score={geoScore.structure}
          explanation={geoScore.structureExplanation}
        />
        <SubScoreCard
          name="Contenu"
          score={geoScore.content}
          explanation={geoScore.contentExplanation}
        />
      </View>

      {/* 2x2 Grid — Row 2 */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <SubScoreCard
          name="Technique"
          score={geoScore.technical}
          explanation={geoScore.technicalExplanation}
        />
        <SubScoreCard
          name="Présence ext."
          score={geoScore.externalPresence}
          explanation={geoScore.externalPresenceExplanation}
        />
      </View>

      {/* Footer */}
      <View style={baseStyles.footer} fixed>
        <Text>Coucou IA</Text>
        <Text>Score GEO Détaillé</Text>
      </View>
    </Page>
  );
}

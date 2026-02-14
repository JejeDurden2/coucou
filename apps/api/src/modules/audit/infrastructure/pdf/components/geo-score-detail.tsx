import { Page, View, Text } from '@react-pdf/renderer';
import type { AuditAnalysis } from '@coucou-ia/shared';

import { theme, baseStyles, getScoreColor } from '../theme';
import { BrutalGrid } from './brutal-grid';
import { PageFooter } from './page-footer';
import { ScoreCircle } from './score-circle';
import { SectionHeader } from './section-header';

interface GeoScoreDetailProps {
  geoScore: AuditAnalysis['geoScore'];
}

interface BrutalScoreBlockProps {
  name: string;
  score: number;
  highlight?: boolean; // Un score en full bleed violet
  offset?: { x: number; y: number }; // Offset intentionnel
}

function BrutalScoreBlock({
  name,
  score,
  highlight = false,
  offset = { x: 0, y: 0 },
}: BrutalScoreBlockProps): React.JSX.Element {
  const color = getScoreColor(score);

  return (
    <View
      style={{
        backgroundColor: highlight ? theme.colors.accent : theme.colors.bgCard,
        padding: 16,
        marginLeft: offset.x,
        marginTop: offset.y,
        borderLeftWidth: 4,
        borderLeftColor: color,
      }}
      wrap={false}
    >
      {/* Label monospace */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.tiny,
          fontWeight: 700,
          color: highlight ? theme.colors.brutalWhite : theme.colors.textMuted,
          letterSpacing: 2,
          marginBottom: 8,
          textTransform: 'uppercase',
        }}
      >
        {name}
      </Text>

      {/* Score massif */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize['4xl'],
          fontWeight: 700,
          color: highlight ? theme.colors.brutalWhite : theme.colors.textPrimary,
          lineHeight: 1,
        }}
      >
        {score}
      </Text>

      {/* Barre verticale épaisse */}
      <View
        style={{
          width: 30,
          height: 80,
          backgroundColor: theme.colors.bgCardHover,
          marginTop: 12,
          position: 'relative',
        }}
      >
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${score}%`,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}

export function GeoScoreDetail({
  geoScore,
}: GeoScoreDetailProps): React.JSX.Element {
  return (
    <Page size="A4" style={baseStyles.page} wrap>
      {/* Grille technique 4x4 visible */}
      <BrutalGrid variant="heavy" />

      {/* Section Title */}
      <View style={{ marginBottom: 8 }}>
        <SectionHeader title="DÉTAIL SCORES" />
      </View>

      {/* Overall Score - décentré en haut à gauche */}
      <View style={{ alignItems: 'flex-start', marginBottom: 40, marginLeft: -10 }}>
        <ScoreCircle score={geoScore.overall} size="large" label="GLOBAL" />
      </View>

      {/* Grille 2x2 - containers fixes avec offsets subtils */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Structure - container fixe */}
        <View style={{ width: '48%' }}>
          <BrutalScoreBlock
            name="STRUCTURE"
            score={geoScore.structure}
            offset={{ x: 0, y: 0 }}
          />
        </View>

        {/* Contenu - container fixe avec offset léger */}
        <View style={{ width: '48%' }}>
          <BrutalScoreBlock
            name="CONTENU"
            score={geoScore.content}
            offset={{ x: 0, y: 5 }}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Technique - HIGHLIGHT avec background violet */}
        <View style={{ width: '48%' }}>
          <BrutalScoreBlock
            name="TECHNIQUE"
            score={geoScore.technical}
            highlight
            offset={{ x: 0, y: -5 }}
          />
        </View>

        {/* Présence externe - container fixe */}
        <View style={{ width: '48%' }}>
          <BrutalScoreBlock
            name="PRÉSENCE"
            score={geoScore.externalPresence}
            offset={{ x: 0, y: 8 }}
          />
        </View>
      </View>

      {/* Footer */}
      <PageFooter left="COUCOU IA" right="03" />
    </Page>
  );
}

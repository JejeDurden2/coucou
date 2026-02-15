import { Page, View, Text, Svg, Circle } from '@react-pdf/renderer';
import { Text as SvgText } from '@react-pdf/renderer';
import type { AuditAnalysis } from '@coucou-ia/shared';

import { theme, baseStyles, CATEGORY_LABELS } from '../theme';
import { BrutalGrid } from './brutal-grid';
import { PageFooter } from './page-footer';
import { ProgressBar } from './progress-bar';
import { SectionHeader } from './section-header';

interface ExecutiveSummaryProps {
  summary: AuditAnalysis['executiveSummary'];
  geoScore: AuditAnalysis['geoScore'];
}

const VERDICT_COLORS: Record<string, string> = {
  insuffisante: theme.colors.destructive,
  'à renforcer': theme.colors.warning,
  correcte: theme.colors.accent,
  excellente: theme.colors.success,
};

const FINDING_BORDER_COLORS = [
  theme.colors.destructive,
  theme.colors.warning,
  theme.colors.accent,
];

export function ExecutiveSummary({
  summary,
  geoScore,
}: ExecutiveSummaryProps): React.JSX.Element {
  const verdictColor =
    VERDICT_COLORS[summary.verdict] ?? theme.colors.textMuted;

  return (
    <Page size="A4" style={baseStyles.page} wrap>
      {/* Grille technique */}
      <BrutalGrid variant="subtle" />

      {/* Section Title */}
      <SectionHeader title="RÉSUMÉ EXÉCUTIF" />

      {/* Headline MASSIF en monospace - 70% width */}
      <View style={{ width: '70%', marginBottom: 32, backgroundColor: theme.colors.bgCard, paddingVertical: 12, paddingHorizontal: 16 }}>
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize['5xl'],
            fontWeight: 700,
            color: theme.colors.textPrimary,
            lineHeight: 1.1,
            letterSpacing: -1,
          }}
        >
          {summary.headline}
        </Text>
      </View>

      {/* Layout 3 colonnes inégales: 30% / 10% / 60% */}
      <View style={{ flexDirection: 'row', marginBottom: 24, gap: 8 }}>
        {/* Colonne 1 - Scores (30%) */}
        <View style={{ width: '30%' }}>
          <Text
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: theme.fontSize.tiny,
              color: theme.colors.textMuted,
              letterSpacing: 1.5,
              marginBottom: 12,
            }}
          >
            SCORES
          </Text>
          <View style={{ gap: 8 }}>
            <ProgressBar score={geoScore.structure} label={CATEGORY_LABELS['structure']} size="slim" scoreFormat="fraction" />
            <ProgressBar score={geoScore.content} label={CATEGORY_LABELS['content']} size="slim" scoreFormat="fraction" />
            <ProgressBar score={geoScore.technical} label={CATEGORY_LABELS['technical']} size="slim" scoreFormat="fraction" />
            <ProgressBar score={geoScore.externalPresence} label={CATEGORY_LABELS['external_presence']} size="slim" scoreFormat="fraction" />
          </View>
        </View>

        {/* Colonne 2 - Vide intentionnel (10%) */}
        <View style={{ width: '10%' }} />

        {/* Colonne 3 - Context (60%) */}
        <View style={{ width: '60%' }}>
          <Text
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: theme.fontSize.base,
              color: theme.colors.textPrimary,
              lineHeight: 1.4,
            }}
          >
            {summary.context}
          </Text>
        </View>
      </View>

      {/* Key Findings - monospace dense */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.xs,
          fontWeight: 700,
          color: theme.colors.textMuted,
          letterSpacing: 1.5,
          marginBottom: 12,
          textTransform: 'uppercase',
        }}
      >
        CONSTATS CLÉS
      </Text>

      {summary.keyFindings.map((finding, i) => {
        const borderColor = FINDING_BORDER_COLORS[i] ?? theme.colors.accent;
        return (
          <View
            key={`finding-${i}`}
            style={{
              backgroundColor: theme.colors.bgCard,
              padding: 12,
              marginBottom: 8,
              borderLeftWidth: 3,
              borderLeftColor: borderColor,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10,
            }}
            wrap={false}
          >
            {/* Cercle numéroté */}
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Circle cx={9} cy={9} r={9} fill={borderColor} />
              <SvgText
                x={9}
                y={13}
                style={{
                  fontSize: 10,
                  fontFamily: theme.fonts.mono,
                  fontWeight: 700,
                  fill: theme.colors.brutalWhite,
                  textAnchor: 'middle',
                }}
              >
                {String(i + 1)}
              </SvgText>
            </Svg>

            {/* Texte du constat */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: theme.fonts.mono,
                  fontSize: theme.fontSize.sm,
                  color: theme.colors.textPrimary,
                  lineHeight: 1.3,
                }}
              >
                {finding}
              </Text>
            </View>
          </View>
        );
      })}

      {/* Verdict badge pill compact */}
      <View
        style={{
          position: 'absolute',
          bottom: 60,
          right: 40,
          backgroundColor: verdictColor,
          paddingHorizontal: 16,
          paddingVertical: 6,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.base,
            fontWeight: 700,
            color: theme.colors.brutalWhite,
            textTransform: 'uppercase',
          }}
        >
          {summary.verdict}
        </Text>
      </View>

      {/* Footer */}
      <PageFooter section="RÉSUMÉ EXÉCUTIF" />
    </Page>
  );
}

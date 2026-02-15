import { Page, View, Text } from '@react-pdf/renderer';
import type { AuditAnalysis } from '@coucou-ia/shared';

import { theme, baseStyles } from '../theme';
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
  theme.colors.success,
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
      <View style={{ width: '70%', marginBottom: 32 }}>
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
            <ProgressBar score={geoScore.structure} label="STRUCT" />
            <ProgressBar score={geoScore.content} label="CONTENT" />
            <ProgressBar score={geoScore.technical} label="TECH" />
            <ProgressBar score={geoScore.externalPresence} label="EXTERN" />
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
        const shouldOverflow = i === 1; // Le 2ème finding déborde
        return (
          <View
            key={`finding-${i}`}
            style={{
              backgroundColor: theme.colors.bgCard,
              padding: 12,
              marginBottom: 8,
              borderLeftWidth: 3,
              borderLeftColor: FINDING_BORDER_COLORS[i] ?? theme.colors.accent,
              marginRight: shouldOverflow ? -60 : 0, // Déborde à droite
            }}
            wrap={false}
          >
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
        );
      })}

      {/* Verdict badge ÉNORME en overlap coin */}
      <View
        style={{
          position: 'absolute',
          bottom: 60,
          right: 20,
          backgroundColor: verdictColor,
          paddingHorizontal: 24,
          paddingVertical: 16,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.xl,
            fontWeight: 700,
            color: theme.colors.brutalWhite,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          {summary.verdict}
        </Text>
      </View>

      {/* Footer */}
      <PageFooter />
    </Page>
  );
}

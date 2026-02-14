import { Page, View, Text } from '@react-pdf/renderer';
import type { AuditAnalysis } from '@coucou-ia/shared';

import { theme, baseStyles } from '../theme';
import { ProgressBar } from './progress-bar';

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
      {/* Section Title */}
      <Text style={baseStyles.sectionTitle}>Résumé Exécutif</Text>

      {/* Headline card */}
      <View
        style={{
          ...baseStyles.card,
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.accent,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.lg,
            fontWeight: 700,
            color: theme.colors.textPrimary,
          }}
        >
          {summary.headline}
        </Text>
      </View>

      {/* Context */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.base,
          color: theme.colors.textPrimary,
          lineHeight: 1.6,
          marginBottom: 16,
        }}
      >
        {summary.context}
      </Text>

      {/* Sub-scores */}
      <View style={{ marginBottom: 16 }}>
        <ProgressBar score={geoScore.structure} label="Structure" />
        <ProgressBar score={geoScore.content} label="Contenu" />
        <ProgressBar score={geoScore.technical} label="Technique" />
        <ProgressBar
          score={geoScore.externalPresence}
          label="Présence ext."
        />
      </View>

      {/* Key Findings */}
      <Text
        style={{
          fontFamily: theme.fonts.display,
          fontSize: theme.fontSize.xl,
          fontWeight: 700,
          color: theme.colors.textPrimary,
          marginBottom: 12,
        }}
      >
        Constats clés
      </Text>

      {summary.keyFindings.map((finding, i) => (
        <View
          key={`finding-${i}`}
          style={{
            ...baseStyles.card,
            borderLeftWidth: 4,
            borderLeftColor:
              FINDING_BORDER_COLORS[i] ?? theme.colors.accent,
          }}
          wrap={false}
        >
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSize.base,
              color: theme.colors.textPrimary,
              lineHeight: 1.5,
            }}
          >
            {finding}
          </Text>
        </View>
      ))}

      {/* Verdict badge */}
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: verdictColor,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 6,
          marginTop: 8,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.base,
            fontWeight: 700,
            color: '#FFFFFF',
          }}
        >
          Visibilité {summary.verdict}
        </Text>
      </View>

      {/* Footer */}
      <View style={baseStyles.footer} fixed>
        <Text>Coucou IA</Text>
        <Text>Résumé Exécutif</Text>
      </View>
    </Page>
  );
}

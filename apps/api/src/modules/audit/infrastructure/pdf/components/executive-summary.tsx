import { Page, View, Text } from '@react-pdf/renderer';
import type { AuditResult } from '@coucou-ia/shared';

import { styles, COLORS, SPACING } from '../styles';
import { RadarChart } from './radar-chart';

interface ExecutiveSummaryProps {
  geoScore: AuditResult['geoScore'];
}

function ScoreCircle({ score }: { score: number }): React.JSX.Element {
  const color =
    score >= 70 ? COLORS.success : score >= 40 ? COLORS.warning : COLORS.error;

  return (
    <View
      style={{
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: color,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 36,
          fontFamily: 'Helvetica-Bold',
          color,
        }}
      >
        {score}
      </Text>
      <Text style={{ fontSize: 8, color: COLORS.gray400 }}>/100</Text>
    </View>
  );
}

export function ExecutiveSummary({
  geoScore,
}: ExecutiveSummaryProps): React.JSX.Element {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h2}>Synthèse exécutive</Text>

      {/* Score + Radar side by side */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          marginBottom: SPACING.lg,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 10,
              color: COLORS.gray400,
              marginBottom: SPACING.sm,
            }}
          >
            Score GEO global
          </Text>
          <ScoreCircle score={geoScore.overall} />
        </View>

        <RadarChart
          scores={{
            structure: geoScore.structure,
            content: geoScore.content,
            technical: geoScore.technical,
            competitive: geoScore.competitive,
          }}
          size={220}
        />
      </View>

      {/* Strengths & Weaknesses */}
      <View
        style={{
          flexDirection: 'row',
          gap: SPACING.md,
          marginBottom: SPACING.lg,
        }}
      >
        {/* Strengths */}
        <View style={{ ...styles.card, flex: 1 }}>
          <Text
            style={{
              ...styles.h3,
              color: COLORS.success,
              fontSize: 12,
            }}
          >
            Points forts
          </Text>
          {geoScore.mainStrengths.map((s, i) => (
            <View
              key={`strength-${i}`}
              style={{
                flexDirection: 'row',
                marginBottom: SPACING.xs,
              }}
            >
              <Text style={{ color: COLORS.success, marginRight: SPACING.xs }}>
                +
              </Text>
              <Text style={styles.body}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Weaknesses */}
        <View style={{ ...styles.card, flex: 1 }}>
          <Text
            style={{
              ...styles.h3,
              color: COLORS.error,
              fontSize: 12,
            }}
          >
            Points faibles
          </Text>
          {geoScore.mainWeaknesses.map((w, i) => (
            <View
              key={`weakness-${i}`}
              style={{
                flexDirection: 'row',
                marginBottom: SPACING.xs,
              }}
            >
              <Text style={{ color: COLORS.error, marginRight: SPACING.xs }}>
                -
              </Text>
              <Text style={styles.body}>{w}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Methodology */}
      <View style={styles.card}>
        <Text style={{ ...styles.h3, fontSize: 12 }}>Méthodologie</Text>
        <Text style={styles.body}>{geoScore.methodology}</Text>
      </View>

      <View style={styles.footer}>
        <Text>Coucou IA</Text>
        <Text>Synthèse exécutive</Text>
      </View>
    </Page>
  );
}

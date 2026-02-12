import { Page, View, Text } from '@react-pdf/renderer';
import type { CompetitorBenchmark } from '@coucou-ia/shared';

import { styles, COLORS, SPACING } from '../styles';

interface CompetitorBenchmarkSectionProps {
  competitors: CompetitorBenchmark[];
  brandName: string;
  brandScore: number;
}

function ScoreBadge({ score }: { score: number }): React.JSX.Element {
  const color =
    score >= 70 ? COLORS.success : score >= 40 ? COLORS.warning : COLORS.error;

  return (
    <Text
      style={{
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color,
      }}
    >
      {score}
    </Text>
  );
}

export function CompetitorBenchmarkSection({
  competitors,
  brandName,
  brandScore,
}: CompetitorBenchmarkSectionProps): React.JSX.Element {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h2}>Benchmark concurrents</Text>

      {/* Comparison table */}
      <View style={{ marginBottom: SPACING.lg }}>
        {/* Header */}
        <View style={styles.tableHeader}>
          <Text
            style={{
              width: '25%',
              fontSize: 9,
              fontFamily: 'Helvetica-Bold',
              color: COLORS.gray300,
            }}
          >
            Marque
          </Text>
          <Text
            style={{
              width: '15%',
              fontSize: 9,
              fontFamily: 'Helvetica-Bold',
              color: COLORS.gray300,
              textAlign: 'center',
            }}
          >
            Score GEO
          </Text>
          <Text
            style={{
              width: '30%',
              fontSize: 9,
              fontFamily: 'Helvetica-Bold',
              color: COLORS.gray300,
            }}
          >
            Forces
          </Text>
          <Text
            style={{
              width: '30%',
              fontSize: 9,
              fontFamily: 'Helvetica-Bold',
              color: COLORS.gray300,
            }}
          >
            Écarts client
          </Text>
        </View>

        {/* Brand row (highlighted) */}
        <View
          style={{
            ...styles.tableRow,
            backgroundColor: COLORS.backgroundCard,
            borderRadius: 4,
            paddingHorizontal: 4,
          }}
        >
          <View style={{ width: '25%' }}>
            <Text
              style={{
                fontSize: 9,
                fontFamily: 'Helvetica-Bold',
                color: COLORS.purpleLight,
              }}
            >
              {brandName}
            </Text>
            <Text style={{ fontSize: 7, color: COLORS.gray500 }}>
              (votre marque)
            </Text>
          </View>
          <View style={{ width: '15%', alignItems: 'center' }}>
            <ScoreBadge score={brandScore} />
          </View>
          <Text style={{ width: '30%', fontSize: 8, color: COLORS.gray400 }}>
            —
          </Text>
          <Text style={{ width: '30%', fontSize: 8, color: COLORS.gray400 }}>
            —
          </Text>
        </View>

        {/* Competitor rows */}
        {competitors.map((comp) => (
          <View key={comp.domain} style={styles.tableRow}>
            <View style={{ width: '25%' }}>
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: 'Helvetica-Bold',
                  color: COLORS.white,
                }}
              >
                {comp.name}
              </Text>
              <Text style={{ fontSize: 7, color: COLORS.gray500 }}>
                {comp.domain}
              </Text>
            </View>
            <View style={{ width: '15%', alignItems: 'center' }}>
              <ScoreBadge score={comp.geoScore} />
            </View>
            <View style={{ width: '30%' }}>
              {comp.strengths.slice(0, 3).map((s, i) => (
                <Text
                  key={`s-${i}`}
                  style={{ fontSize: 7, color: COLORS.gray300 }}
                >
                  {`• ${s}`}
                </Text>
              ))}
            </View>
            <View style={{ width: '30%' }}>
              {comp.clientGaps.slice(0, 3).map((g, i) => (
                <Text
                  key={`g-${i}`}
                  style={{ fontSize: 7, color: COLORS.warning }}
                >
                  {`• ${g}`}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text>Coucou IA</Text>
        <Text>Benchmark concurrents</Text>
      </View>
    </Page>
  );
}

import { Page, View, Text } from '@react-pdf/renderer';
import type { AuditAnalysis, AnalysisCompetitor } from '@coucou-ia/shared';

import { theme, baseStyles, getScoreColor } from '../theme';
import { BrutalGrid } from './brutal-grid';
import { CompetitorCard } from './competitor-card';
import { PageFooter } from './page-footer';
import { SectionHeader } from './section-header';

interface CompetitorBenchmarkProps {
  benchmark: AuditAnalysis['competitorBenchmark'];
  clientGeoScore: AuditAnalysis['geoScore'];
  clientName: string;
}

function ScoreCell({
  score,
  compareWith,
}: {
  score: number;
  compareWith?: number;
}): React.JSX.Element {
  const color =
    compareWith !== undefined
      ? score >= compareWith
        ? theme.colors.success
        : theme.colors.destructive
      : getScoreColor(score);

  return (
    <Text
      style={{
        fontFamily: theme.fonts.body,
        fontSize: theme.fontSize.base,
        fontWeight: 700,
        color,
        textAlign: 'center',
      }}
    >
      {score}
    </Text>
  );
}

function TableRow({
  label,
  clientScore,
  competitors,
  isComparisonRow,
}: {
  label: string;
  clientScore: number;
  competitors: AnalysisCompetitor[];
  isComparisonRow: boolean;
}): React.JSX.Element {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.colors.border,
      }}
    >
      {/* Label */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.sm,
          color: theme.colors.textMuted,
          width: '25%',
        }}
      >
        {label}
      </Text>

      {/* Client score (highlighted) */}
      <View
        style={{
          width: '25%',
          backgroundColor: theme.colors.bgCardHover,
          borderRadius: 4,
          paddingVertical: 4,
        }}
      >
        <ScoreCell score={clientScore} />
      </View>

      {/* Competitor scores */}
      {competitors.slice(0, 2).map((comp) => (
        <View key={comp.domain} style={{ width: '25%', paddingVertical: 4 }}>
          {isComparisonRow ? (
            <ScoreCell
              score={comp.estimatedGeoScore}
              compareWith={clientScore}
            />
          ) : (
            <Text
              style={{
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSize.sm,
                color: theme.colors.textMuted,
                textAlign: 'center',
              }}
            >
              —
            </Text>
          )}
        </View>
      ))}

      {/* Fill empty competitor columns if less than 2 */}
      {competitors.length < 2 && (
        <View style={{ width: '25%' }}>
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSize.sm,
              color: theme.colors.textMuted,
              textAlign: 'center',
            }}
          >
            —
          </Text>
        </View>
      )}
    </View>
  );
}

export function CompetitorBenchmarkSection({
  benchmark,
  clientGeoScore,
  clientName,
}: CompetitorBenchmarkProps): React.JSX.Element {
  const competitors = benchmark.competitors;

  // Warn if more than 2 competitors (table only shows 2)
  if (competitors.length > 2) {
    console.warn(
      `[CompetitorBenchmark] ${competitors.length} competitors found, but only 2 will be displayed in comparison table. All competitors will be shown in individual cards.`,
    );
  }

  return (
    <Page size="A4" style={baseStyles.page} wrap>
      {/* Grille technique */}
      <BrutalGrid variant="subtle" />

      {/* Section Title */}
      <SectionHeader title="BENCHMARK CONCURRENTIEL" />

      {/* Comparison table */}
      <View style={{ marginBottom: 20 }}>
        {/* Header row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.accent,
          }}
        >
          <Text style={{ width: '25%' }} />
          <Text
            style={{
              width: '25%',
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSize.sm,
              fontWeight: 700,
              color: theme.colors.accent,
              textAlign: 'center',
            }}
          >
            {clientName}
          </Text>
          {competitors.slice(0, 2).map((comp) => (
            <Text
              key={comp.domain}
              style={{
                width: '25%',
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSize.sm,
                fontWeight: 700,
                color: theme.colors.textPrimary,
                textAlign: 'center',
              }}
            >
              {comp.name}
            </Text>
          ))}
          {competitors.length < 2 && <View style={{ width: '25%' }} />}
        </View>

        {/* Score GEO row (comparison) */}
        <TableRow
          label="Score GEO"
          clientScore={clientGeoScore.overall}
          competitors={competitors}
          isComparisonRow
        />

        {/* Client-only dimension rows */}
        <TableRow
          label="Structure"
          clientScore={clientGeoScore.structure}
          competitors={competitors}
          isComparisonRow={false}
        />
        <TableRow
          label="Contenu"
          clientScore={clientGeoScore.content}
          competitors={competitors}
          isComparisonRow={false}
        />
        <TableRow
          label="Technique"
          clientScore={clientGeoScore.technical}
          competitors={competitors}
          isComparisonRow={false}
        />
        <TableRow
          label="Présence ext."
          clientScore={clientGeoScore.externalPresence}
          competitors={competitors}
          isComparisonRow={false}
        />
      </View>

      {/* Per-competitor cards */}
      {competitors.map((comp) => (
        <CompetitorCard key={comp.domain} competitor={comp} />
      ))}

      {/* Summary */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.base,
          color: theme.colors.textPrimary,
          lineHeight: 1.6,
          marginBottom: 16,
        }}
      >
        {benchmark.summary}
      </Text>

      {/* Key Gaps card */}
      {benchmark.keyGaps.length > 0 && (
        <View
          style={{
            ...baseStyles.card,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.accent,
          }}
          wrap={false}
        >
          <Text
            style={{
              fontFamily: theme.fonts.display,
              fontSize: theme.fontSize.lg,
              fontWeight: 700,
              color: theme.colors.textPrimary,
              marginBottom: 8,
            }}
          >
            Top 3 actions prioritaires vs concurrents
          </Text>
          {benchmark.keyGaps.map((gap, i) => (
            <Text
              key={`kg-${i}`}
              style={{
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSize.base,
                color: theme.colors.textPrimary,
                marginBottom: 4,
              }}
            >
              {`${i + 1}. ${gap}`}
            </Text>
          ))}
        </View>
      )}

      {/* Footer */}
      <PageFooter section="BENCHMARK CONCURRENTIEL" />
    </Page>
  );
}

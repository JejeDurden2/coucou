import { Page, View, Text } from '@react-pdf/renderer';
import type { AuditAnalysis } from '@coucou-ia/shared';

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

// ── Cell components ──────────────────────────────────────────

const cellText = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSize.sm,
  textAlign: 'center' as const,
};

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
    <Text style={{ ...cellText, fontSize: theme.fontSize.base, fontWeight: 700, color }}>
      {score}
    </Text>
  );
}

function BooleanCell({ value }: { value: boolean }): React.JSX.Element {
  return (
    <Text
      style={{
        ...cellText,
        fontSize: theme.fontSize.base,
        fontWeight: 700,
        color: value ? theme.colors.success : theme.colors.destructive,
      }}
    >
      {value ? '\u2713' : '\u2717'}
    </Text>
  );
}

function RatingCell({
  rating,
  count,
}: {
  rating: number | null;
  count: number | null;
}): React.JSX.Element {
  if (rating === null) {
    return <View />;
  }

  const display = count !== null ? `${rating}/5 (${count})` : `${rating}/5`;
  return (
    <Text style={{ ...cellText, fontWeight: 700, color: theme.colors.textPrimary }}>
      {display}
    </Text>
  );
}

function PercentCell({ value }: { value: number }): React.JSX.Element {
  return (
    <Text style={{ ...cellText, fontWeight: 700, color: getScoreColor(value) }}>
      {`${Math.round(value * 100)}%`}
    </Text>
  );
}

function EmptyCell(): React.JSX.Element {
  return <View />;
}

// ── Row component ────────────────────────────────────────────

function ComparisonRow({
  label,
  clientCell,
  competitorCells,
  emptyColumns,
}: {
  label: string;
  clientCell: React.JSX.Element;
  competitorCells: React.JSX.Element[];
  emptyColumns: number;
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
      <Text style={{ ...cellText, textAlign: 'left', color: theme.colors.textMuted, width: '25%' }}>
        {label}
      </Text>

      <View
        style={{
          width: '25%',
          backgroundColor: theme.colors.bgCardHover,
          borderRadius: 4,
          paddingVertical: 4,
        }}
      >
        {clientCell}
      </View>

      {competitorCells.map((cell, i) => (
        <View key={`comp-${i}`} style={{ width: '25%', paddingVertical: 4 }}>
          {cell}
        </View>
      ))}

      {Array.from({ length: emptyColumns }).map((_, i) => (
        <View key={`empty-${i}`} style={{ width: '25%', paddingVertical: 4 }}>
          <EmptyCell />
        </View>
      ))}
    </View>
  );
}

// ── Main section ─────────────────────────────────────────────

export function CompetitorBenchmarkSection({
  benchmark,
  clientGeoScore,
  clientName,
}: CompetitorBenchmarkProps): React.JSX.Element {
  const competitors = benchmark.competitors;
  const displayed = competitors.slice(0, 2);
  const emptyColumns = Math.max(0, 2 - displayed.length);
  const clientFd = benchmark.clientFactualData;

  if (competitors.length > 2) {
    console.warn(
      `[CompetitorBenchmark] ${competitors.length} competitors found, but only 2 will be displayed in comparison table. All competitors will be shown in individual cards.`,
    );
  }

  return (
    <Page size="A4" style={baseStyles.page} wrap>
      <BrutalGrid variant="subtle" />
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
          {displayed.map((comp) => (
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
          {emptyColumns > 0 && <View style={{ width: `${emptyColumns * 25}%` as `${number}%` }} />}
        </View>

        {/* Score GEO */}
        <ComparisonRow
          label="Score GEO estim\u00e9"
          clientCell={<ScoreCell score={clientGeoScore.overall} />}
          competitorCells={displayed.map((c) => (
            <ScoreCell
              key={c.domain}
              score={c.estimatedGeoScore}
              compareWith={clientGeoScore.overall}
            />
          ))}
          emptyColumns={emptyColumns}
        />

        {/* Schema.org */}
        <ComparisonRow
          label="Schema.org"
          clientCell={clientFd ? <BooleanCell value={clientFd.hasSchemaOrg} /> : <EmptyCell />}
          competitorCells={displayed.map((c) =>
            c.factualData ? (
              <BooleanCell key={c.domain} value={c.factualData.hasSchemaOrg} />
            ) : (
              <EmptyCell key={c.domain} />
            ),
          )}
          emptyColumns={emptyColumns}
        />

        {/* FAQ structurée */}
        <ComparisonRow
          label="FAQ structur\u00e9e"
          clientCell={clientFd ? <BooleanCell value={clientFd.hasFAQSchema} /> : <EmptyCell />}
          competitorCells={displayed.map((c) =>
            c.factualData ? (
              <BooleanCell key={c.domain} value={c.factualData.hasFAQSchema} />
            ) : (
              <EmptyCell key={c.domain} />
            ),
          )}
          emptyColumns={emptyColumns}
        />

        {/* Contenu auteur */}
        <ComparisonRow
          label="Contenu auteur"
          clientCell={clientFd ? <BooleanCell value={clientFd.hasAuthorInfo} /> : <EmptyCell />}
          competitorCells={displayed.map((c) =>
            c.factualData ? (
              <BooleanCell key={c.domain} value={c.factualData.hasAuthorInfo} />
            ) : (
              <EmptyCell key={c.domain} />
            ),
          )}
          emptyColumns={emptyColumns}
        />

        {/* Wikipedia */}
        <ComparisonRow
          label="Wikipedia"
          clientCell={clientFd ? <BooleanCell value={clientFd.wikipediaFound} /> : <EmptyCell />}
          competitorCells={displayed.map((c) =>
            c.factualData ? (
              <BooleanCell key={c.domain} value={c.factualData.wikipediaFound} />
            ) : (
              <EmptyCell key={c.domain} />
            ),
          )}
          emptyColumns={emptyColumns}
        />

        {/* Trustpilot */}
        <ComparisonRow
          label="Trustpilot"
          clientCell={
            clientFd ? (
              <RatingCell rating={clientFd.trustpilotRating} count={clientFd.trustpilotReviewCount} />
            ) : (
              <EmptyCell />
            )
          }
          competitorCells={displayed.map((c) =>
            c.factualData ? (
              <RatingCell
                key={c.domain}
                rating={c.factualData.trustpilotRating}
                count={c.factualData.trustpilotReviewCount}
              />
            ) : (
              <EmptyCell key={c.domain} />
            ),
          )}
          emptyColumns={emptyColumns}
        />

        {/* Citation rate IA */}
        <ComparisonRow
          label="Citation rate IA"
          clientCell={clientFd ? <PercentCell value={clientFd.citationRate} /> : <EmptyCell />}
          competitorCells={displayed.map((c) =>
            c.factualData ? (
              <PercentCell key={c.domain} value={c.factualData.citationRate} />
            ) : (
              <EmptyCell key={c.domain} />
            ),
          )}
          emptyColumns={emptyColumns}
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

      <PageFooter section="BENCHMARK CONCURRENTIEL" />
    </Page>
  );
}

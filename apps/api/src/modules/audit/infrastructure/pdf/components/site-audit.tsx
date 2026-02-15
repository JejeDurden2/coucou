import { Page, View, Text } from '@react-pdf/renderer';
import type { AuditAnalysis, AnalysisFinding } from '@coucou-ia/shared';

import { theme, baseStyles } from '../theme';
import { BrutalGrid } from './brutal-grid';
import { FindingCard } from './finding-card';
import { MetricHero } from './metric-hero';
import { PageFooter } from './page-footer';
import { SectionHeader } from './section-header';

interface SiteAuditProps {
  siteAudit: AuditAnalysis['siteAudit'];
}

const SEVERITY_ORDER: AnalysisFinding['severity'][] = [
  'critical',
  'warning',
  'info',
];

const PAGE_TYPE_LABELS: Record<string, string> = {
  homepage: 'HOME',
  about: 'À PROPOS',
  service: 'SERVICE',
  blog: 'BLOG',
  pricing: 'PRIX',
  faq: 'FAQ',
  legal: 'LÉGAL',
  contact: 'CONTACT',
  other: 'AUTRE',
};

function sortFindings(findings: AnalysisFinding[]): AnalysisFinding[] {
  return [...findings].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );
}

export function SiteAudit({
  siteAudit,
}: SiteAuditProps): React.JSX.Element {
  const { pages, globalFindings } = siteAudit;

  // Count total findings by severity
  const totalFindings = pages.reduce(
    (acc, p) => acc + p.findings.length,
    globalFindings.length,
  );
  const criticalCount = [
    ...globalFindings,
    ...pages.flatMap((p) => p.findings),
  ].filter((f) => f.severity === 'critical').length;

  return (
    <Page size="A4" style={baseStyles.page} wrap>
      {/* Grille technique */}
      <BrutalGrid variant="heavy" />

      {/* Section Title */}
      <View style={{ marginBottom: -4 }}>
        <SectionHeader title="AUDIT TECHNIQUE" />
      </View>

      {/* Metric Hero - Total findings */}
      <MetricHero
        value={totalFindings}
        label={`CONSTATS${criticalCount > 0 ? ` · ${criticalCount} CRITIQUES` : ''}`}
        variant={criticalCount > 0 ? 'destructive' : 'accent'}
      />

      {/* Global Findings - Layout 2 colonnes */}
      {globalFindings.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          {/* Section header avec règle */}
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: theme.fontSize.base,
                fontWeight: 700,
                color: theme.colors.destructive,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              PROBLÈMES GLOBAUX
            </Text>
            <View
              style={{
                width: 100,
                height: 3,
                backgroundColor: theme.colors.destructive,
              }}
            />
          </View>

          {/* 2 colonnes de findings */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {sortFindings(globalFindings).map((finding, i) => (
              <View key={`global-${i}`} style={{ width: '48%' }}>
                <FindingCard finding={finding} />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Par page - Layout editorial dense */}
      {pages.map((page, pageIdx) => {
        const allPageFindings = sortFindings(page.findings);
        if (allPageFindings.length === 0 && page.strengths.length === 0)
          return null;

        return (
          <View key={`page-${pageIdx}`} style={{ marginBottom: 16 }}>
            {/* En-tête de page - monospace avec barre */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
                gap: 8,
              }}
              wrap={false}
            >
              {/* Type badge - monospace brutal */}
              <View
                style={{
                  backgroundColor: theme.colors.accent,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{
                    fontFamily: theme.fonts.mono,
                    fontSize: theme.fontSize.tiny,
                    fontWeight: 700,
                    color: theme.colors.brutalWhite,
                    letterSpacing: 1,
                  }}
                >
                  {PAGE_TYPE_LABELS[page.type] ?? page.type}
                </Text>
              </View>

              {/* URL - monospace truncated */}
              <Text
                style={{
                  fontFamily: theme.fonts.mono,
                  fontSize: theme.fontSize.tiny,
                  color: theme.colors.textMuted,
                  flex: 1,
                }}
              >
                {page.url}
              </Text>
            </View>

            {/* Strengths - inline dense */}
            {page.strengths.length > 0 && (
              <View style={{ marginBottom: 6 }} wrap={false}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                  {page.strengths.map((strength, i) => (
                    <View
                      key={`strength-${pageIdx}-${i}`}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: theme.colors.bgCard,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: theme.fonts.mono,
                          fontSize: theme.fontSize.tiny,
                          color: theme.colors.success,
                          marginRight: 3,
                        }}
                      >
                        ✓
                      </Text>
                      <Text
                        style={{
                          fontFamily: theme.fonts.mono,
                          fontSize: theme.fontSize.tiny,
                          color: theme.colors.textMuted,
                        }}
                      >
                        {strength}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Findings en 2 colonnes */}
            {allPageFindings.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {allPageFindings.map((finding, i) => (
                  <View key={`page-${pageIdx}-finding-${i}`} style={{ width: '48%' }}>
                    <FindingCard finding={finding} />
                  </View>
                ))}
              </View>
            )}

            {/* Divider massif entre pages */}
            {pageIdx < pages.length - 1 && (
              <View
                style={{
                  height: 3,
                  backgroundColor: theme.colors.gridLine,
                  marginTop: 12,
                }}
              />
            )}
          </View>
        );
      })}

      {/* Footer */}
      <PageFooter section="AUDIT TECHNIQUE" />
    </Page>
  );
}

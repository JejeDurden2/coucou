import { Page, View, Text } from '@react-pdf/renderer';
import type { AuditAnalysis, AnalysisFinding } from '@coucou-ia/shared';

import { theme, baseStyles } from '../theme';
import { SeverityBadge } from './severity-badge';

interface SiteAuditProps {
  siteAudit: AuditAnalysis['siteAudit'];
}

const SEVERITY_ORDER: AnalysisFinding['severity'][] = [
  'critical',
  'warning',
  'info',
];

const PAGE_TYPE_LABELS: Record<string, string> = {
  homepage: 'Accueil',
  about: 'À propos',
  service: 'Service',
  blog: 'Blog',
  pricing: 'Tarifs',
  faq: 'FAQ',
  legal: 'Mentions légales',
  contact: 'Contact',
  other: 'Autre',
};

function sortFindings(findings: AnalysisFinding[]): AnalysisFinding[] {
  return [...findings].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );
}

function FindingItem({
  finding,
}: {
  finding: AnalysisFinding;
}): React.JSX.Element {
  return (
    <View
      style={{
        ...baseStyles.card,
        borderLeftWidth: 3,
        borderLeftColor:
          finding.severity === 'critical'
            ? theme.colors.destructive
            : finding.severity === 'warning'
              ? theme.colors.warning
              : theme.colors.textMuted,
      }}
      wrap={false}
    >
      {/* Header: badge + title */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 4,
        }}
      >
        <SeverityBadge severity={finding.severity} />
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.base,
            fontWeight: 700,
            color: theme.colors.textPrimary,
            flex: 1,
          }}
        >
          {finding.title}
        </Text>
      </View>

      {/* Detail */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.base,
          color: theme.colors.textPrimary,
          lineHeight: 1.5,
          marginBottom: 4,
        }}
      >
        {finding.detail}
      </Text>

      {/* Recommendation */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.sm,
          color: theme.colors.textMuted,
        }}
      >
        → {finding.recommendation}
      </Text>
    </View>
  );
}

export function SiteAudit({
  siteAudit,
}: SiteAuditProps): React.JSX.Element {
  const { pages, globalFindings } = siteAudit;

  return (
    <Page size="A4" style={baseStyles.page} wrap>
      {/* Section Title */}
      <Text style={baseStyles.sectionTitle}>Audit de Votre Site</Text>

      {/* Global Findings */}
      {globalFindings.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontFamily: theme.fonts.display,
              fontSize: theme.fontSize.xl,
              fontWeight: 700,
              color: theme.colors.textPrimary,
              marginBottom: 12,
            }}
          >
            Constats Généraux
          </Text>

          {sortFindings(globalFindings).map((finding, i) => (
            <FindingItem key={`global-${i}`} finding={finding} />
          ))}

          <View style={baseStyles.divider} />
        </View>
      )}

      {/* Per-page audits */}
      {pages.map((page, pageIdx) => (
        <View key={`page-${pageIdx}`} style={{ marginBottom: 16 }}>
          {/* Page header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}
            wrap={false}
          >
            {/* Page type badge */}
            <View
              style={{
                backgroundColor: theme.colors.bgCard,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: theme.fontSize.xs,
                  color: theme.colors.textMuted,
                }}
              >
                {PAGE_TYPE_LABELS[page.type] ?? page.type}
              </Text>
            </View>

            <Text
              style={{
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSize.sm,
                color: theme.colors.textMuted,
                flex: 1,
              }}
            >
              {page.url}
            </Text>
          </View>

          {/* Strengths */}
          {page.strengths.length > 0 && (
            <View style={{ marginBottom: 8 }} wrap={false}>
              <Text
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: theme.fontSize.base,
                  fontWeight: 600,
                  color: theme.colors.success,
                  marginBottom: 4,
                }}
              >
                Points forts
              </Text>
              {page.strengths.map((strength, i) => (
                <View
                  key={`strength-${pageIdx}-${i}`}
                  style={{
                    flexDirection: 'row',
                    marginBottom: 2,
                    paddingLeft: 4,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.success,
                      fontSize: theme.fontSize.base,
                      marginRight: 6,
                    }}
                  >
                    ✓
                  </Text>
                  <Text
                    style={{
                      fontFamily: theme.fonts.body,
                      fontSize: theme.fontSize.base,
                      color: theme.colors.textPrimary,
                      flex: 1,
                    }}
                  >
                    {strength}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Findings sorted by severity */}
          {page.findings.length > 0 &&
            sortFindings(page.findings).map((finding, i) => (
              <FindingItem
                key={`page-${pageIdx}-finding-${i}`}
                finding={finding}
              />
            ))}

          {/* Divider between pages */}
          {pageIdx < pages.length - 1 && <View style={baseStyles.divider} />}
        </View>
      ))}

      {/* Footer */}
      <View style={baseStyles.footer} fixed>
        <Text>Coucou IA</Text>
        <Text>Audit du Site</Text>
      </View>
    </Page>
  );
}

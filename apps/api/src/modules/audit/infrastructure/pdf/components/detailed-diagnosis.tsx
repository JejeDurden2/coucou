import { Page, View, Text } from '@react-pdf/renderer';
import type { PageAudit, Finding } from '@coucou-ia/shared';

import { styles, COLORS, SPACING, SEVERITY_COLORS } from '../styles';

interface DetailedDiagnosisProps {
  pages: PageAudit[];
}

type GroupedFindings = Record<string, Record<string, Finding[]>>;

function groupFindings(pages: PageAudit[]): GroupedFindings {
  const grouped: GroupedFindings = {};

  for (const page of pages) {
    for (const finding of page.findings) {
      if (!grouped[finding.category]) {
        grouped[finding.category] = {};
      }
      if (!grouped[finding.category][finding.severity]) {
        grouped[finding.category][finding.severity] = [];
      }
      grouped[finding.category][finding.severity].push(finding);
    }
  }

  return grouped;
}

const CATEGORY_LABELS: Record<string, string> = {
  structure: 'Structure',
  content: 'Contenu',
  technical: 'Technique',
  seo: 'SEO',
};

const SEVERITY_ORDER = ['critical', 'warning', 'info'] as const;

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Critique',
  warning: 'Attention',
  info: 'Info',
};

function SeverityBadge({
  severity,
}: {
  severity: string;
}): React.JSX.Element {
  return (
    <View
      style={{
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        backgroundColor: SEVERITY_COLORS[severity] ?? COLORS.gray500,
      }}
    >
      <Text
        style={{
          fontSize: 7,
          fontFamily: 'Helvetica-Bold',
          color: COLORS.white,
        }}
      >
        {SEVERITY_LABELS[severity] ?? severity}
      </Text>
    </View>
  );
}

export function DetailedDiagnosis({
  pages,
}: DetailedDiagnosisProps): React.JSX.Element {
  const grouped = groupFindings(pages);
  const categories = Object.keys(grouped);

  return (
    <Page size="A4" style={styles.page} wrap>
      <Text style={styles.h2}>Diagnostic détaillé</Text>

      <Text
        style={{
          ...styles.body,
          marginBottom: SPACING.lg,
          color: COLORS.gray400,
        }}
      >
        {`${pages.length} pages analysées`}
      </Text>

      {categories.map((category) => (
        <View key={category} style={{ marginBottom: SPACING.lg }} wrap={false}>
          <Text style={styles.h3}>
            {CATEGORY_LABELS[category] ?? category}
          </Text>

          {SEVERITY_ORDER.map((severity) => {
            const findings = grouped[category]?.[severity];
            if (!findings?.length) return null;

            return (
              <View key={`${category}-${severity}`}>
                {findings.map((finding, idx) => (
                  <View
                    key={`finding-${category}-${severity}-${idx}`}
                    style={{
                      ...styles.card,
                      borderLeftWidth: 3,
                      borderLeftColor:
                        SEVERITY_COLORS[severity] ?? COLORS.gray500,
                    }}
                    wrap={false}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: SPACING.xs,
                        gap: SPACING.sm,
                      }}
                    >
                      <SeverityBadge severity={severity} />
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: 'Helvetica-Bold',
                          color: COLORS.white,
                          flex: 1,
                        }}
                      >
                        {finding.title}
                      </Text>
                    </View>

                    <Text
                      style={{
                        ...styles.body,
                        marginBottom: SPACING.xs,
                      }}
                    >
                      {finding.detail}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 8,
                          fontFamily: 'Helvetica-Bold',
                          color: COLORS.purpleLight,
                          marginRight: SPACING.xs,
                        }}
                      >
                        Recommandation :
                      </Text>
                      <Text
                        style={{
                          fontSize: 8,
                          color: COLORS.gray300,
                          flex: 1,
                        }}
                      >
                        {finding.recommendation}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      ))}

      <View style={styles.footer} fixed>
        <Text>Coucou IA</Text>
        <Text>Diagnostic détaillé</Text>
      </View>
    </Page>
  );
}

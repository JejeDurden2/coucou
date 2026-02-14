import { Page, View, Text } from '@react-pdf/renderer';
import type { AuditAnalysis, AnalysisActionItem } from '@coucou-ia/shared';

import { theme, baseStyles } from '../theme';
import { ActionCard } from './action-card';
import { BrutalGrid } from './brutal-grid';
import { MetricHero } from './metric-hero';
import { PageFooter } from './page-footer';
import { SectionHeader } from './section-header';

interface ActionPlanSectionProps {
  actionPlan: AuditAnalysis['actionPlan'];
}

function ActionSection({
  title,
  actions,
  borderColor,
  titleColor,
}: {
  title: string;
  actions: AnalysisActionItem[];
  borderColor: string;
  titleColor: string;
}): React.JSX.Element | null {
  if (actions.length === 0) return null;

  const sortedActions = [...actions].sort((a, b) => b.impact - a.impact);

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Section header avec règle décorative */}
      <View style={{ marginBottom: 12 }}>
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.base,
            fontWeight: 700,
            color: titleColor,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <View
          style={{
            width: 80,
            height: 2,
            backgroundColor: borderColor,
          }}
        />
      </View>

      {/* Action cards en 2 colonnes */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {sortedActions.map((action, i) => (
          <View key={`action-${i}`} style={{ width: '48%' }}>
            <ActionCard action={action} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function ActionPlanSection({
  actionPlan,
}: ActionPlanSectionProps): React.JSX.Element {
  return (
    <Page size="A4" style={baseStyles.page} wrap>
      {/* Grille technique */}
      <BrutalGrid variant="subtle" />

      {/* Section Title */}
      <SectionHeader title="PLAN D'ACTION" />

      {/* Metric Hero - total actions */}
      <MetricHero
        value={actionPlan.totalActions}
        label="OPTIMISATIONS"
        variant="accent"
      />

      {/* Message positif si aucune action */}
      {actionPlan.totalActions === 0 && (
        <View
          style={{
            backgroundColor: theme.colors.success,
            padding: 20,
            marginVertical: 20,
          }}
        >
          <Text
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: theme.fontSize.base,
              color: theme.colors.brutalWhite,
              lineHeight: 1.5,
            }}
          >
            ✅ Excellent ! Votre site est déjà bien optimisé pour la visibilité
            IA. Aucune action critique identifiée.
          </Text>
        </View>
      )}

      {/* Quick Wins */}
      <ActionSection
        title="QUICK WINS — 1-2 SEMAINES"
        actions={actionPlan.quickWins}
        borderColor={theme.colors.success}
        titleColor={theme.colors.success}
      />

      {/* Court terme */}
      <ActionSection
        title="COURT TERME — 1-2 MOIS"
        actions={actionPlan.shortTerm}
        borderColor={theme.colors.accent}
        titleColor={theme.colors.accent}
      />

      {/* Moyen terme */}
      <ActionSection
        title="MOYEN TERME — 3-6 MOIS"
        actions={actionPlan.mediumTerm}
        borderColor={theme.colors.textMuted}
        titleColor={theme.colors.textMuted}
      />

      {/* Footer */}
      <PageFooter left="COUCOU IA" right="PLAN D'ACTION" />
    </Page>
  );
}

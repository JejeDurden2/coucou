import { Page, View, Text } from '@react-pdf/renderer';
import type { AuditAnalysis, AnalysisActionItem } from '@coucou-ia/shared';

import { theme, baseStyles } from '../theme';
import { ImpactDots } from './impact-dots';
import { CategoryBadge } from './category-badge';

interface ActionPlanSectionProps {
  actionPlan: AuditAnalysis['actionPlan'];
}

function ActionCard({
  action,
}: {
  action: AnalysisActionItem;
}): React.JSX.Element {
  return (
    <View style={baseStyles.card} wrap={false}>
      {/* Title */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.base,
          fontWeight: 700,
          color: theme.colors.textPrimary,
          marginBottom: 4,
        }}
      >
        {action.title}
      </Text>

      {/* Description */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.sm,
          color: theme.colors.textPrimary,
          lineHeight: 1.5,
          marginBottom: 4,
        }}
      >
        {action.description}
      </Text>

      {/* Target URL */}
      {action.targetUrl !== null && (
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.xs,
            color: theme.colors.textMuted,
            marginBottom: 8,
          }}
        >
          {action.targetUrl}
        </Text>
      )}

      {/* Bottom row: ImpactDots + CategoryBadge */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginTop: 4,
        }}
      >
        <ImpactDots value={action.impact} label="Impact" />
        <ImpactDots value={action.effort} label="Effort" />
        <CategoryBadge category={action.category} />
      </View>
    </View>
  );
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
    <View style={{ marginBottom: 16 }}>
      {/* Sub-section title with left border */}
      <View
        style={{
          borderLeftWidth: 4,
          borderLeftColor: borderColor,
          paddingLeft: 12,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.display,
            fontSize: theme.fontSize.xl,
            fontWeight: 700,
            color: titleColor,
          }}
        >
          {title}
        </Text>
      </View>

      {/* Action cards */}
      {sortedActions.map((action, i) => (
        <ActionCard key={`action-${i}`} action={action} />
      ))}
    </View>
  );
}

export function ActionPlanSection({
  actionPlan,
}: ActionPlanSectionProps): React.JSX.Element {
  return (
    <Page size="A4" style={baseStyles.page} wrap>
      {/* Section Title */}
      <Text style={baseStyles.sectionTitle}>{"Plan d'Action"}</Text>

      {/* Highlight counter */}
      <View
        style={{
          backgroundColor: `${theme.colors.accent}1A`,
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
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
          {`${actionPlan.totalActions} optimisations identifiées`}
        </Text>
      </View>

      {/* Quick Wins */}
      <ActionSection
        title="Quick Wins — 1 à 2 semaines"
        actions={actionPlan.quickWins}
        borderColor={theme.colors.success}
        titleColor={theme.colors.success}
      />

      {/* Court terme */}
      <ActionSection
        title="Court terme — 1 à 2 mois"
        actions={actionPlan.shortTerm}
        borderColor={theme.colors.accent}
        titleColor={theme.colors.accent}
      />

      {/* Moyen terme */}
      <ActionSection
        title="Moyen terme — 3 à 6 mois"
        actions={actionPlan.mediumTerm}
        borderColor={theme.colors.textMuted}
        titleColor={theme.colors.textMuted}
      />

      {/* Footer */}
      <View style={baseStyles.footer} fixed>
        <Text>Coucou IA</Text>
        <Text>{"Plan d'Action"}</Text>
      </View>
    </Page>
  );
}

import { Page, View, Text } from '@react-pdf/renderer';
import type { ActionItem } from '@coucou-ia/shared';

import { styles, COLORS, SPACING, PRIORITY_COLORS } from '../styles';

interface ActionPlanSectionProps {
  actionPlan: {
    quickWins: ActionItem[];
    shortTerm: ActionItem[];
    mediumTerm: ActionItem[];
  };
}

function ImpactEffortIndicator({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}): React.JSX.Element {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <View
          key={`dot-${i}`}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i < value ? color : '#2D2640',
          }}
        />
      ))}
    </View>
  );
}

function ActionCard({ action }: { action: ActionItem }): React.JSX.Element {
  const priorityColor = PRIORITY_COLORS[action.priority] ?? COLORS.gray400;

  return (
    <View
      style={{
        ...styles.card,
        borderLeftWidth: 3,
        borderLeftColor: priorityColor,
      }}
      wrap={false}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: SPACING.xs,
        }}
      >
        <Text
          style={{
            fontSize: 10,
            fontFamily: 'Helvetica-Bold',
            color: COLORS.white,
            flex: 1,
            marginRight: SPACING.sm,
          }}
        >
          {action.title}
        </Text>
        <View
          style={{
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 3,
            backgroundColor: priorityColor,
          }}
        >
          <Text
            style={{
              fontSize: 7,
              fontFamily: 'Helvetica-Bold',
              color: COLORS.white,
            }}
          >
            {action.priority}
          </Text>
        </View>
      </View>

      <Text
        style={{
          ...styles.body,
          marginBottom: SPACING.sm,
        }}
      >
        {action.description}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          gap: SPACING.lg,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 7,
              color: COLORS.gray500,
              marginBottom: 2,
            }}
          >
            Impact
          </Text>
          <ImpactEffortIndicator
            value={action.estimatedImpact}
            max={5}
            color={COLORS.success}
          />
        </View>
        <View>
          <Text
            style={{
              fontSize: 7,
              color: COLORS.gray500,
              marginBottom: 2,
            }}
          >
            Effort
          </Text>
          <ImpactEffortIndicator
            value={action.estimatedEffort}
            max={5}
            color={COLORS.warning}
          />
        </View>
      </View>
    </View>
  );
}

function ActionSection({
  title,
  actions,
}: {
  title: string;
  actions: ActionItem[];
}): React.JSX.Element | null {
  if (actions.length === 0) return null;

  return (
    <View style={{ marginBottom: SPACING.lg }}>
      <Text style={styles.h3}>{title}</Text>
      {actions.map((action) => (
        <ActionCard key={action.id} action={action} />
      ))}
    </View>
  );
}

export function ActionPlanSection({
  actionPlan,
}: ActionPlanSectionProps): React.JSX.Element {
  return (
    <Page size="A4" style={styles.page} wrap>
      <Text style={styles.h2}>{"Plan d'action"}</Text>

      <ActionSection title="Quick wins" actions={actionPlan.quickWins} />
      <ActionSection title="Court terme" actions={actionPlan.shortTerm} />
      <ActionSection title="Moyen terme" actions={actionPlan.mediumTerm} />

      <View style={styles.footer} fixed>
        <Text>Coucou IA</Text>
        <Text>{"Plan d'action"}</Text>
      </View>
    </Page>
  );
}

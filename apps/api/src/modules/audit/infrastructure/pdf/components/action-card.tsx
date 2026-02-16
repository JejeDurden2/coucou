import { View, Text } from '@react-pdf/renderer';
import type { AnalysisActionItem } from '@coucou-ia/shared';

import { theme } from '../theme';
import { CategoryBadge } from './category-badge';
import { ImpactDots } from './impact-dots';

interface ActionCardProps {
  action: AnalysisActionItem;
  index: number;
}

/**
 * ActionCard - Carte d'action d'optimisation numérotée
 *
 * Affiche une action avec numéro séquentiel, title, description,
 * URL cible optionnelle, impact/effort dots, et category badge.
 *
 * @param action - Action d'optimisation
 * @param index - Index global (0-based) pour numérotation continue
 */
export function ActionCard({
  action,
  index,
}: ActionCardProps): React.JSX.Element {
  const number = (index + 1).toString().padStart(2, '0');

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgCard,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.accent,
      }}
      wrap={false}
    >
      {/* Title row - number + title */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          marginBottom: 4,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.sm,
            fontWeight: 700,
            color: theme.colors.accent,
            marginRight: 8,
          }}
        >
          {number}
        </Text>
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.sm,
            fontWeight: 700,
            color: theme.colors.textPrimary,
            flex: 1,
          }}
        >
          {action.title}
        </Text>
      </View>

      {/* Description - dense */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.tiny,
          color: theme.colors.textMuted,
          lineHeight: 1.4,
          marginBottom: action.targetUrl ? 4 : 6,
        }}
      >
        {action.description}
      </Text>

      {/* Target URL - conditional */}
      {action.targetUrl && (
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.tiny,
            color: theme.colors.textMuted,
            marginBottom: 6,
          }}
        >
          Page cible : {action.targetUrl}
        </Text>
      )}

      {/* Bottom row compact */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <ImpactDots value={action.impact} label="Impact" />
        <ImpactDots value={action.effort} label="Effort" />
        <CategoryBadge category={action.category} />
      </View>
    </View>
  );
}

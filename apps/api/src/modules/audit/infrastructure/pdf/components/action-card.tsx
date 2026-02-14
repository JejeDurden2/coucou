import { View, Text } from '@react-pdf/renderer';
import type { AnalysisActionItem } from '@coucou-ia/shared';

import { theme } from '../theme';
import { CategoryBadge } from './category-badge';
import { ImpactDots } from './impact-dots';

interface ActionCardProps {
  action: AnalysisActionItem;
}

/**
 * ActionCard - Carte d'action d'optimisation
 *
 * Affiche une action d'optimisation avec title, description, impact, effort, et category.
 * Bordure gauche accent (3px), layout compact avec ImpactDots et CategoryBadge.
 *
 * @param action - Action d'optimisation avec title, description, impact, effort, category
 *
 * @example
 * ```tsx
 * <ActionCard action={{
 *   title: 'Optimiser les images',
 *   description: 'Compresser toutes les images pour améliorer Core Web Vitals',
 *   impact: 5,
 *   effort: 2,
 *   category: 'performance'
 * }} />
 * ```
 */
export function ActionCard({
  action,
}: ActionCardProps): React.JSX.Element {
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
      {/* Title - monospace */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.sm,
          fontWeight: 700,
          color: theme.colors.textPrimary,
          marginBottom: 4,
        }}
      >
        {action.title}
      </Text>

      {/* Description - dense */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.tiny,
          color: theme.colors.textMuted,
          lineHeight: 1.4,
          marginBottom: 6,
        }}
      >
        {action.description}
      </Text>

      {/* Bottom row compact */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <ImpactDots value={action.impact} label="IMP" />
        <ImpactDots value={action.effort} label="EFF" />
        <CategoryBadge category={action.category} />
      </View>
    </View>
  );
}

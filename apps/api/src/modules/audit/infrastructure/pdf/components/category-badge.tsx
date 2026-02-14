import { View, Text } from '@react-pdf/renderer';

import { theme, CATEGORY_LABELS } from '../theme';

interface CategoryBadgeProps {
  category: 'structure' | 'content' | 'technical' | 'external_presence';
}

/**
 * CategoryBadge - Minimalist bordered pill for audit category identification
 *
 * Renders a rectangular badge with subtle borders and muted typography for
 * categorizing audit sections. Uses theme-aware labels with clean, angular styling.
 * Designed for semantic grouping in brutalist PDF layouts.
 *
 * @param category - Audit category type: 'structure', 'content', 'technical', or 'external_presence'
 *
 * @example
 * ```tsx
 * <CategoryBadge category="technical" />
 * ```
 *
 * @example
 * ```tsx
 * <CategoryBadge category="external_presence" />
 * ```
 */
export function CategoryBadge({
  category,
}: CategoryBadgeProps): React.JSX.Element {
  const label = CATEGORY_LABELS[category] ?? category;

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgCard,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
        {label}
      </Text>
    </View>
  );
}

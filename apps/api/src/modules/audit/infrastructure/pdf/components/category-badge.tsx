import { View, Text } from '@react-pdf/renderer';

import { theme, CATEGORY_LABELS } from '../theme';

interface CategoryBadgeProps {
  category: 'structure' | 'content' | 'technical' | 'external_presence';
}

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

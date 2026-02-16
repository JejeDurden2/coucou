import { View, Text } from '@react-pdf/renderer';

import { theme } from '../theme';

interface ImpactDotsProps {
  value: 1 | 2 | 3 | 4 | 5;
  label: string;
}

/**
 * ImpactDots - Five-dot visual intensity indicator using Unicode characters
 *
 * Renders a compact row of five Unicode dots (● filled, ○ empty) for reliable
 * rendering in react-pdf. Uses accent color for filled dots, muted for empty.
 *
 * @param value - Intensity level from 1 (low) to 5 (high)
 * @param label - Descriptive text displayed before the dots (e.g., "Impact", "Effort")
 */
export function ImpactDots({
  value,
  label,
}: ImpactDotsProps): React.JSX.Element {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.xs,
          color: theme.colors.textMuted,
          marginRight: 2,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontFamily: theme.fonts.mono, fontSize: theme.fontSize.sm }}>
        {Array.from({ length: 5 }, (_, i) => (
          <Text
            key={`dot-${i}`}
            style={{
              color:
                i < value
                  ? theme.colors.accent
                  : theme.colors.bgCardHover,
            }}
          >
            {i < value ? '●' : '○'}
            {i < 4 ? ' ' : ''}
          </Text>
        ))}
      </Text>
    </View>
  );
}

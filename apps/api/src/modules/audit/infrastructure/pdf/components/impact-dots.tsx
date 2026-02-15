import { View, Text, Svg, Circle } from '@react-pdf/renderer';

import { theme } from '../theme';

interface ImpactDotsProps {
  value: 1 | 2 | 3 | 4 | 5;
  label: string;
}

/**
 * ImpactDots - Five-dot visual intensity indicator for brutalist layouts
 *
 * Renders a compact row of five circular dots where filled dots represent impact
 * intensity. Uses high-contrast accent color fills for clear data communication.
 * Ideal for quick-scan metrics in dense PDF reports.
 *
 * @param value - Impact level from 1 (low) to 5 (high), determines how many dots are filled
 * @param label - Descriptive text displayed before the dots (e.g., "Impact", "Priority")
 *
 * @example
 * ```tsx
 * <ImpactDots value={4} label="Impact" />
 * ```
 *
 * @example
 * ```tsx
 * <ImpactDots value={2} label="Priority" />
 * ```
 */
export function ImpactDots({
  value,
  label,
}: ImpactDotsProps): React.JSX.Element {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.sm,
          color: theme.colors.textMuted,
          marginRight: 4,
        }}
      >
        {label}
      </Text>
      <Svg width={70} height={10} viewBox="0 0 70 10">
        {Array.from({ length: 5 }, (_, i) => (
          <Circle
            key={`dot-${i}`}
            cx={5 + i * 14}
            cy={5}
            r={5}
            fill={
              i < value
                ? theme.colors.accent
                : theme.colors.bgCardHover
            }
          />
        ))}
      </Svg>
    </View>
  );
}

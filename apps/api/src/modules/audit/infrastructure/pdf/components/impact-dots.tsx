import { View, Text, Svg, Circle } from '@react-pdf/renderer';

import { theme } from '../theme';

interface ImpactDotsProps {
  value: 1 | 2 | 3 | 4 | 5;
  label: string;
}

/**
 * ImpactDots - Five-dot visual intensity indicator using SVG circles
 *
 * Renders a compact row of five SVG circles (filled/empty) that render
 * reliably in react-pdf without font glyph dependencies.
 *
 * @param value - Intensity level from 1 (low) to 5 (high)
 * @param label - Descriptive text displayed before the dots (e.g., "Impact", "Effort")
 */
export function ImpactDots({
  value,
  label,
}: ImpactDotsProps): React.JSX.Element {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
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
      {Array.from({ length: 5 }, (_, i) => (
        <Svg key={`dot-${i}`} width={8} height={8} viewBox="0 0 8 8">
          <Circle
            cx={4}
            cy={4}
            r={3.5}
            fill={i < value ? theme.colors.accent : theme.colors.bgCardHover}
          />
        </Svg>
      ))}
    </View>
  );
}

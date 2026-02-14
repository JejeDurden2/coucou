import { View, Text, Svg, Circle } from '@react-pdf/renderer';

import { theme } from '../theme';

interface ImpactDotsProps {
  value: 1 | 2 | 3 | 4 | 5;
  label: string;
}

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
            style={{
              fill:
                i < value
                  ? theme.colors.accent
                  : theme.colors.bgCardHover,
            }}
          />
        ))}
      </Svg>
    </View>
  );
}

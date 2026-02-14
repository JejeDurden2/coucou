import { View, Text, Svg, Circle } from '@react-pdf/renderer';

import { theme, SEVERITY_COLORS, SEVERITY_LABELS } from '../theme';

interface SeverityBadgeProps {
  severity: 'critical' | 'warning' | 'info';
}

export function SeverityBadge({
  severity,
}: SeverityBadgeProps): React.JSX.Element {
  const color = SEVERITY_COLORS[severity] ?? theme.colors.textMuted;
  const label = SEVERITY_LABELS[severity] ?? severity;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Svg width={8} height={8} viewBox="0 0 8 8">
        <Circle cx={4} cy={4} r={4} style={{ fill: color }} />
      </Svg>
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.xs,
          color,
          fontWeight: 700,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

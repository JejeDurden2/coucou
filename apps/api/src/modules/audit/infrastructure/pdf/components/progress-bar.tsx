import { View, Text } from '@react-pdf/renderer';

import { theme, getScoreColor } from '../theme';

interface ProgressBarProps {
  score: number;
  label: string;
  width?: number;
}

export function ProgressBar({
  score,
  label,
  width,
}: ProgressBarProps): React.JSX.Element {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = getScoreColor(clampedScore);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        width,
      }}
    >
      {/* Label */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: 10,
          color: theme.colors.textPrimary,
          width: 100,
        }}
      >
        {label}
      </Text>

      {/* Bar container */}
      <View
        style={{
          flex: 1,
          height: 8,
          backgroundColor: theme.colors.bgCardHover,
          borderRadius: 4,
          marginHorizontal: 8,
        }}
      >
        {/* Bar fill */}
        <View
          style={{
            height: 8,
            width: `${clampedScore}%`,
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      </View>

      {/* Score value */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: 10,
          fontWeight: 700,
          color: theme.colors.textPrimary,
          width: 25,
          textAlign: 'right',
        }}
      >
        {clampedScore}
      </Text>
    </View>
  );
}

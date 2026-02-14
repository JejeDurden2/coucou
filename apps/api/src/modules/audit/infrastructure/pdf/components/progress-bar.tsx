import { View, Text } from '@react-pdf/renderer';

import { theme, getScoreColor } from '../theme';

interface ProgressBarProps {
  score: number;
  label: string;
  width?: number;
  variant?: 'horizontal' | 'vertical'; // Support pour orientation verticale brutalist
}

export function ProgressBar({
  score,
  label,
  width,
  variant = 'horizontal',
}: ProgressBarProps): React.JSX.Element {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = getScoreColor(clampedScore);

  // Vertical variant pour layouts brutalist
  if (variant === 'vertical') {
    return (
      <View style={{ width: width ?? 60, marginBottom: 12 }}>
        {/* Label au-dessus */}
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.tiny,
            fontWeight: 700,
            color: theme.colors.textMuted,
            marginBottom: 4,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>

        {/* Bar vertical - bloc architectural */}
        <View
          style={{
            height: 60,
            width: '100%',
            backgroundColor: theme.colors.bgCardHover,
            position: 'relative',
          }}
        >
          {/* Fill depuis le bas */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${clampedScore}%`,
              backgroundColor: color,
            }}
          />
        </View>

        {/* Score en monospace */}
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.base,
            fontWeight: 700,
            color: theme.colors.textPrimary,
            marginTop: 4,
          }}
        >
          {clampedScore}
        </Text>
      </View>
    );
  }

  // Horizontal variant - plus épais et brutal
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        width,
      }}
    >
      {/* Label - monospace */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.tiny,
          fontWeight: 700,
          color: theme.colors.textMuted,
          width: 60,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>

      {/* Bar container - plus épais (20px au lieu de 8px) */}
      <View
        style={{
          flex: 1,
          height: 20,
          backgroundColor: theme.colors.bgCardHover,
          marginHorizontal: 8,
        }}
      >
        {/* Bar fill - bloc de couleur brutal */}
        <View
          style={{
            height: 20,
            width: `${clampedScore}%`,
            backgroundColor: color,
          }}
        />
      </View>

      {/* Score value - monospace */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.base,
          fontWeight: 700,
          color: theme.colors.textPrimary,
          width: 30,
          textAlign: 'right',
        }}
      >
        {clampedScore}
      </Text>
    </View>
  );
}

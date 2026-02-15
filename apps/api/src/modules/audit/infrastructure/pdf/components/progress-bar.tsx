import { View, Text } from '@react-pdf/renderer';

import { theme, getScoreColor } from '../theme';

interface ProgressBarProps {
  score: number;
  label: string;
  width?: number;
  variant?: 'horizontal' | 'vertical'; // Support pour orientation verticale brutalist
}

/**
 * ProgressBar - Massive brutalist progress indicator with dual orientations
 *
 * Renders thick, angular progress bars in horizontal or vertical layouts. Features
 * uppercase mono labels, bold score numerics, and dynamic color fills. Designed for
 * architectural data visualization in brutalist PDF reports.
 *
 * @param score - Numeric value between 0-100 representing progress (auto-clamped)
 * @param label - Uppercase mono text label (e.g., "SEO", "PERF", "SECURITY")
 * @param width - Optional container width in pixels (defaults to full width for horizontal, 60px for vertical)
 * @param variant - Orientation: 'horizontal' (default, 20px thick bar) or 'vertical' (60px tall bar)
 *
 * @example
 * ```tsx
 * <ProgressBar score={75} label="Technical" variant="horizontal" width={300} />
 * ```
 *
 * @example
 * ```tsx
 * <ProgressBar score={92} label="Content" variant="vertical" />
 * ```
 */
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
            flexDirection: 'column',
          }}
        >
          {/* Empty track en haut */}
          {clampedScore < 100 && (
            <View
              style={{
                flex: 100 - clampedScore,
                backgroundColor: theme.colors.bgCardHover,
              }}
            />
          )}
          {/* Fill en bas */}
          {clampedScore > 0 && (
            <View
              style={{
                flex: clampedScore,
                backgroundColor: color,
              }}
            />
          )}
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
          flexDirection: 'row',
          marginHorizontal: 8,
        }}
      >
        {/* Bar fill - bloc de couleur brutal */}
        {clampedScore > 0 && (
          <View
            style={{
              flex: clampedScore,
              height: 20,
              backgroundColor: color,
            }}
          />
        )}
        {/* Bar empty track */}
        {clampedScore < 100 && (
          <View
            style={{
              flex: 100 - clampedScore,
              height: 20,
              backgroundColor: theme.colors.bgCardHover,
            }}
          />
        )}
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

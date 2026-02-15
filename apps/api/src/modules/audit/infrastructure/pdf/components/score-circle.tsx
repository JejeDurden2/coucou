import { View, Text, Svg, Circle, Path } from '@react-pdf/renderer';
import { Text as SvgText } from '@react-pdf/renderer';

import { theme, getScoreColor } from '../theme';

interface ScoreCircleProps {
  score: number;
  size: 'large' | 'medium' | 'small';
  label?: string;
}

const SIZE_MAP = {
  large: { diameter: 140, strokeWidth: 10, scoreFontSize: 36, subFontSize: 10 },
  medium: { diameter: 90, strokeWidth: 8, scoreFontSize: 24, subFontSize: 8 },
  small: { diameter: 50, strokeWidth: 5, scoreFontSize: 14, subFontSize: 6 },
} as const;

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

/**
 * ScoreCircle - Brutalist circular progress indicator with score display
 *
 * Renders a radial progress arc with angular design, featuring mono font numerics,
 * concentric halo effects, and dynamic color coding based on score thresholds.
 * Designed for high-contrast, data-dense PDF layouts.
 *
 * @param score - Numeric value between 0-100 representing the score (auto-clamped)
 * @param size - Visual size preset: 'large' (140px), 'medium' (90px), or 'small' (50px)
 * @param label - Optional text label displayed below the circle for context
 *
 * @example
 * ```tsx
 * <ScoreCircle score={85} size="large" label="Overall Score" />
 * ```
 *
 * @example
 * ```tsx
 * <ScoreCircle score={42} size="medium" />
 * ```
 */
export function ScoreCircle({
  score,
  size,
  label,
}: ScoreCircleProps): React.JSX.Element {
  const config = SIZE_MAP[size];
  const { diameter, strokeWidth, scoreFontSize, subFontSize } = config;
  const cx = diameter / 2;
  const cy = diameter / 2;
  const r = (diameter - strokeWidth) / 2;
  const clampedScore = Math.max(0, Math.min(100, score));
  const sweepAngle = (clampedScore / 100) * 360;
  const color = getScoreColor(clampedScore);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`}>
        {/* Track (full circle background) */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={theme.colors.bgCardHover}
          strokeWidth={strokeWidth}
        />

        {/* Score arc */}
        {clampedScore > 0 && (
          <Path
            d={describeArc(cx, cy, r, 0, sweepAngle)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}

        {/* Halo effects - cercles concentriques */}
        <Circle
          cx={cx}
          cy={cy}
          r={r + 4}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.2}
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r + 8}
          fill="none"
          stroke={color}
          strokeWidth={0.5}
          opacity={0.1}
        />

        {/* Score text - monospace pour data */}
        <SvgText
          x={cx}
          y={cy - subFontSize / 2}
          style={{
            fontSize: scoreFontSize,
            fontFamily: theme.fonts.mono,
            fontWeight: 700,
            fill: theme.colors.textPrimary,
            textAnchor: 'middle',
          }}
        >
          {String(clampedScore)}
        </SvgText>

        {/* /100 text */}
        <SvgText
          x={cx}
          y={cy + scoreFontSize / 2}
          style={{
            fontSize: subFontSize,
            fill: theme.colors.textMuted,
            textAnchor: 'middle',
          }}
        >
          /100
        </SvgText>
      </Svg>

      {label && (
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.sm,
            color: theme.colors.textMuted,
            marginTop: 4,
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

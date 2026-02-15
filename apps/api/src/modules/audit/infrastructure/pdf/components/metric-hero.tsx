import { View, Text } from '@react-pdf/renderer';

import { theme } from '../theme';

interface MetricHeroProps {
  value: string | number;
  label: string;
  variant?: 'accent' | 'success' | 'warning' | 'destructive';
  fullWidth?: boolean;
}

/**
 * MetricHero - Métrique proéminente
 *
 * Barre horizontale pleine largeur avec métrique massive (5xl size).
 * Impossible à manquer, crée un point focal immédiat sur la page.
 * Full bleed effect (déborde des marges) pour maximum impact.
 *
 * @param value - Valeur de la métrique (nombre ou string)
 * @param label - Label en majuscules (mono font, letterspacing 2)
 * @param variant - Couleur de fond (accent, success, warning, destructive)
 * @param fullWidth - Si true, déborde des marges de page (default: true)
 *
 * @example
 * ```tsx
 * <MetricHero
 *   value={75}
 *   label="SCORE GEO"
 *   variant="accent"
 * />
 * ```
 */
export function MetricHero({
  value,
  label,
  variant = 'accent',
  fullWidth = true,
}: MetricHeroProps): React.JSX.Element {
  const backgroundColor =
    variant === 'accent'
      ? theme.colors.accent
      : variant === 'success'
        ? theme.colors.success
        : variant === 'warning'
          ? theme.colors.warning
          : theme.colors.destructive;

  return (
    <View
      style={{
        backgroundColor,
        paddingVertical: 20,
        paddingHorizontal: 24,
        marginHorizontal: fullWidth ? -40 : 0, // Full bleed
        marginVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize['5xl'],
          fontWeight: 700,
          color: theme.colors.brutalWhite,
          lineHeight: 1,
          letterSpacing: -1,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.lg,
          fontWeight: 700,
          color: theme.colors.brutalWhite,
          textTransform: 'uppercase',
          opacity: 0.9,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

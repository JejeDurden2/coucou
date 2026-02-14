import { View, Text } from '@react-pdf/renderer';
import type { AnalysisPlatformPresence } from '@coucou-ia/shared';

import { theme } from '../theme';
import { ImpactDots } from './impact-dots';

interface PlatformRowProps {
  platform: AnalysisPlatformPresence;
}

const IMPACT_VALUE: Record<string, 1 | 2 | 3 | 4 | 5> = {
  high: 5,
  medium: 3,
  low: 1,
};

/**
 * PlatformRow - Tabular data row for external platform presence analysis
 *
 * Renders a bordered row displaying platform name, discovery status, and impact dots.
 * Features color-coded status indicators (green for found, muted for missing) and
 * automatic impact level conversion. Designed for scannable data tables in PDF reports.
 *
 * @param platform - Platform presence object containing name, found status, discovery status, and impact level
 *
 * @example
 * ```tsx
 * <PlatformRow
 *   platform={{
 *     platform: "Google Business Profile",
 *     found: true,
 *     status: "Réclamé et vérifié",
 *     impact: "high"
 *   }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <PlatformRow
 *   platform={{
 *     platform: "Yelp",
 *     found: false,
 *     status: "",
 *     impact: "medium"
 *   }}
 * />
 * ```
 */
export function PlatformRow({
  platform,
}: PlatformRowProps): React.JSX.Element {
  const impactValue = IMPACT_VALUE[platform.impact];

  // Warn if impact value is unknown
  if (!impactValue) {
    console.warn(
      `[PlatformRow] Unknown impact value: "${platform.impact}" for platform "${platform.platform}". Defaulting to 3 (medium).`,
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      {/* Platform name */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.base,
          color: theme.colors.textPrimary,
          width: 120,
        }}
      >
        {platform.platform}
      </Text>

      {/* Status */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.sm,
          color: platform.found
            ? theme.colors.success
            : theme.colors.textMuted,
          flex: 1,
        }}
      >
        {platform.found ? platform.status : 'Non trouvé'}
      </Text>

      {/* Impact dots */}
      <ImpactDots value={impactValue ?? 3} label="Impact" />
    </View>
  );
}

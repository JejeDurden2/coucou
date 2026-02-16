import { View, Text, Svg, Circle } from '@react-pdf/renderer';
import type { AnalysisPlatformPresence } from '@coucou-ia/shared';

import { theme, IMPACT_LABELS, IMPACT_COLORS } from '../theme';

interface PlatformRowProps {
  platform: AnalysisPlatformPresence;
}

function getImpactBadgeColor(
  found: boolean,
  impact: string,
): string {
  if (!found && (impact === 'high' || impact === 'medium')) {
    return theme.colors.destructive;
  }
  return IMPACT_COLORS[impact] ?? theme.colors.textMuted;
}

export function PlatformRow({
  platform,
}: PlatformRowProps): React.JSX.Element {
  const impactLabel = IMPACT_LABELS[platform.impact] ?? platform.impact;
  const badgeColor = getImpactBadgeColor(platform.found, platform.impact);

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
      {/* ✓/✗ icon */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.base,
          fontWeight: 700,
          color: platform.found
            ? theme.colors.success
            : theme.colors.destructive,
          width: 16,
        }}
      >
        {platform.found ? '✓' : '✗'}
      </Text>

      {/* Platform name */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.base,
          color: platform.found
            ? theme.colors.textPrimary
            : theme.colors.textMuted,
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

      {/* Impact badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', width: 80, justifyContent: 'flex-end' }}>
        <Svg width={6} height={6} viewBox="0 0 6 6">
          <Circle cx={3} cy={3} r={3} fill={badgeColor} />
        </Svg>
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.sm,
            fontWeight: 700,
            color: badgeColor,
            marginLeft: 4,
          }}
        >
          {impactLabel}
        </Text>
      </View>
    </View>
  );
}

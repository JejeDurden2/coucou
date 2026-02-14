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

export function PlatformRow({
  platform,
}: PlatformRowProps): React.JSX.Element {
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
      <ImpactDots
        value={IMPACT_VALUE[platform.impact] ?? 3}
        label="Impact"
      />
    </View>
  );
}

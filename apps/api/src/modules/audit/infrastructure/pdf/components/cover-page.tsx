import { Page, View, Text } from '@react-pdf/renderer';

import { theme, baseStyles } from '../theme';
import { CoucouLogo } from './coucou-logo';
import { ScoreCircle } from './score-circle';

interface CoverPageProps {
  brandName: string;
  brandDomain: string;
  geoScore: number;
  date: Date;
}

export function CoverPage({
  brandName,
  brandDomain,
  geoScore,
  date,
}: CoverPageProps): React.JSX.Element {
  const formattedDate = date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Page size="A4" style={baseStyles.page}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <CoucouLogo width={120} />

        {/* Accent divider */}
        <View
          style={{
            ...baseStyles.accentDivider,
            alignSelf: 'center',
            marginTop: 24,
          }}
        />

        {/* Title */}
        <Text
          style={{
            fontFamily: theme.fonts.display,
            fontSize: theme.fontSize['2xl'],
            fontWeight: 700,
            color: theme.colors.textPrimary,
            marginBottom: 12,
          }}
        >
          AUDIT DE VISIBILITÉ IA
        </Text>

        {/* Brand name */}
        <Text
          style={{
            fontFamily: theme.fonts.display,
            fontSize: theme.fontSize['4xl'],
            fontWeight: 700,
            color: theme.colors.accent,
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          {brandName}
        </Text>

        {/* Domain */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.lg,
            color: theme.colors.textMuted,
            marginBottom: 32,
          }}
        >
          {brandDomain}
        </Text>

        {/* Score Circle */}
        <ScoreCircle score={geoScore} size="large" label="Score GEO" />

        {/* Date + prepared by */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.sm,
            color: theme.colors.textMuted,
            marginTop: 32,
          }}
        >
          {formattedDate} • Préparé par Coucou IA
        </Text>

        {/* Confidential */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.xs,
            color: theme.colors.textMuted,
            marginTop: 16,
            letterSpacing: 4,
          }}
        >
          CONFIDENTIEL
        </Text>
      </View>
    </Page>
  );
}

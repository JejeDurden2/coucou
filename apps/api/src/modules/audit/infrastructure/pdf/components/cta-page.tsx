import { Page, View, Text, Link } from '@react-pdf/renderer';

import { theme, baseStyles } from '../theme';
import { CoucouLogo } from './coucou-logo';

interface CtaPageProps {
  totalActions: number;
}

export function CtaPage({ totalActions }: CtaPageProps): React.JSX.Element {
  return (
    <Page size="A4" style={baseStyles.page} break>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 40,
        }}
      >
        {/* Main headline */}
        <Text
          style={{
            fontFamily: theme.fonts.display,
            fontSize: theme.fontSize['3xl'],
            fontWeight: 700,
            color: theme.colors.accent,
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          PASSEZ À L'ACTION
        </Text>

        {/* Dynamic text */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.lg,
            color: theme.colors.textPrimary,
            textAlign: 'center',
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          {`Ce rapport identifie ${totalActions} optimisations pour améliorer votre visibilité dans les réponses IA.`}
        </Text>

        {/* Service description */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.base,
            color: theme.colors.textMuted,
            textAlign: 'center',
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          Coucou IA peut exécuter ces recommandations automatiquement sur votre
          site.
        </Text>

        {/* Link */}
        <Link
          src="https://coucou-ia.com"
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.lg,
            color: theme.colors.accent,
            textDecoration: 'underline',
            marginBottom: 40,
          }}
        >
          coucou-ia.com
        </Link>

        {/* Accent divider */}
        <View style={{ ...baseStyles.accentDivider, alignSelf: 'center' }} />

        {/* Logo */}
        <View style={{ marginBottom: 12 }}>
          <CoucouLogo width={80} />
        </View>

        {/* Tagline */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.sm,
            color: theme.colors.textMuted,
          }}
        >
          Le GEO, c'est le nouveau SEO.
        </Text>
      </View>
    </Page>
  );
}

import { Page, View, Text, Link } from '@react-pdf/renderer';

import { theme, baseStyles } from '../theme';
import { BrutalGrid } from './brutal-grid';
import { CoucouLogo } from './coucou-logo';
import { TypeSlab } from './type-slab';

interface CtaPageProps {
  totalActions: number;
}

export function CtaPage({ totalActions }: CtaPageProps): React.JSX.Element {
  return (
    <Page size="A4" style={baseStyles.page} break>
      {/* Grille technique subtile */}
      <BrutalGrid variant="subtle" />

      {/* Layout asymétrique - tout à gauche */}
      <View
        style={{
          width: '65%',
          paddingTop: 80,
        }}
      >
        {/* Titre MASSIF aligné à gauche */}
        <TypeSlab text="PASSEZ" size="massive" align="left" />
        <TypeSlab text="À L'ACTION" size="massive" align="left" />

        {/* Espace brutal */}
        <View style={{ height: 60 }} />

        {/* Texte en 2 colonnes inégales */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 32 }}>
          <View style={{ width: '70%' }}>
            <Text
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: theme.fontSize.base,
                color: theme.colors.textPrimary,
                lineHeight: 1.5,
              }}
            >
              {`Ce rapport identifie ${totalActions} optimisations pour améliorer votre visibilité.`}
            </Text>
          </View>

          <View style={{ width: '30%' }}>
            <Text
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: theme.fontSize.sm,
                color: theme.colors.textMuted,
                lineHeight: 1.5,
              }}
            >
              Coucou IA peut exécuter ces recommandations automatiquement.
            </Text>
          </View>
        </View>

        {/* URL comme point focal avec règle */}
        <View style={{ marginBottom: 8 }}>
          <Link
            src="https://coucou-ia.com"
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: theme.fontSize['2xl'],
              fontWeight: 700,
              color: theme.colors.accent,
              textDecoration: 'none',
            }}
          >
            coucou-ia.com
          </Link>
        </View>

        {/* Règle décorative */}
        <View
          style={{
            width: 120,
            height: 3,
            backgroundColor: theme.colors.accent,
            marginBottom: 40,
          }}
        />
      </View>

      {/* Zone vide dramatique - 40% */}
      <View style={{ flex: 1 }} />

      {/* Tagline en bas à gauche */}
      <View
        style={{
          position: 'absolute',
          bottom: 40,
          left: 40,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.base,
            fontWeight: 700,
            color: theme.colors.textMuted,
            letterSpacing: 1,
          }}
        >
          LE GEO, C'EST LE NOUVEAU SEO.
        </Text>
      </View>

      {/* Logo en bas à droite */}
      <View
        style={{
          position: 'absolute',
          bottom: 40,
          right: 40,
        }}
      >
        <CoucouLogo width={60} />
      </View>
    </Page>
  );
}

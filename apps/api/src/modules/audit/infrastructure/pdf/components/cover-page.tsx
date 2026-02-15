import { Page, View, Text } from '@react-pdf/renderer';

import { theme, baseStyles } from '../theme';
import { BrutalGrid } from './brutal-grid';
import { CoucouLogo } from './coucou-logo';
import { ScoreCircle } from './score-circle';
import { TypeSlab } from './type-slab';

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
      {/* Grille technique visible en arrière-plan */}
      <BrutalGrid variant="subtle" />

      {/* Content container - asymétrique, aligné à gauche */}
      <View
        style={{
          width: '70%', // 70% de la page, 30% vide à droite
          paddingTop: 60,
        }}
      >
        {/* Titre MASSIF écrasant */}
        <TypeSlab text="AUDIT" size="massive" align="left" overflow />
        <TypeSlab text="VISIBILITÉ" size="massive" align="left" overflow />
        <TypeSlab text="IA" size="massive" align="left" overflow />

        {/* Espace brutal */}
        <View style={{ height: 40 }} />

        {/* Brand name - responsive font size for long names */}
        <View style={{ marginLeft: -10, marginBottom: 8 }}>
          <Text
            style={{
              fontFamily: theme.fonts.mono,
              fontSize:
                brandName.length > 30
                  ? theme.fontSize['3xl']
                  : theme.fontSize['4xl'],
              fontWeight: 700,
              color: theme.colors.accent,
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            {brandName}
          </Text>
        </View>

        {/* Domain - monospace technique */}
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.sm,
            color: theme.colors.textMuted,
            marginBottom: 32,
          }}
        >
          {brandDomain}
        </Text>

        {/* Score Circle ÉNORME avec overlap */}
        <View
          style={{
            marginLeft: -20,
            marginTop: 20,
          }}
        >
          <ScoreCircle score={geoScore} size="large" label="SCORE GEO" />
        </View>
      </View>

      {/* Zone vide brutale - 40% en bas */}
      <View style={{ flex: 1 }} />

      {/* Métadonnées ultra-small empilées verticalement - coin bas gauche */}
      <View
        style={{
          position: 'absolute',
          bottom: 40,
          left: 40,
          gap: 4,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.tiny,
            color: theme.colors.textMuted,
            letterSpacing: 1,
          }}
        >
          {formattedDate}
        </Text>
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.tiny,
            color: theme.colors.textMuted,
            letterSpacing: 1,
          }}
        >
          PRÉPARÉ PAR COUCOU IA
        </Text>
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.tiny,
            color: theme.colors.destructive,
            letterSpacing: 3,
            marginTop: 8,
          }}
        >
          CONFIDENTIEL
        </Text>
      </View>

      {/* Logo minuscule - coin bas droite (inverse conventionnel) */}
      <View
        style={{
          position: 'absolute',
          bottom: 40,
          right: 40,
        }}
      >
        <CoucouLogo width={40} />
      </View>
    </Page>
  );
}

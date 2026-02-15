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
      {/* Layout vertical centré avec espaces généreux */}
      <View style={{ alignItems: 'center', paddingTop: 150 }}>
        {/* Logo Coucou IA */}
        <CoucouLogo width={100} />

        {/* Espacement 20mm */}
        <View style={{ height: 57 }} />

        {/* Trait violet */}
        <View
          style={{
            width: 60,
            height: 2,
            backgroundColor: theme.colors.accent,
          }}
        />

        {/* Espacement 15mm */}
        <View style={{ height: 43 }} />

        {/* Titre sur 2 lignes contrôlées */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize['2xl'],
            color: theme.colors.textMuted,
            textAlign: 'center',
          }}
        >
          AUDIT DE
        </Text>
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 32,
            fontWeight: 700,
            color: theme.colors.brutalWhite,
            textAlign: 'center',
          }}
        >
          VISIBILITÉ IA
        </Text>

        {/* Espacement 25mm */}
        <View style={{ height: 71 }} />

        {/* Nom de la marque */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize['3xl'],
            color: theme.colors.accent,
            textAlign: 'center',
          }}
        >
          {brandName}
        </Text>

        {/* Domaine */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 12,
            color: theme.colors.textMuted,
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          {brandDomain}
        </Text>

        {/* Espacement 30mm */}
        <View style={{ height: 85 }} />

        {/* Score Circle */}
        <ScoreCircle score={geoScore} size="large" />

        {/* Espacement 15mm */}
        <View style={{ height: 43 }} />

        {/* Date */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 10,
            color: theme.colors.textMuted,
            textAlign: 'center',
          }}
        >
          {formattedDate}
        </Text>

        {/* Préparé par */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 9,
            color: theme.colors.textMuted,
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          Préparé par Coucou IA
        </Text>

        {/* Espacement 10mm */}
        <View style={{ height: 28 }} />

        {/* Confidentiel */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 8,
            color: theme.colors.textMuted,
            textAlign: 'center',
            letterSpacing: 3,
          }}
        >
          CONFIDENTIEL
        </Text>
      </View>
    </Page>
  );
}

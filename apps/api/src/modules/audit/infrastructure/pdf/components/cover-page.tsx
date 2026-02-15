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
      {/* Layout vertical centré — espaces proportionnels pour tenir sur 1 page */}
      <View style={{ alignItems: 'center', paddingTop: 100 }}>
        {/* Logo Coucou IA */}
        <CoucouLogo width={100} />

        <View style={{ height: 50 }} />

        {/* Trait violet */}
        <View
          style={{
            width: 60,
            height: 2,
            backgroundColor: theme.colors.accent,
          }}
        />

        <View style={{ height: 36 }} />

        {/* Titre sur 2 lignes contrôlées — pas de césure */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize['2xl'],
            color: theme.colors.textMuted,
            textAlign: 'center',
            lineHeight: 1.1,
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
            lineHeight: 1.1,
          }}
        >
          VISIBILITÉ IA
        </Text>

        <View style={{ height: 55 }} />

        {/* Nom de la marque */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize['3xl'],
            color: theme.colors.accent,
            textAlign: 'center',
            lineHeight: 1.1,
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
            lineHeight: 1.1,
          }}
        >
          {brandDomain}
        </Text>

        <View style={{ height: 65 }} />

        {/* Score Circle */}
        <ScoreCircle score={geoScore} size="large" />

        <View style={{ height: 36 }} />

        {/* Date */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 10,
            color: theme.colors.textMuted,
            textAlign: 'center',
            lineHeight: 1.1,
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
            lineHeight: 1.1,
          }}
        >
          Préparé par Coucou IA
        </Text>

        <View style={{ height: 24 }} />

        {/* Confidentiel */}
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 8,
            color: theme.colors.textMuted,
            textAlign: 'center',
            letterSpacing: 3,
            lineHeight: 1.1,
          }}
        >
          CONFIDENTIEL
        </Text>
      </View>
    </Page>
  );
}
